import packageJSON from '../package.json';
import {
	OpenVidu,
	Session,
	StreamEvent,
	SignalEvent,
	Publisher,
	Subscriber,
	OpenViduAdvancedConfiguration,
	PublisherProperties
} from 'openvidu-browser';

import { restApi } from './restApi';
import { defaultVideoConferenceOptions, defaultPublisherOptions } from './constants';

interface VideoConferenceOptions {
	serverUrl: string;
	serverSecret: string;
	advancedConfig: OpenViduAdvancedConfiguration
}

interface CreateRoomOptions {
	roomId: string;
	username: string;
	metadata?: any;
	publisherOptions?: PublisherProperties;
	initPublisherFinished?: (publisher: Publisher, video: HTMLVideoElement) => void;
	subscriberJoinListener?: (event: StreamEvent, video: HTMLVideoElement, metaData: object) => void;
	subscriberLeaveListener?: (event: StreamEvent) => void;
}

class SK_VideoConference {
	version = packageJSON.version;
	private ov: OpenVidu;
	private session: Session;
	private options: VideoConferenceOptions;

	constructor(options?: VideoConferenceOptions) {
		this.ov = new OpenVidu();
		const { serverUrl, serverSecret, advancedConfig } = Object.assign(defaultVideoConferenceOptions,options || {});

		restApi.setConfig(serverUrl, serverSecret);

		// 设置高级配置
		this.ov.setAdvancedConfiguration(advancedConfig);

		this.options = options;
	}

	/**
	 * 加入房间
	 */
	joinRoom = async (params: CreateRoomOptions): Promise<{session: Session, publisher: Publisher}> => {
		const { roomId, username, metadata, publisherOptions, initPublisherFinished, subscriberJoinListener, subscriberLeaveListener } = params;
		if(typeof roomId === "undefined") throw new Error("roomId is required");

		const session = this.session = this.ov.initSession();
		const publisher = this.ov.initPublisher(undefined, Object.assign(defaultPublisherOptions, publisherOptions || {}));

		//----------------------初始化监听事件-----------------------
		session.on("streamCreated", (event: StreamEvent) => {
			// console.log('---------------------------------------------------------streamCreated---------------------------------------------------------');
			const subscriber = session.subscribe(event.stream, undefined);
			const video = createVideo();
			subscriber.addVideoElement(video);

			let metaDataObj: {[index: string]: any} = {};
			try{
				const metaData = event.stream.connection.data.split('%')[0];
				metaDataObj = JSON.parse(metaData);
				metaDataObj.username = metaDataObj.clientData;
				delete metaDataObj.clientData;
			}catch (e) {

			}
			subscriberJoinListener && subscriberJoinListener(event, video, metaDataObj);
		});

		session.on("streamDestroyed", (event: StreamEvent) => {
			// console.log('---------------------------------------------------------streamDestroyed---------------------------------------------------------');
			subscriberLeaveListener && subscriberLeaveListener(event);
		});


		//-----------------------创建房间---------------------------
		await restApi.createRoom({customSessionId: roomId});
		const { token } = await restApi.getRoomToken({session: roomId});
		await session.connect(token, Object.assign({clientData: username || ""}, metadata || {}));
		await session.publish(publisher);
		const localVideo = createVideo();
		publisher.addVideoElement(localVideo);
		initPublisherFinished && initPublisherFinished(publisher, localVideo);

		window.addEventListener('beforeunload', this.leaveRoom);

		return { session, publisher };
	};

	/**
	 * 离开房间
	 */
	leaveRoom = () => {
		this.session && this.session.disconnect();
	};

	/**
	 * 获取房间信息
	 * @param roomId
	 */
	getRoomInfo = (roomId: string) => restApi.getRoomInfo(roomId);

	/**
	 * 获取所有房间信息
	 */
	getAllRoomInfo = () => restApi.getAllRoomInfo();

	/**
	 * 销毁会话房间
	 * @param roomId
	 */
	destroyRoom = (roomId: string) => restApi.destroyRoom(roomId);
}

export default SK_VideoConference


const createVideo = (): HTMLVideoElement => {
	const video = document.createElement("video");
	video.style.objectFit = "cover";
	video.style.backgroundColor = "#000";

	return video;
}
