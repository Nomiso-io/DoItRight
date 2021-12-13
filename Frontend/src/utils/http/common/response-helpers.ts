export interface IWithResponseParams {
    processResponse: <R>(response: Response) => Promise<R>;
}

export type Action<
    TResult,
    R extends IWithResponseParams = IWithResponseParams> = (params: R) =>
        Promise<{ data: TResult, response: Response }>

export const withResponse = <TResult, R extends IWithResponseParams>(
    action: Action<TResult, R>,
    params: R): Promise<{ data: TResult, response: Response }> => {
    const processResponse = (response: Response) => {
        return params.processResponse<TResult>(response)
            .then((data: TResult) => {
                return {
                    data,
                    response
                };
            });
    };

    const withResponseParams = {
        ...(params as object),
        processResponse
    } as R;

    return action(withResponseParams);
};

export const withTextFileResponse = <R extends IWithResponseParams>(
    action: Action<string, R>,
    params: R,
    fileNameHeader: string) => {
    const processResponse = (response: Response) => response.text();

    const withResponseParams = {
        ...(params as object),
        processResponse
    } as R;

    return withResponse<string, R>(action, withResponseParams)
        .then(({ data, response }) => {
            return {
                data,
                fileName: response.headers.get(fileNameHeader)
            };
        });
}

export const withBlobFileResponse = <R extends IWithResponseParams>(
    action: Action<Blob, R>,
    params: R,
    fileNameHeader: string) => {
    const processResponse = (response: Response) => response.blob();

    const withResponseParams = {
        ...(params as object),
        processResponse
    } as R;

    return withResponse<Blob, R>(action, withResponseParams)
        .then(({ data, response }) => {
            return {
                data,
                fileName: response.headers.get(fileNameHeader)
            };
        });
}