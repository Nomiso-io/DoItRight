export const BBconfig = {
	name: "BitBucket",
};

export interface IBitBucketJobInfo {
	teamId: string;
	servicePath: string;
	toolName: string;
	projectName: {value: string[]; options: {[key: string]: string}};
	url: {value: string};
	email: {value: string};
	appToken: {value: string};
}
