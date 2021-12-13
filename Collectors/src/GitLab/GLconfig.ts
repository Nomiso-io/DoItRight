export const GLconfig = {
	name: "GitLab",
};

export interface IGitLabJobInfo {
	teamId: string;
	servicePath: string;
	toolName: string;
	projectName: { value: string[]; options: { [key: string]: string } };
	ref: { value: string };
	url: { value: string };
	appToken: { value: string };
}
