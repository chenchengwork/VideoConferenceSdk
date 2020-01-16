# server说明文档

### docker方式启动说明
```
docker run -p 4443:4443 --rm \
        -v /var/run/docker.sock:/var/run/docker.sock \
        -v /data/test/recordingVideo:/data/test/recordingVideo \
        -e openvidu.secret=MY_SECRET \
        -e openvidu.publicurl="https://10.0.5.172":4443 \
        -e openvidu.recording=true \
        -e openvidu.recording.path=/data/test/recordingVideo \
        -e openvidu.recording.public-access=true \
        openvidu/openvidu-server-kms:2.11.0

参数说明：
    -p 4443:4443 --> 本机端口:容器端口
    -v /var/run/docker.sock:/var/run/docker.sock --> 本机docker守护进程套接字:容器套接字 // 这样容器中的进程就可以和Docker守护进程进行通信。
    -v /data/test/recordingVideo:/data/test/recordingVideo --> 本机存放录制文件的目录:container存放录制文件的目录, 注意:两边的目录路径必须一致
    -e openvidu.secret --> 服务端所需要的密码字符串
    -e openvidu.publicurl --> 服务端对外的公网访问方式
    -e openvidu.recording --> 是否开启录制功能
    -e openvidu.recording.path --> 录制目录
    -e openvidu.recording.public-access --> 是否可以外网访问录制目录

外网访问录制文件的方式:
https://SERVER_IP:[server.port]/recordings/<RECORDING_ID>/<RECORDING_NAME>.<EXTENSION>
例如: https://10.0.5.172:4443/recordings/ss/ss.mp4
```
