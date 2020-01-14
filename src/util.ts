import axios from 'axios';

/**
 * --------------------------
 * SERVER-SIDE RESPONSIBILITY
 * --------------------------
 * These methods retrieve the mandatory user token from OpenVidu Server.
 * This behaviour MUST BE IN YOUR SERVER-SIDE IN PRODUCTION (by using
 * the API REST, openvidu-java-client or openvidu-node-client):
 *   1) Initialize a session in OpenVidu Server	(POST /api/sessions)
 *   2) Generate a token in OpenVidu Server		(POST /api/tokens)
 *   3) The token must be consumed in Session.connect() method
 */
export const getToken = (sessionId: string, serverUrl: string, serverSecret: string) =>{
    return createSession(sessionId, serverUrl, serverSecret)
        .then((sessionId: string) => createToken(sessionId,  serverUrl, serverSecret));
};

const createSession = (sessionId: string, serverUrl: string, serverSecret: string) => {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({ customSessionId: sessionId });

        axios.post(serverUrl + '/api/sessions', data, {
            timeout: 10000,
            headers: {
                Authorization: 'Basic ' + btoa('OPENVIDUAPP:' + serverSecret),
                'Content-Type': 'application/json',
            },
        })
            .then((response) => {
                resolve(response.data.id);
            })
            .catch((response) => {
                const error = Object.assign({}, response);
                if (error.response && error.response.status === 409) {
                    resolve(sessionId);
                } else {
                    reject(error);
                }
            });
    });
}

const createToken = (sessionId: string, serverUrl: string, serverSecret: string) =>{
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({ session: sessionId });
        axios
            .post(serverUrl + '/api/tokens', data, {
                headers: {
                    Authorization: 'Basic ' + btoa('OPENVIDUAPP:' + serverSecret),
                    'Content-Type': 'application/json',
                },
            })
            .then((response) => {
                resolve(response.data.token);
            })
            .catch((error) => {
                reject(error)
            });
    });
}

