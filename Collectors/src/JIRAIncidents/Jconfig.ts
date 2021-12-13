export const Jconfig = {
	name: "JIRAIncidents",
};

export interface IJIRAIncidentsJobInfo {
	teamId: string;
	servicePath: string;
	toolName: string;
	projectName: {value: string[]; options: {[key: string]: string}};
	url: {value: string};
	email: {value: string};
	appToken: {value: string};
	serviceMappingKey: {value: string; options: {[key: string]: string}};
//	serviceMappingValue: {value: string};
	serviceMappingValue: {value: string; options: {[key: string]: string}};
	incidentStartKey: {value: string; options: {[key: string]: string}};
	incidentEndKey: {value: string; options: {[key: string]: string}};
}
