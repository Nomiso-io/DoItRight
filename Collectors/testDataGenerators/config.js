exports.config = {
	env: 'dev',
	region: 'us-east-1',
	elasticSearchURL: 'http://localhost:9200',
	elasticSearchUser: 'doitright-user',
	elasticSearchPass: '',

	teamTable: 'Team',

	stateIndex: 'state-data',

	buildIndex: 'build-data',
	qualityIndex: 'quality-data',
	repoIndex: 'repo-data',
	reqIndex: 'req-data',
	incidentIndex: 'incident-data',
	gitlabCommitIndex: 'gitlab-commit-data'
};
