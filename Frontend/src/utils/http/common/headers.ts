import { Data } from '../../';
import { getSessionId } from './session';
import { ContentTypes, HttpHeaders } from '../constants';
import { IRootState } from '../../../reducers';

type UserAgnosticKeys
    = 'request-id'
    | 'session-id';

type UserSpecificKeys
    = 'Authorization'
    | UserAgnosticKeys;

type UnionKeyToValue<U extends string, V> = {
    [K in U]: V
};

// tslint:disable-next-line: no-any
const getToken = (state: IRootState) => {
    if (!state ||
        !state.user ||
        !state.user.idToken) {
        return undefined;
    }
    return state.user.idToken;
};

export const getUserAgnosticHeaders = () => {
    return Object.freeze<UnionKeyToValue<UserAgnosticKeys, string>>({
        'request-id': `REQ-${Data.generateUUID4()}`,
        'session-id': `TCN-${getSessionId()}`
    });
};

// tslint:disable-next-line: no-any
export const getUserSpecificHeaders = (state: any) => {
    const token = getToken(state);

    if (!token) {
        return null;
    }

    const userAgnosticHeaders = getUserAgnosticHeaders();

    return Object.freeze<UnionKeyToValue<UserSpecificKeys, string>>({
        ...userAgnosticHeaders,
        Authorization: `Bearer ${token}`,
    });
};

export const getBaseHeaders = (contentType?: ContentTypes) => {
    return {
        Accept: ContentTypes.JSON,
        ...contentType && { [HttpHeaders.ContentType]: contentType }
    };
};