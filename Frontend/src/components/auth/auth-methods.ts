export class AuthMethods {
    private isAuthenticated = false;
    public logOut = () => {
        this.clearSessionStorage();
        this.clearLocalStorage();
    }

    public ensureIsAuthenticated = () => {
        const accessToken = localStorage.getItem('accessToken');
        const idToken = localStorage.getItem('idToken');
        const tokens = this.extractTokens(window.location.hash);
        const response = {
            isAuthenticated: this.isAuthenticated
        }
        if (accessToken && idToken) {
            this.isAuthenticated = true;
            return response;
        }
        if (tokens && tokens.accessToken && tokens.idToken) {
            localStorage.setItem('idToken', tokens.idToken);
            localStorage.setItem('accessToken', tokens.accessToken);
            this.isAuthenticated = true;
            return response;
        }
        return response;

    }
    private clearLocalStorage = () => {
        return localStorage.clear();
    }
    private clearSessionStorage = () => {
        return sessionStorage.clear();
    }
    private extractTokens = (url: string) => {
        const indexOfAccessToken = url.indexOf('access_token');
        const indexOfIdToken = url.indexOf('id_token');
        const tokens = url.split('=');
        if (indexOfAccessToken >= 0 && indexOfIdToken >= 0) {
            const idToken = this.checkIfSepratorExists(tokens[1]) ?
                this.getTokenFromSepratorArray(tokens[1]) :
                tokens[1];
            const accessToken = this.checkIfSepratorExists(tokens[2]) ?
                this.getTokenFromSepratorArray(tokens[2]) :
                tokens[2];
            return ({ idToken, accessToken })
        }
        return null;
    }
    private checkIfSepratorExists = (url: string) => {
        return (url && url.indexOf('&') >= 0) ? true : false;
    }
    private getTokenFromSepratorArray = (url: string) => {
        return url && url.substring(0, url.indexOf('&'))
    }

}
