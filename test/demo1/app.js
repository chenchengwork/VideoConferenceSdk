function createVideoWrapper(video, username, videoConference, target, masterVideo){
    var videoWrapperDom = document.createElement("div");
    var usernameDom = document.createElement("div");
    var operatorDom = document.createElement("div");
    var audioBtn = document.createElement("button");
    var videoBtn = document.createElement("button");
    var removeUserBtn = document.createElement("button");

    videoWrapperDom.setAttribute("class", "video-wrapper");
    video.setAttribute("class", "video");
    operatorDom.setAttribute("class", "operator");
    usernameDom.setAttribute("class", "username");

    usernameDom.textContent = username;
    audioBtn.textContent = "声音关";
    videoBtn.textContent = "视频关";
    removeUserBtn.textContent = "踢出会议";

    video.onclick = () => {
        // 将视频流添加到中间video中
        masterVideo.srcObject = target.stream.getMediaStream();
    };

    var isOpenAudio = true;
    audioBtn.onclick = () => {
        isOpenAudio = !isOpenAudio;
        audioBtn.textContent = isOpenAudio ? "声音关" : "声音开";
        videoConference.changeAudioStatus(target, isOpenAudio);
    };

    var isOpenVideo = true;
    videoBtn.onclick = () => {
        isOpenVideo = !isOpenVideo;
        videoBtn.textContent = isOpenVideo ? "视频关" : "视频开";
        videoConference.changeVideoStatus(target, isOpenVideo);
    };

    // 将用户从会议中踢出
    removeUserBtn.onclick = () => {
        videoConference.roomManager.session.forceUnpublish(target.stream);
    };

    operatorDom.appendChild(audioBtn);
    operatorDom.appendChild(videoBtn);
    operatorDom.appendChild(removeUserBtn);
    videoWrapperDom.appendChild(video);
    videoWrapperDom.appendChild(usernameDom);
    videoWrapperDom.appendChild(operatorDom);

    return videoWrapperDom;
}

function createOperator(videoConference, roomId, masterVideo, localPublisher){
    var recordingManager = videoConference.recordingManager;
    var roomManager = videoConference.roomManager;

    var operatorDom = document.createElement("div");
    operatorDom.style.position = "absolute";
    operatorDom.style.top = 0;
    var contentDom = document.querySelector(".content");
    var serverConfigBtn = document.createElement("button");
    var recordingBtn = document.createElement("button");
    var stopRecordingBtn = document.createElement("button");
    var deleteRecordingBtn = document.createElement("button");
    var getRecordingBtn = document.createElement("button");
    var getAllRecordingBtn = document.createElement("button");
    var screenShareBtn = document.createElement("button");
    var leaveRoomBtn = document.createElement("button");
    var destroyRoomBtn = document.createElement("button");

    leaveRoomBtn.textContent = "离开房间";
    destroyRoomBtn.textContent = "销毁房间";
    serverConfigBtn.textContent = "获取服务配置";
    recordingBtn.textContent = "开始录制";
    stopRecordingBtn.textContent = "停止录制";
    getRecordingBtn.textContent = "获取录制信息";
    deleteRecordingBtn.textContent = "删除录制";
    getAllRecordingBtn.textContent = "获取所有录制信息";
    screenShareBtn.textContent = "分享屏幕";

    // 离开配置事件
    leaveRoomBtn.onclick = function () {
        videoConference.roomManager.leaveRoom()
    };

    // 获取服务配置事件
    serverConfigBtn.onclick = function () {
        videoConference.getServerConfig().then(function (resp) {
            console.log("获取服务配置成功->", resp);
        }).catch(function (e) {
            console.error("获取服务配置失败->",e)
        })
    };

    // 开始录制事件
    recordingBtn.onclick = function(){
        recordingManager.startRecording(roomId).then(function(resp){
            console.log("开启录制成功->", resp);
            const recordingId = resp.id;

            // 停止录制事件
            stopRecordingBtn.onclick = function () {
                recordingManager.stopRecording(recordingId).then(function (resp) {
                    console.log("停止录制成功->", resp);
                }).catch(function (e) {
                    console.error("停止录制失败->",e)
                })
            };

            // 获取录制信息事件
            getRecordingBtn.onclick = function () {
                recordingManager.getRecordingInfo(recordingId).then(function (resp) {
                    console.log("获取录制信息成功->", resp);
                }).catch(function (e) {
                    console.error("获取录制信息失败->",e)
                })
            };

            // 删除录制事件
            deleteRecordingBtn.onclick = function () {
                recordingManager.deleteRecording(recordingId).then(function (resp) {
                    console.log("删除录制成功->", resp);
                }).catch(function (e) {
                    console.error("删除录制失败->",e)
                })
            }

        }).catch(function(e){
            console.error("开启录制失败->",e)
        });
    };

    // 获取所有录制信息事件
    getAllRecordingBtn.onclick = function () {
        recordingManager.getAllRecordingInfo().then(function (resp) {
            console.log("获取所有录制信息成功->", resp);
        }).catch(function (e) {
            console.error("获取所有录制信息失败->",e)
        })
    };

    // 分享屏幕事件
    screenShareBtn.onclick = function(){
        roomManager.getShareScreenPublisher(undefined, (publisher) => { // 监听停止共享屏幕事件
            // 解除屏幕共享视频流
            roomManager.session.unpublish(publisher);
            // 将本人的视频流重新发布
            roomManager.session.publish(localPublisher);
        }).then((publisher) => {

            roomManager.session.unpublish(localPublisher);
            roomManager.session.publish(publisher);
            publisher.addVideoElement(masterVideo)

        }).catch(errorMsg => {
            alert(errorMsg);
        })
    }

    // 关闭会议
    destroyRoomBtn.onclick = function(){
        videoConference.roomManager.destroyRoom(roomId);
    };

    operatorDom.appendChild(leaveRoomBtn);
    operatorDom.appendChild(serverConfigBtn);
    operatorDom.appendChild(recordingBtn);
    operatorDom.appendChild(stopRecordingBtn);
    operatorDom.appendChild(getRecordingBtn);
    operatorDom.appendChild(deleteRecordingBtn);
    operatorDom.appendChild(getAllRecordingBtn);
    operatorDom.appendChild(screenShareBtn);
    operatorDom.appendChild(destroyRoomBtn);

    contentDom.appendChild(operatorDom);
}

function createMasterVideo() {
    var contentDom = document.querySelector(".content");
    var masterVideo = document.createElement("video");

    masterVideo.autoplay = true;
    masterVideo.style.width = "100%";
    masterVideo.style.height = "100%";
    masterVideo.style.objectFit = "cover";
    masterVideo.style.transform = "rotateY(180deg)";

    contentDom.appendChild(masterVideo);

    return masterVideo;
}

// 获取url参数
function getURLParameters(search) {
    if(!search) return {};
    return search.match(/([^?=&]+)(=([^&]*))/g)
        .reduce((a, v) => (a[v.slice(0, v.indexOf('='))] = v.slice(v.indexOf('=') + 1), a), {});
}


function start() {
    var videoConference = new SK_VideoConference({
        serverUrl: "https://check.shikongshuzhi.com/videoConference",
        serverSecret: "MY_SECRET",
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
        ]
    });
    // var videoConference = new SK_VideoConference({
    //     serverUrl: "https://192.168.1.104:4443",
    //     serverSecret: "MY_SECRET",
    //     iceServers:[]
    // });

    var roomId = "007";  // 房间ID
    var localUsername = "本地用户_" + Math.floor(Math.random() * 100);
    var leftDom = document.querySelector(".left");
    var rightDom = document.querySelector(".right");
    var subscribers = [];
    var urlParams = getURLParameters(window.location.search);

    // 创建中间视频video
    var masterVideo = createMasterVideo();

    // 检查设备支持情况
    videoConference.checkSupportDevice().then((data) => {
        if(!data.isExistAudioDevice){
            alert("未检测到麦克风");
        }

        if(!data.isExistVideoDevice){
            alert("未检测到摄像头");
        }
    }).catch(e => {
        console.error(e);
    });

    videoConference.joinRoom({
        roomId: roomId,
        username: localUsername,
        role: urlParams.role || "PUBLISHER", // 角色只接受这三种 "MODERATOR" |  "PUBLISHER" | "SUBSCRIBER"
        // 用人员加入会议时，额外添加的附属信息
        metadata: {
            phone: "15010003357"
        },
        isCreateVideo: true,
        initPublisherFinished: function(resp){
            var video  = resp.video;
            var publisher = resp.publisher;

            var localVideoWrapper = createVideoWrapper(video, localUsername, videoConference, publisher, masterVideo);
            leftDom.appendChild(localVideoWrapper);
            createOperator(videoConference, roomId, masterVideo, publisher);

            // 当自身被踢出会议时，将清除video
            publisher.on("streamDestroyed", (event) => {
                if(event.reason !== "unpublish"){
                    leftDom.removeChild(localVideoWrapper);
                }
            });
        },
        // 监听订阅者加入
        subscriberJoinListener: function (resp) {
            var subscriber = resp.subscriber;
            // 获取会议人员进入会议时的附属信息
            const { username, phone } = resp.metaData;
            var event = resp.event;
            var video = resp.video;

            var videoWrapper = createVideoWrapper(video, username, videoConference, subscriber, masterVideo);
            rightDom.appendChild(videoWrapper);
            subscribers.push({
                stream: event.stream,
                videoWrapper:videoWrapper,
            });
        },
        // 监听订阅者离开
        subscriberLeaveListener: function (event) {
            var userStream = subscribers.filter((item) => item.stream === event.stream)[0];
            var index = subscribers.indexOf(userStream, 0);

            if (index !== -1) {
                var videoWrapper = subscribers[index].videoWrapper;
                rightDom.removeChild(videoWrapper);
                subscribers.splice(index, 1);
            }
        }
    }).then(function(){

    }).catch(function(e){
        console.error("e->", e)
    });

}

start();
