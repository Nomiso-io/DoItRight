export const Jconfig = {
	name: "JIRA",
};

export interface IJIRAJobInfo {
	teamId: string;
	servicePath: string;
	toolName: string;
	projectName: {value: string[]; options: {[key: string]: string}};
	url: {value: string};
	email: {value: string};
	appToken: {value: string};
	items: {value: string[]; options: {[key: string]: string}};
	newState: {value: string; options: {[key: string]: string}};
	startState: {value: string; options: {[key: string]: string}};
	closeState: {value: string; options: {[key: string]: string}};
}
