
function start() {
    const videoConference = new SK_VideoConference({
        serverUrl: "https://42.159.87.75:4443",
        serverSecret: "MY_SECRET"
    });

    const session = videoConference.createRoom("ss").catch((e) => {
        console.error("e->", e)
    });
}

start();
