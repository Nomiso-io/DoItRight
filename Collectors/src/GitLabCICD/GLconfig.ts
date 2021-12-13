export const GLconfig = {
	name: "GitLabCICD",
};

export interface IGitLabCICDJobInfo {
	teamId: string;
	servicePath: string;
	toolName: string;
	projectName: {value: string[]; options: {[key: string]: string}};
	url: {value: string};
	appToken: {value: string};
	startStage: {value: string};
	endStage: {value: string};
	rollbackStage: {value: string};
	failureWindow: {value: number};
}
