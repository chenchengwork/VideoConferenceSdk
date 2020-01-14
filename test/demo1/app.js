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
    }).then(() => {

    }).catch((e) => {
        console.error("e->", e)
    });

}

start();
