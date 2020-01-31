import {
	OpenVidu,
	Session,
	Publisher,
	OpenViduAdvancedConfiguration,
} from 'openvidu-browser';

import packageJSON from '../package.json';
import { restApi } from './lib/restApi';
import RecordingManager from './lib/RecordingManager';
import RoomManager, { CreateRoomOptions } from './lib/RoomManager';

interface VideoConferenceOptions {
	serverUrl: string;
	serverSecret: string;
	advancedConfig: OpenViduAdvancedConfiguration
}

const defaultVideoConferenceOptions = {
	// serverUrl: "https://42.159.87.75:4443",
	serverUrl: "https://10.0.5.172:4443",
	serverSecret: "MY_SECRET",
	advancedConfig: {
		iceServers:[
			{
				urls:['stun:42.159.87.75:3478']
			},
			{
				urls:[
					"turn:42.159.87.75:3478",
					"turn:42.159.87.75:3478?transport=tcp"
				],
				username: 'denny',
				credential: '123456'
			}
		]
	},
	publisherSpeakingEventsOptions: {
		interval: 50,   // 检查是否正在说话的频率, 默认每50ms检查一次, 单位是ms
		threshold: -50  // 音量大小为多少时触发,默认为-50dB
	},
	screenShareChromeExtension: undefined as string,    // 屏幕分享的chrome扩展url, 默认为undefined
};

class SK_VideoConference {
	version = packageJSON.version;
	recordingManager: RecordingManager;
	roomManager: RoomManager;
	joinRoom: (params: CreateRoomOptions) => Promise<{session: Session, publisher: Publisher}>;
	private ov: OpenVidu;

	constructor(options?: VideoConferenceOptions) {
		const ov = this.ov = new OpenVidu();
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
	 * 获取服务配置
	 */
	getServerConfig = restApi.getServerConfig;
}

export default SK_VideoConference

