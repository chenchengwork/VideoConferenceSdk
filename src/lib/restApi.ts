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

export interface RoomInfo {
	sessionId: string;
	createdAt: string;
	mediaMode: string;
	recording: string;
	recordingMode: string;
	defaultOutputMode: string;
	defaultRecordingLayout: string;
	defaultCustomLayout: string;
	customSessionId: string;
	connections: {
		connectionId: string;
		createdAt: string;
		location: string;
		platform: string;
		role: string;
		clientData: string;
		serverData: string;
		token: string;
		publishers: {
			streamId: string;
			createdAt: number;
			mediaOptions: object;
		}[];
		subscribers: {
			streamId: string;
			publisher: object;
		}[];
	};
}

export interface StartRecordingRequestData {
	// session: string;
	name?: string;
	outputMode?: "COMPOSED" | "INDIVIDUAL";     // default "COMPOSED"
	hasAudio?: boolean;     // default true
	hasVideo?: boolean;     // default true
	recordingLayout?: "BEST_FIT" | "CUSTOM" | "PICTURE_IN_PICTURE" | "VERTICAL_PRESENTATION" | "HORIZONTAL_PRESENTATION";   // default "BEST_FIT"
	customLayout?: string;
	resolution?: string;
}

export interface RecordingResponseData {
	id: string;
	sessionId: string;
	name: string;
	outputMode: string;
	hasAudio: boolean;
	hasVideo: boolean;
	recordingLayout: string;
	customLayout: string;
	resolution: string;
	createdAt: number;
	size: number;
	duration: number;
	url: string;
	status: string;
}


export interface RecordingAllResponseData {
	count: number;
	items: RecordingResponseData[];
}

export interface ServerConfigResponseData {
	version: string;
	maxRecvBandwidth: number;
	maxSendBandwidth: number;
	minRecvBandwidth: number;
	minSendBandwidth: number;
	openviduCdr: boolean;
	openviduPublicurl: string;
	openviduRecording: boolean;
	openviduRecordingAutostopTimeout: number;
	openviduRecordingCustomLayout: string;
	openviduRecordingNotification: string;
	openviduRecordingPath: string;
	openviduRecordingPublicAccess: boolean;
	openviduRecordingVersion: string;
	openviduWebhook: boolean;
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

	private getCommonRequestConfig = (contentType = "application/json") => ({
		headers: {
			Authorization: 'Basic ' + btoa('OPENVIDUAPP:' + this.config.serverSecret),
			'Content-Type': contentType,
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
	getRoomToken = (params: GetSessionTokenRequestData) => new Promise<GetSessionTokenResponseData>((resolve, reject) => {
		const data = JSON.stringify(params);
		axios.post<GetSessionTokenResponseData>(this.formatUrl("api/tokens"), data, this.getCommonRequestConfig()).then((resp) => {
			resolve(resp.data);
		}).catch((error) => {
			reject(error);
		});
	});

	/**
	 * 获取房间信息
	 * @param roomId
	 */
	getRoomInfo = (roomId: string) => new Promise<RoomInfo>((resolve, reject) => {
		axios.get<RoomInfo>(this.formatUrl(`api/sessions/${roomId}`), this.getCommonRequestConfig()).then((resp) => {
			const {status, data} = resp;
			if(status === 200){
				resolve(resp.data);
				return;
			}
			resolve(null);
		}).catch((e) => reject(e))
	});

	/**
	 * 获取所有房间信息
	 */
	getAllRoomInfo = () => new Promise<RoomInfo[]>((resolve, reject) => {
		axios.get<RoomInfo[]>(this.formatUrl(`api/sessions`), this.getCommonRequestConfig()).then((resp) => {
			resolve(resp.data);
		}).catch((e) => reject(e))
	});

	/**
	 * 销毁会话房间
	 * @param roomId
	 */
	destroyRoom = (roomId: string) => new Promise<boolean>((resolve, reject) => {
		axios.delete(this.formatUrl(`/api/sessions/${roomId}`), this.getCommonRequestConfig( "application/x-www-form-urlencoded")).then((resp) =>{
			const { status } = resp;
			if(status === 204) {
				resolve(true)
			}else {
				resolve(false)
			}
		}).catch((e) => reject(e))
	});


	disconnectionUser = (roomId: string, connectionId: string) =>  new Promise<boolean>((resolve, reject) => {
		axios.delete(this.formatUrl(`/api/sessions/${roomId}/connection/${connectionId}`), this.getCommonRequestConfig( "application/x-www-form-urlencoded")).then((resp) =>{
			const { status } = resp;
			if(status === 204) {
				resolve(true)
			}else {
				resolve(false)
			}
		}).catch((e) => reject(e))
	});

	unPublishUser = (roomId: string, streamId: string) =>  new Promise<boolean>((resolve, reject) => {
		axios.delete(this.formatUrl(`/api/sessions/${roomId}/stream/${streamId}`), this.getCommonRequestConfig( "application/x-www-form-urlencoded")).then((resp) =>{
			const { status } = resp;
			if(status === 204) {
				resolve(true)
			}else {
				resolve(false)
			}
		}).catch((e) => reject(e))
	});

	/**
	 * 开启录制
	 */
	startRecording = (roomId: string, params?: StartRecordingRequestData) => new Promise<RecordingResponseData>((resolve, reject) => {
		const data = JSON.stringify(Object.assign(params || {}, {session: roomId}));
		axios.post<RecordingResponseData>(this.formatUrl(`/api/recordings/start`), data, this.getCommonRequestConfig()).then((resp) =>{
			const { status, data, statusText } = resp;
			if(status === 200) {
				resolve(data)
			}else {
				reject(statusText)
			}
		}).catch((e) => reject(e))
	});

	/**
	 * 停止录制
	 * @param recordingId
	 */
	stopRecording = (recordingId: string) => new Promise<RecordingResponseData>((resolve, reject) => {
		axios.post<RecordingResponseData>(
			this.formatUrl(`/api/recordings/stop/${recordingId}`),
			this.getCommonRequestConfig("application/x-www-form-urlencoded")
		).then((resp) =>{
			const { status, data, statusText } = resp;
			if(status === 200) {
				resolve(data)
			}else {
				reject(statusText)
			}
		}).catch((e) => reject(e))
	});

	/**
	 * 获取录制信息
	 * @param recordingId
	 */
	getRecordingInfo = (recordingId: string) => new Promise<RecordingResponseData>((resolve, reject) => {
		axios.get<RecordingResponseData>(
			this.formatUrl(`/api/recordings/${recordingId}`),
			this.getCommonRequestConfig("application/x-www-form-urlencoded")
		).then((resp) =>{
			const { status, data, statusText } = resp;
			if(status === 200) {
				resolve(data)
			}else {
				reject(statusText)
			}
		}).catch((e) => reject(e))
	});

	/**
	 * 获取所有录制信息
	 */
	getAllRecordingInfo = () => new Promise<RecordingAllResponseData>((resolve, reject) => {
		axios.get<RecordingAllResponseData>(
			this.formatUrl(`/api/recordings`),
			this.getCommonRequestConfig("application/x-www-form-urlencoded")
		).then((resp) =>{
			const { status, data, statusText } = resp;
			if(status === 200) {
				resolve(data)
			}else {
				reject(statusText)
			}
		}).catch((e) => reject(e))
	});

	/**
	 * 删除录制
	 * @param recordingId
	 */
	deleteRecording = (recordingId: string) =>  new Promise<boolean>((resolve, reject) => {
		axios.delete(
			this.formatUrl(`/api/recordings/${recordingId}`),
			this.getCommonRequestConfig( "application/x-www-form-urlencoded")
		).then((resp) =>{
			const { status } = resp;
			if(status === 204) {
				resolve(true)
			}else {
				resolve(false)
			}
		}).catch((e) => reject(e))
	});

	/**
	 * 获取server配置信息
	 */
	getServerConfig = () =>  new Promise<ServerConfigResponseData>((resolve, reject) => {
		axios.get<ServerConfigResponseData>(
			this.formatUrl(`/config`),
			this.getCommonRequestConfig( "application/x-www-form-urlencoded")
		).then((resp) =>{
			const { data } = resp;
			resolve(data);
		}).catch((e) => reject(e))
	});

}

export const restApi = new RestApi();
