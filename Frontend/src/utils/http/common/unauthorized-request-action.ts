export type UnauthorizedRequestAction = () => void;

let unauthorizedRequestAction: UnauthorizedRequestAction;

export const setUnauthorizedRequestAction = (action: UnauthorizedRequestAction): void => {
    unauthorizedRequestAction = action;
}

export const unauthorizedAction = () => {
    if (unauthorizedRequestAction) {
        unauthorizedRequestAction();
    }
};