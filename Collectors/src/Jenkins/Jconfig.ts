export const Jconfig = {
	name: "Jenkins",
};

export interface IJenkinsJobInfo {
	teamId: string;
	servicePath: string;
	toolName: string;
	url: {value: string};
	userName: {value: string};
	password: {value: string};
	job: {value: string[]; options: {[key: string]: string}};
	startStage: {value: string};
	endStage: {value: string};
	rollbackStage: {value: string};
	failureWindow: {value: number};
}
