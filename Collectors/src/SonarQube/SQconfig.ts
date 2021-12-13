export const SQconfig = {
	name: "SonarQube",
};

export interface ISonarJobInfo {
	teamId: string;
	servicePath: string;
	toolName: string;
	projectName: {value: string[]; options: {[key: string]: string}};
	url: {value: string};
	userName: {value: string};
	appToken: {value: string};
	metrics: {value: string[]; options: {[key: string]: string}};
}
