import {
	Publisher,
	PublisherProperties,
	Session,
	StreamEvent,
	OpenVidu,
	Subscriber,
	SessionDisconnectedEvent,
	ConnectionEvent, PublisherSpeakingEvent
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
	role?: "MODERATOR" |  "PUBLISHER" | "SUBSCRIBER";
	metadata?: any;
	isCreateVideo?: boolean;
	publisherOptions?: PublisherProperties;
	initPublisherFinished?: (data: InitPublisherFinishedParams) => void;
	subscriberJoinListener?: (data: SubscriberJoinListenerParams) => void;
	subscriberLeaveListener?: (event: StreamEvent) => void;
	connectionDestroyedListener?: (event: ConnectionEvent) => void;
	sessionDisconnectedListener?: (event: SessionDisconnectedEvent) => void;
	publisherStartSpeakingListener?:(event: PublisherSpeakingEvent) => void;
	publisherStopSpeakingListener?:(event: PublisherSpeakingEvent) => void;
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
			role,
			isCreateVideo,
			metadata,
			publisherOptions,
			initPublisherFinished,
			subscriberJoinListener,
			subscriberLeaveListener,
			connectionDestroyedListener,
			sessionDisconnectedListener,
			publisherStartSpeakingListener,
			publisherStopSpeakingListener
		} = params;
		if(role && !["MODERATOR",  "PUBLISHER", "SUBSCRIBER"].includes(role)){
			throw new Error(`当前传入的role为"${role}", 但是role只接受"MODERATOR"|"PUBLISHER"|"SUBSCRIBER"`);
		}

		if(isCreateVideo === undefined) isCreateVideo = true;
		if(typeof roomId === "undefined") throw new Error("roomId没有传入");

		const session = this.session = this.ov.initSession();
		const publisher = this.ov.initPublisher(undefined, Object.assign(defaultPublisherOptions, publisherOptions || {}));

		//--------------------发布者需要监听的事件----------------------
		// publisher.on("streamDestroyed", () => {});
		// publisher.on("connectionDestroyed", () => {});
		// publisher.on("sessionDisconnected", () => {});

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
				// 设置分享屏幕
				if(subscriber.stream.typeOfVideo == "SCREEN"){
					removeMirrorVideo(video)
				}
				if(subscriber.stream.typeOfVideo == "CAMERA"){ }
				if(subscriber.stream.typeOfVideo == "CUSTOM"){ }

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

		//---------------------监听发布者开始说话--------------------------
		// session.on("publisherStartSpeaking", (event: PublisherSpeakingEvent) => {
		// 	publisherStartSpeakingListener && publisherStartSpeakingListener(event);
		// });

		//---------------------监听发布者停止说话--------------------------
		// session.on("publisherStopSpeaking", (event: PublisherSpeakingEvent) => {
		// 	publisherStopSpeakingListener && publisherStopSpeakingListener(event);
		// });


		//-----------------------创建房间---------------------------
		await restApi.createRoom({customSessionId: roomId});
		const { token } = await restApi.getRoomToken({session: roomId, role: role || "PUBLISHER"});
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
	 * 获取分享屏幕的publisher
	 */
	getShareScreenPublisher = (publisherOptions?: PublisherProperties, onStopShareListener?: (publisher: Publisher) => void) => new Promise<Publisher>((resolve, reject) => {
		const videoSource = navigator.userAgent.indexOf('Firefox') !== -1 ? 'window' : 'screen';
		const options = Object.assign({
			videoSource,
			publishAudio: true,
			publishVideo: true,
			mirror: false,
		}, publisherOptions || {});

		const publisher = this.ov.initPublisher(undefined, options, (error) => {
				if (error && error.name === 'SCREEN_EXTENSION_NOT_INSTALLED') {
					reject("屏幕分享扩展没有安装");
				} else if (error && error.name === 'SCREEN_SHARING_NOT_SUPPORTED') {
					reject('当前浏览器不支持分享屏幕');
				} else if (error && error.name === 'SCREEN_EXTENSION_DISABLED') {
					reject('你需要开启分享屏幕扩展');
				} else if (error && error.name === 'SCREEN_CAPTURE_DENIED') {
					reject('请选择一个窗口和应用');
				}
			}
		);

		publisher.once("accessAllowed", (e) => {
			publisher.stream.getMediaStream().getVideoTracks()[0].addEventListener('ended', () => {
				onStopShareListener && onStopShareListener(publisher);
			});

			resolve(publisher);
		})
	});

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

	disconnectionUser = restApi.disconnectionUser

	unPublishUser = restApi.unPublishUser
}

