import { Data } from '../../';

let sessionId: string;

export const createSessionId = (): void => {
    sessionId = Data.generateUUID4();
}

export const getSessionId = () => sessionId;