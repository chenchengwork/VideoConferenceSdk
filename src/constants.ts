/**
 * 默认会议options数据
 */
export const defaultVideoConferenceOptions = {
	serverUrl: "https://42.159.87.75:4443",
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
	}
};



export const defaultPublisherOptions = {
	// @ts-ignore
	audioSource: undefined,
	// @ts-ignore
	videoSource: undefined,
	publishAudio: true,
	publishVideo: true,
	resolution: '640x480',
	// resolution: "1280x720",
	frameRate: 30,
	insertMode: 'APPEND',
	mirror: true,
}

