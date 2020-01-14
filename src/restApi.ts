import axios, { AxiosRequestConfig } from 'axios';

export interface CreateRoomRequestData {
	customSessionId?: string;
	mediaMode?: "ROUTED" | "RELAYED";           // default "ROUTED"
	recordingMode?: "ALWAYS" | "MANUAL";        // default "MANUAL"
	defaultOutputMode?: "COMPOSED" | "INDIVIDUAL";  // default "COMPOSED"
	defaultRecordingLayout?: "BEST_FIT" | "PICTURE_IN_PICTURE" | "VERTICAL_PRESENTATION" | "HORIZONTAL_PRESENTATION"| string; // default "BEST_FIT"
	defaultCustomLayout?: string;
}

export interface CreateRoomResponseData {
	id: string;
	createdAt?: string;
}

export interface GetSessionTokenRequestData {
	session: string;    // session_id
	role?: "SUBSCRIBER" |  "PUBLISHER" | "MODERATOR";       // default "PUBLISHER"
	data?: string;       // default "PUBLISHER"
	kurentoOptions?: {
		videoMaxRecvBandwidth?: number;
		videoMinRecvBandwidth?: number;
		videoMaxSendBandwidth?: number;
		videoMinSendBandwidth?: number;
		allowedFilters?: string[];
	};       //
}

export interface GetSessionTokenResponseData {
	token: string;
	session: string;    // same as in the body request
	role: string;    // same as in the body request
	data: string;    // same as in the body request
	id: string;    // same value as token
	kurentoOptions: string;    // same as in the body request
}

class RestApi {
	private config = {
		serverUrl: "",
		serverSecret: "",
	};

	setConfig = (serverUrl: string, serverSecret: string) => {
		this.config = {serverUrl: serverUrl.replace(/\/$/, ""), serverSecret};
	};

	private formatUrl = (url: string) => `${this.config.serverUrl}/${url.replace(/^\//, "")}`

	private getCommonRequestConfig = () => ({
		headers: {
			Authorization: 'Basic ' + btoa('OPENVIDUAPP:' + this.config.serverSecret),
			'Content-Type': 'application/json',
		}
	});

	/**
	 * 创建会话房间
	 */
	createRoom = (params: CreateRoomRequestData) => new Promise<CreateRoomResponseData>((resolve, reject) => {
		const data = JSON.stringify(params);
		axios.post<CreateRoomResponseData>(this.formatUrl("api/sessions"), data, this.getCommonRequestConfig()).then((resp) => {
			resolve(resp.data);
		}).catch((error) => {
			if (error.response && error.response.status === 409) {
				resolve({ id: params.customSessionId});
			} else {
				reject(error);
			}
		});
	});

	/**
	 * 获取会话房间token
	 * @param params
	 */
	getSessionToken = (params: GetSessionTokenRequestData) => new Promise<GetSessionTokenResponseData>((resolve, reject) => {
		const data = JSON.stringify(params);
		axios.post<GetSessionTokenResponseData>(this.formatUrl("api/tokens"), data, this.getCommonRequestConfig()).then((resp) => {
			resolve(resp.data);
		}).catch((error) => {
			reject(error);
		});
	});
}

export const restApi = new RestApi();
