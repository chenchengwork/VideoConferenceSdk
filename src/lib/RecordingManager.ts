import { restApi } from './restApi'

/**
 * 录制管理
 */
export default class RecordingManager {
	constructor() {}

	/**
	 * 开启录制
	 */
	startRecording = restApi.startRecording;

	/**
	 * 停止录制
	 */
	stopRecording = restApi.stopRecording;

	/**
	 * 获取录制信息
	 */
	getRecordingInfo = restApi.getRecordingInfo;

	/**
	 * 删除录制
	 */
	deleteRecording = restApi.deleteRecording;

	/**
	 * 获取所有的录制信息
	 */
	getAllRecordingInfo = restApi.getAllRecordingInfo;
}


