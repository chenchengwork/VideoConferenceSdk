import RoomManager from './RoomManager';
import { SignalEvent } from "openvidu-browser";

interface MsgBody {
	[index: string]: any;
}

type MsgListener = (data: MsgBody) => void;

export default class Signal {
	private roomManager: RoomManager

	constructor(roomManager: RoomManager) {
		this.roomManager = roomManager;
	}

	/**
	 * 发送对话消息
	 * @param data
	 */
	sendDialogMsg = (data: MsgBody) => {
		const { session } = this.roomManager;
		const signalOptions = {
			data: JSON.stringify(data),
			type: 'dialogMsg',
		};
		session.signal(signalOptions);
	};

	/**
	 * 监听对话消息
	 * @param msgListener
	 */
	dialogMsgListener = (msgListener: MsgListener) => {
		const { session } = this.roomManager;
		session.on("signal:dialogMsg", (event: SignalEvent) => {
			const data = JSON.parse(event.data);
			msgListener && msgListener(data)
		});
	}


}
