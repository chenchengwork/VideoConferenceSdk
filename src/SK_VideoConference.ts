import packageJSON from '../package.json';
import { OpenVidu, Session, Event, Stream, StreamEvent, SignalEvent, Publisher } from 'openvidu-browser';
import { restApi } from './restApi';
import { getToken } from './util';

interface VideoConferenceOptions {
	serverUrl: string;
	serverSecret: string;
}

interface CreateRoomOptions {
	roomId?: string;
	roomCreated: (session: Session, publisher: Publisher) => void,
}

class SK_VideoConference {
	version = packageJSON.version;
	private ov: OpenVidu;
	private options: VideoConferenceOptions;

	constructor(options: VideoConferenceOptions) {
		this.ov = new OpenVidu();
		const { serverUrl, serverSecret } = options;
		restApi.setConfig(serverUrl, serverSecret);

		this.options = options;
	}

	/**
	 * 创建房间
	 */
	createRoom = async (sessionId: string) => {
		const session = this.ov.initSession();

		const publisher = this.ov.initPublisher(undefined, {
			audioSource: undefined,
			videoSource: undefined,
			publishAudio: true,
			publishVideo: true,
			resolution: '640x480',
			// resolution: "1280x720",
			// resolution: "2560x1440",
			frameRate: 30,
			insertMode: 'APPEND',
			mirror: true,
		});

		session.on("streamCreated", (event: StreamEvent) => {
			console.log('---------------------------------------------------------streamCreated---------------------------------------------------------')
		});

		await restApi.createRoom({customSessionId: sessionId});
		const { token } = await restApi.getSessionToken({session: sessionId});
		await session.connect(token);
		await session.publish(publisher);

		const video = document.querySelector("#a") as HTMLVideoElement;
		video.style.objectFit = "cover";
		video.style.backgroundColor = "#000";
		publisher.addVideoElement(video);

		return session;
	}

}

export default SK_VideoConference
