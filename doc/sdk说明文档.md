# VideoConferenceSDK

基于视频会议开发的前端 JavaScript SDK

## 快速导航

* [功能简介](#summary)
* [引入](#install)
* [API参照](#apiReference)


## 概述
VideoConferenceSDK （下文简称为 JS-SDK）适用于 ：Chrome、Firefox、Safari 等浏览器。

<a id="summary"></a>

## 功能简介

* 视频语音通话
  
<a id="install"></a>
## 引入

支持以下几种安装方式

* 直接使用静态文件地址：

  ```
  http://domain/dist/videoConferenceSdk.min.js
  ```
  通过sctipt标签引入该文件，会在全局生成名为 `SK_VideoConference` 的对象

* 使用 NPM 安装

  暂时不支持
  
<a id="apiReference"></a>  
## API Reference Interface

### 一、房间管理 SK_VideoConference.RoomManager

#### 1.加入房间 RoomManager.joinRoom(params: CreateRoomOptions): Promise<{session: Session, publisher: Publisher}>

  * **params**: 加入会议的参数

    * params.roomId: `string` 会议房间id(必填)
    * params.username: `string` 参会人员名称(必填)
    * params.metadata: `object` 加入会议时额外带元数据(选填)
    * params.publisherOptions: `object` 发起者(选填)
      * publisherOptions.frameRate: `number` 视频每秒的帧数,默认30
      * publisherOptions.mirror: `boolen` 视频是否按照镜面显示,默认true
      * publisherOptions.publishAudio: `boolen` 是否开启音频,默认true
      * publisherOptions.publishVideo: `boolen` 是否开启视频,默认true
      * publisherOptions.resolution: `string` 视频分辨率,默认640x480
    * params.initPublisherFinished `function` 初始化发起者完成回调 (publisher: Publisher, video: HTMLVideoElement) => void
    * params.subscriberJoinListener `function` 他人加入会议后回调 (event: StreamEvent, video: HTMLVideoElement, metaData: object) => void
    * params.subscriberLeaveListener `function` 他人离开会议后回调 (event: StreamEvent) => void

#### 2.离开房间 RoomManager.leaveRoom(): void

#### 3.销毁房间 RoomManager.destroyRoom(): Promise<boolean>

#### 4.获取房间信息 RoomManager.getRoomInfo(roomId: string): Promise<RoomInfo>
  * **请求参数**:
    * roomId: `string` 房间ID(必填)
    
  * **响应信息**:
    ```javascript
    interface RoomInfo {
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
    ```
  
#### 5.获取所有房间信息 RoomManager.getRoomInfo(): Promise<RoomInfo[]>

### 二、录制管理 SK_VideoConference.RecordingManager

#### 1.开启录制 RecordingManager.startRecording(roomId: string, params?: StartRecordingRequestData):Promise<RecordingResponseData>
  * **请求参数**:
    * roomId: `string` 房间ID(必填)
    * params: `object` (选填)
      * params.name: `string` 录制后保存视频文件的名称
      * params.outputMode: `string` "COMPOSED" | "INDIVIDUAL", 默认COMPOSED
      * params.hasAudio: `boolean` 是否有音频,默认true
      * params.hasVideo: `boolean` 是否有视频,默认true
      * params.recordingLayout: `string` 录制布局, "BEST_FIT" | "CUSTOM" | "PICTURE_IN_PICTURE" | "VERTICAL_PRESENTATION" | "HORIZONTAL_PRESENTATION",默认BEST_FIT
      * params.customLayout: `string` 自定义布局,默认undefined
      * params.resolution: `string` 分辨率
      
  * **请求参数**:
    ```javascript
    interface RecordingResponseData {
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
    ```  

#### 2.停止录制 RecordingManager.stopRecording(recordingId: string): Promise<RecordingResponseData>

#### 3.获取录制信息 RecordingManager.getRecordingInfo(recordingId: string): Promise<RecordingResponseData>

#### 4.删除录制文件 RecordingManager.deleteRecording(recordingId: string): Promise<boolean>

#### 5.获取所有的录制信息 RecordingManager.getAllRecordingInfo(): Promise<RecordingAllResponseData>
  * **响应信息**:
    ```javascript
    interface RecordingAllResponseData {
    	count: number;
    	items: RecordingResponseData[];
    }
    ```

### 许可证

> Copyright (c) 2019 chencheng.com

