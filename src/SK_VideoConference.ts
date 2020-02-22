import
{
	OpenVidu,
	Session,
	Publisher,
	Subscriber,
	OpenViduAdvancedConfiguration,
} from 'openvidu-browser';

import { restApi } from './lib/restApi';
import RecordingManager from './lib/RecordingManager';
import RoomManager, { CreateRoomOptions } from './lib/RoomManager';
import { OnFire } from './OnFire';
import Signal from  './lib/Signal';
import * as util from './util';

export interface VideoConferenceOptions {
	serverUrl?: string;
	serverSecret?: string;
	advancedConfig?: OpenViduAdvancedConfiguration
};

const defaultVideoConferenceOptions = {
	serverUrl: "https://check.shikongshuzhi.com/videoConference",
	// serverUrl: "https://10.0.5.172:4443",
	// serverUrl: "https://192.168.1.104:4443",
	serverSecret: "MY_SECRET",
	advancedConfig: {
		iceServers:[
			{
				urls:['stun:47.115.152.75:3478']
			},
			{
				urls:[
					"turn:47.115.152.75:3478",
					"turn:47.115.152.75:3478?transport=tcp"
				],
				username: 'kurento',
				credential: 'kurento'
			}
		],
		publisherSpeakingEventsOptions: {
			interval: 50,   // 检查是否正在说话的频率, 默认每50ms检查一次, 单位是ms
			threshold: -50  // 音量大小为多少时触发,默认为-50dB
		},
		screenShareChromeExtension: undefined as string,    // 屏幕分享的chrome扩展url, 默认为undefined
	},
};

class SK_VideoConference {
	static Signal = Signal;
	recordingManager: RecordingManager;
	roomManager: RoomManager;
	joinRoom: (params: CreateRoomOptions) => Promise<{session: Session, publisher: Publisher}>;
	onFire: OnFire;
	ov: OpenVidu;
	util = util;

	constructor(options?: VideoConferenceOptions) {
		const ov = this.ov = new OpenVidu();
		this.onFire = new OnFire();
		this.recordingManager = new RecordingManager();
		this.roomManager = new RoomManager(ov);

		const { serverUrl, serverSecret, advancedConfig } = Object.assign(defaultVideoConferenceOptions,options || {});

		restApi.setConfig(serverUrl, serverSecret);

		// 设置高级配置
		advancedConfig && this.ov.setAdvancedConfiguration(advancedConfig);

		/**
		 * 加入房间
		 */
		this.joinRoom = this.roomManager.joinRoom
	}

	/**
	 * 检查支持设备的情况
	 */
	checkSupportDevice = () => new Promise<{isExistAudioDevice: boolean;isExistVideoDevice: boolean;}>((resolve, reject) => {
		this.ov.getDevices().then((data) => {
			const audioDevices =  data.filter(item => item.kind === "audioinput")
			const videoDevices =  data.filter(item => item.kind === "videoinput")
			resolve({
				isExistAudioDevice: audioDevices.length > 0,
				isExistVideoDevice: videoDevices.length > 0,
			})
		}).catch((e) => {
			reject(e);
		});
	})

	/**
	 * 控制声音
	 */
	changeAudioStatus = (target: Publisher | Subscriber, status: boolean) => {
		if(target instanceof Publisher){
			target.publishAudio(status);
		}else if(target instanceof Subscriber){
			target.subscribeToAudio(status);
		}
	};

	/**
	 * 控制视频
	 */
	changeVideoStatus = (target: Publisher | Subscriber, status: boolean) => {
		if(target instanceof Publisher){
			target.publishVideo(status);
		}else if(target instanceof Subscriber){
			target.subscribeToVideo(status);
		}
	};

	/**
	 * 获取服务配置
	 */
	getServerConfig = restApi.getServerConfig;
}


export default SK_VideoConference


const toggleFullscreen = (fs: HTMLDivElement) => {
	const document = window.document;

	// @ts-ignore
	if ( !document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
		if (fs.requestFullscreen) {
			fs.requestFullscreen();
			// @ts-ignore
		} else if (fs.msRequestFullscreen) {
			// @ts-ignore
			fs.msRequestFullscreen();
			// @ts-ignore
		} else if (fs.mozRequestFullScreen) {
			// @ts-ignore
			fs.mozRequestFullScreen();
			// @ts-ignore
		} else if (fs.webkitRequestFullscreen) {
			// @ts-ignore
			fs.webkitRequestFullscreen();
		}
	} else {
		if (document.exitFullscreen) {
			document.exitFullscreen();
			// @ts-ignore
		} else if (document.msExitFullscreen) {
			// @ts-ignore
			document.msExitFullscreen();
			// @ts-ignore
		} else if (document.mozCancelFullScreen) {
			// @ts-ignore
			document.mozCancelFullScreen();
			// @ts-ignore
		} else if (document.webkitExitFullscreen) {
			// @ts-ignore
			document.webkitExitFullscreen();
		}
	}
}
