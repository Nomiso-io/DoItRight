export type BeforeAuthorizedRequestAction = () => Promise<void>;

let BeforeAuthorizedRequestAction: BeforeAuthorizedRequestAction;

export const setBeforeAuthorizedRequestAction = (action: BeforeAuthorizedRequestAction): void => {
    BeforeAuthorizedRequestAction = action;
}

export const beforeAuthorizedRequestAction = () => {
    if (BeforeAuthorizedRequestAction) {
        return BeforeAuthorizedRequestAction();
    }
    return Promise.resolve();
};