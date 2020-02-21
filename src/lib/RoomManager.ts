import {
	Publisher,
	PublisherProperties,
	Session,
	StreamEvent,
	OpenVidu,
	Subscriber,
	SessionDisconnectedEvent,
	ConnectionEvent
} from "openvidu-browser";
import {restApi} from "./restApi";
import { mirrorVideo, removeMirrorVideo, createVideoDom } from '../util';
interface InitPublisherFinishedParams {
	publisher: Publisher;
	video?: HTMLVideoElement;
}

interface SubscriberJoinListenerParams {
	event: StreamEvent;
	video?: HTMLVideoElement;
	metaData: {[index: string]: any};
	subscriber: Subscriber;
}

export interface CreateRoomOptions {
	roomId: string;
	username: string;
	metadata?: any;
	isCreateVideo?: boolean;
	publisherOptions?: PublisherProperties;
	initPublisherFinished?: (data: InitPublisherFinishedParams) => void;
	subscriberJoinListener?: (data: SubscriberJoinListenerParams) => void;
	subscriberLeaveListener?: (event: StreamEvent) => void;
	connectionDestroyedListener?: (event: ConnectionEvent) => void;
	sessionDisconnectedListener?: (event: SessionDisconnectedEvent) => void;
	onError?: () => void;
};

export const defaultPublisherOptions = {
	// @ts-ignore
	audioSource: undefined,
	// @ts-ignore
	videoSource: undefined,  // 当设置为"screen"时,表示为共享屏幕
	// videoSource: "screen",
	publishAudio: true,
	publishVideo: true,
	resolution: '640x480',
	// resolution: "1280x720",
	frameRate: 30,
	insertMode: 'APPEND',
	mirror: true,
};

/**
 * 房间管理
 */
export default class RoomManager {
	ov: OpenVidu;
	session: Session;

	constructor(ov: OpenVidu) {
		this.ov = ov;
	}

	/**
	 * 加入房间
	 */
	joinRoom = async (params: CreateRoomOptions): Promise<{session: Session, publisher: Publisher}> => {
		let {
			roomId,
			username,
			isCreateVideo,
			metadata,
			publisherOptions,
			initPublisherFinished,
			subscriberJoinListener,
			subscriberLeaveListener,
			connectionDestroyedListener,
			sessionDisconnectedListener,
		} = params;

		if(isCreateVideo === undefined) isCreateVideo = true;
		if(typeof roomId === "undefined") throw new Error("roomId没有传入");

		const session = this.session = this.ov.initSession();
		const publisher = this.ov.initPublisher(undefined, Object.assign(defaultPublisherOptions, publisherOptions || {}));

		//----------------------监听视频流创建-----------------------
		session.on("streamCreated", (event: StreamEvent) => {
			const subscriber = session.subscribe(event.stream, undefined);
			let metaDataObj: {[index: string]: any} = {};
			try{
				const metaData = event.stream.connection.data.split('%')[0];
				metaDataObj = JSON.parse(metaData);
				metaDataObj.username = metaDataObj.clientData;
				delete metaDataObj.clientData;
			}catch (e) {

			}

			let video;
			if(isCreateVideo) {
				video = createVideoDom();
				mirrorVideo(video);
				subscriber.addVideoElement(video);
			}

			subscriberJoinListener && subscriberJoinListener({event, video, metaData: metaDataObj, subscriber});
		});

		//----------------------监听视频流销毁-----------------------
		session.on("streamDestroyed", (event: StreamEvent) => {
			subscriberLeaveListener && subscriberLeaveListener(event);
		});

		//---------------------监听连接销毁--------------------------
		session.on("connectionDestroyed", (event: ConnectionEvent) => {
			connectionDestroyedListener && connectionDestroyedListener(event);
		});

		//---------------------监听会议销毁--------------------------
		session.on(" sessionDisconnected", (event: SessionDisconnectedEvent) => {
			sessionDisconnectedListener && sessionDisconnectedListener(event);
		});


		//-----------------------创建房间---------------------------
		await restApi.createRoom({customSessionId: roomId});
		const { token } = await restApi.getRoomToken({session: roomId});
		await session.connect(token, Object.assign({clientData: username || ""}, metadata || {}));
		await session.publish(publisher);
		let localVideo;
		if(isCreateVideo) {
			localVideo = createVideoDom();
			publisher.addVideoElement(localVideo);
		}

		initPublisherFinished && initPublisherFinished({publisher, video: localVideo});

		window.addEventListener('unload', this.leaveRoom);
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
	getRoomInfo = restApi.getRoomInfo;

	/**
	 * 获取所有房间信息
	 */
	getAllRoomInfo = restApi.getAllRoomInfo;

	/**
	 * 销毁会话房间
	 * @param roomId
	 */
	destroyRoom = restApi.destroyRoom;
}

