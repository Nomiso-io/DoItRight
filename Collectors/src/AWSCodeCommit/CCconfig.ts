export const CCconfig = {
	name: "AWSCodeCommit"
};

export interface IAWSCodeCommitJobInfo {
	teamId: string;
	servicePath: string;
	toolName: string;
	url: {value: string};
	userName: {value: string};
	password: {value: string};
	region: {value: string};
	repoName: {value: string[]; options: {[key: string]: string}};
}
