import AWS from 'aws-sdk';
import { appLogger, config, getTableNameForOrg } from '../utils';
import * as esDBFuncs from '../elasticsearch/esFuncs';
import { RepoDatabaseDataItem, STATUS_CLOSED, STATUS_OPEN, STATE_ACCEPTED, STATE_REJECTED } from '../models';
import { /*CCconfig, */IAWSCodeCommitJobInfo } from './CCconfig';
//import { getLastState, setLastState } from '../state'; //TODO: check how to use this to increase efficiency
//import DynamoDB from './dynamoDBFunctions' ;

//const COLLECTOR_NAME = 'AWSCodeCommitCollector';

//const STATUS_CLOSED = 'CLOSED';
//const STATE_ACCEPTED = 'ACCEPTED';
//const STATE_REJECTED = 'REJECTED';

interface ESRepoDatabaseDataItem {
  _id: string;
  _index: string;
  _score: number;
  _source: RepoDatabaseDataItem;
  _type: string;
}

module.exports = (input: any, callback: (err: any, data: any) => void) => {
	try {
		appLogger.info('AWSCodeCommit Collector executing', {input: input});
		getDataFor(input)
		.then(() => callback(null, "AWSCodeCommit Collector exiting"));
	} catch(err) {
		appLogger.error(err);
		callback(new Error("AWSCodeCommit Collector existed with error"), null);
	}
}

/*
function execute(jobs) {
	for (var i = 0; i < jobs.length; i++) {
//		appLogger.info("Job " + i);
//		appLogger.info(jobs[i]);
		getDataFor(jobs[i]);
	}
	return true;
}
*/

async function getDataFor(jobDetails: IAWSCodeCommitJobInfo) {
	let options = {
		'apiVersion': '2015-04-13',
		'region': jobDetails.region.value,
		'endpoint': jobDetails.url.value,
		'accessKeyId': jobDetails.userName.value,
		'secretAccessKey': jobDetails.password.value
	}
	const codecommit: AWS.CodeCommit = new AWS.CodeCommit(options);

	let repos: string[] = jobDetails.repoName.value;
	if((repos.length > 0) && (repos[0] === 'All')) {
		repos = Object.keys(jobDetails.repoName.options);
	}
	repos.forEach((repo: string) => {
		getAllPullData(codecommit, jobDetails, repo);
	})

}

function getAllPullData(ccHandle: AWS.CodeCommit, jobDetails: IAWSCodeCommitJobInfo, repoName: string) {
	const params = {
		repositoryName: repoName
	};
	ccHandle.listPullRequests(params, function(err: AWS.AWSError, data: AWS.CodeCommit.ListPullRequestsOutput) {
		if (err) {
			appLogger.error(err, err.stack);
		} else {
			appLogger.info(data);
			data.pullRequestIds.forEach(async (id: string) => {
				//don't fetch data again if the pull request is already fetched and its status is closed
				var filters = {
					term: {
						teamId: jobDetails.teamId.toLowerCase(),
						projectName: repoName.toLowerCase(),
						pullId: parseInt(id, 10),
						status: STATUS_CLOSED.toLowerCase()
					}
				};
				const result: ESRepoDatabaseDataItem[] = await esDBFuncs.searchAll(getTableNameForOrg(config.repoIndex), filters, []);
				if(!result || result.length === 0) {
					getPullData(ccHandle, jobDetails, repoName, id);
				}
			});
		}
	});
}

function getPullData(ccHandle: AWS.CodeCommit, jobDetails: IAWSCodeCommitJobInfo, repoName: string, pullId: string) {
	const params = {
		pullRequestId: pullId
	};
	ccHandle.getPullRequest(params, function(err: AWS.AWSError, data: AWS.CodeCommit.GetPullRequestOutput) {
		if (err) {
			appLogger.error(err, err.stack);
		} else {
//			appLogger.log(data);
//			appLogger.log(data.pullRequest.pullRequestTargets);
//			storePullDataInDB(repoName, data.pullRequest);
			if(data.pullRequest.pullRequestTargets) {
				data.pullRequest.pullRequestTargets.forEach( (target: AWS.CodeCommit.PullRequestTarget) => {
					if(target.sourceCommit) {
						if (target.destinationReference === 'refs/heads/master') {
							getCommitData(ccHandle, jobDetails, repoName, data.pullRequest, target.sourceCommit, target.mergeMetadata);
//						} else {
//							getCommitData(ccHandle, teamId, repoName, region, data.pullRequest, target.sourceCommit, undefined);
						}
					}
	//				getCommitData(ccHandle, repoName, getBranchNameFromPath(target.sourceReference), target.sourceCommit);
	//				getCommitData(ccHandle, repoName, getBranchNameFromPath(target.destinationReference), target.destinationCommit);
	//				if(target.mergeMetadata.isMerged) {
	//					getCommitData(ccHandle, repoName, getBranchNameFromPath(target.destinationReference), target.mergeMetadata.mergeCommitId);
	//				}
				});
//			} else {
//				storePullDataInDB(teamId, repoName, region, data.pullRequest, null, null, null);
			}
		}
	});
}
/*
function getLastCommitOfBranch(ccHandle, repoName, branchName) {
	var params = {
		branchName: branchName,
		repositoryName: repoName
	};
	ccHandle.getBranch(params, function(err, data) {
		if (err) {
			appLogger.log(err, err.stack);
		} else {
			getCommitData(ccHandle, repoName, data.branch.commitId);
		}
	});
}

async function getCommitData(ccHandle, repoName, branchName, commitId) {
	//don't fetch data again if the commit details is already fetched
	const query = {
		"projectName": repoName,
		"branchName": branchName,
		"commitId": commitId
	}
	result = await MongoDB.getByQuery(config.env + "_" + CCconfig.codeCommitTable, query);
	if(!result || result.length === 0) {
		var params = {
			commitId: commitId,
			repositoryName: repoName
		};
		ccHandle.getCommit(params, function(err, data) {
			if (err) {
				appLogger.log(err, err.stack);
			} else {
				storeCommitDataInDB(repoName, branchName, data.commit);
			}
		});
	}
}
*/
function getCommitData(ccHandle: AWS.CodeCommit, jobDetails: IAWSCodeCommitJobInfo, repoName: string, pullData: AWS.CodeCommit.PullRequest, sourceCommitId: string, mergeMetadata:  AWS.CodeCommit.MergeMetadata | undefined) {
	var params = {
		commitId: sourceCommitId,
		repositoryName: repoName
	};
	ccHandle.getCommit(params, function(err: AWS.AWSError, data: AWS.CodeCommit.GetCommitOutput) {
		if (err) {
			appLogger.error(err, err.stack);
		} else {
			storePullDataInDB(jobDetails, repoName, pullData, data.commit, mergeMetadata);
		}
	});
}

async function storePullDataInDB(jobDetails: IAWSCodeCommitJobInfo, repoName: string, pullDetails: AWS.CodeCommit.PullRequest, sourceCommitDetails: AWS.CodeCommit.Commit | undefined, mergeMetadata:  AWS.CodeCommit.MergeMetadata | undefined) {
	if(pullDetails.pullRequestId && pullDetails.creationDate) {
		//if the same pull request with the same status already exists then update it otherwise insert it
		const filters: any[] = [
			{ term: { teamId: jobDetails.teamId } },
			{ term: { servicePath: jobDetails.servicePath } },
			{ term: { projectName: repoName } },
			{ term: { pullId: parseInt(pullDetails.pullRequestId, 10) } }
		];

		const item: RepoDatabaseDataItem = {
			teamId: jobDetails.teamId,
			servicePath: jobDetails.servicePath,
			projectName: repoName,
			pullId: parseInt(pullDetails.pullRequestId, 10),
			repoName: repoName,
			status: pullDetails.pullRequestStatus ? pullDetails.pullRequestStatus : STATUS_OPEN,
			url: `https://console.aws.amazon.com/codesuite/codecommit/repositories?region=${jobDetails.region.value}`,
			raisedOn: Math.floor(pullDetails.creationDate.getTime() / 1000), 
			raisedBy: (sourceCommitDetails && sourceCommitDetails.committer && sourceCommitDetails.committer.name) ? sourceCommitDetails.committer.name : 'unknown',
		}
		if(pullDetails.pullRequestStatus === STATUS_CLOSED) {
			item.acceptState = (mergeMetadata && mergeMetadata.isMerged) ? STATE_ACCEPTED : STATE_REJECTED;
			item.reviewedOn = pullDetails.lastActivityDate ? Math.floor(pullDetails.lastActivityDate.getTime() / 1000) : Math.floor(pullDetails.creationDate.getTime() / 1000);
		}
		appLogger.info("Storing Pull item :", item);
		await esDBFuncs.updateOrInsert(getTableNameForOrg(config.repoIndex), filters, [], item);
	}
}

/*
function storePullDataInDB(repoName, pullDetails) {
	//if the same pull request with the same status already exists then update it otherwise insert it
	var query = {
		"projectName": repoName,
		"pullRequestId": pullDetails.pullRequestId,
		"pullRequestStatus": pullDetails.pullRequestStatus
	};
	const item = {
		"projectName": repoName,
		"pullRequestId": pullDetails.pullRequestId,
		"pullRequestStatus": pullDetails.pullRequestStatus,
		"details": pullDetails,
	}
	appLogger.info("Storing Pull item :", item);
//	MongoDB.update(config.env + "_" + CCconfig.codeCommitTable, query, item);
}
*/
/*
function storeCommitDataInDB(repoName, branchName, commitDetails) {
	const item = {
		"projectName": repoName,
		"branchName": branchName,
		"commitId": commitDetails.commitId,
//		committer: commitDetails.committer.name,
		"details": commitDetails
	}
	appLogger.info("Storing Commit item :", item);
//	MongoDB.insert(config.env + "_" + CCconfig.codeCommitTable, item);
}

function getBranchNameFromPath(headsPath) {
	//keeps only the part of string after the last occurance of '/'
	return headsPath.substring(headsPath.lastIndexOf('/'));
}
*/
