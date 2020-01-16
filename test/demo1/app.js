function createVideoWrapper(video, username){
    const videoWrapperDom = document.createElement("div");
    const usernameDom = document.createElement("div");

    videoWrapperDom.setAttribute("class", "video-wrapper");
    video.setAttribute("class", "video");

    usernameDom.setAttribute("class", "username");
    usernameDom.textContent = username;

    videoWrapperDom.appendChild(video);
    videoWrapperDom.appendChild(usernameDom);

    return videoWrapperDom;
}

function createOperator(videoConference, roomId){
    var recordingManager = videoConference.recordingManager;
    var contentDom = document.querySelector(".content");
    var serverConfigBtn = document.createElement("button");
    var recordingBtn = document.createElement("button");
    var stopRecordingBtn = document.createElement("button");
    var deleteRecordingBtn = document.createElement("button");
    var getRecordingBtn = document.createElement("button");
    var getAllRecordingBtn = document.createElement("button");

    serverConfigBtn.textContent = "获取服务配置";
    recordingBtn.textContent = "开始录制";
    stopRecordingBtn.textContent = "停止录制";
    getRecordingBtn.textContent = "获取录制信息";
    deleteRecordingBtn.textContent = "删除录制";
    getAllRecordingBtn.textContent = "获取所有录制信息";

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

    contentDom.appendChild(serverConfigBtn);
    contentDom.appendChild(recordingBtn);
    contentDom.appendChild(stopRecordingBtn);
    contentDom.appendChild(getRecordingBtn);
    contentDom.appendChild(deleteRecordingBtn);
    contentDom.appendChild(getAllRecordingBtn);
}


function start() {
    var videoConference = new SK_VideoConference();

    var roomId = "ss";  // 房间ID
    var localUsername = "本地用户_" + Math.floor(Math.random() * 100);
    var leftDom = document.querySelector(".left");
    var rightDom = document.querySelector(".right");
    var subscribers = [];

    videoConference.joinRoom({
        roomId: roomId,
        username: localUsername,
        initPublisherFinished: function(publisher, video){
            var localVideoWrapper = createVideoWrapper(video, localUsername);
            leftDom.appendChild(localVideoWrapper);

            createOperator(videoConference, roomId);
        },
        // 监听订阅者加入
        subscriberJoinListener: function (event, video, remoteMetaData) {
            var username = remoteMetaData.username;
            var videoWrapper = createVideoWrapper(video, username);

            subscribers.push({
                stream: event.stream,
                videoWrapper:videoWrapper,
            });

            rightDom.appendChild(videoWrapper);
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
