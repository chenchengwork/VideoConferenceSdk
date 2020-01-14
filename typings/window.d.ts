// 这个必须有，将文件转化为模块
export {}

// 给window对象添加全局的变量
declare global{
    interface Window {
        // 高德地图相关的全局变量
        __amap_init_callback: Function;
        amapkey: string;
        initAMapUI: Function;
        AMapUI: boolean;
        // @ts-ignore
        AMap: AMap,
    }

    interface Document {
        mozFullScreenElement: any;
        webkitFullscreenElement: any;
        msFullscreenElement: any;
        msExitFullscreen: any;
        mozCancelFullScreen: any;
        webkitExitFullscreen: any;
    }

    interface HTMLElement {
        msRequestFullscreen: any;
        mozRequestFullScreen: any;
        webkitRequestFullscreen: any;
    }
}
