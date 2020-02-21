/**
 * 将video设置为镜面
 */
export const mirrorVideo = (video: HTMLVideoElement): void  => {
	video.style.transform = 'rotateY(180deg)';
	video.style.webkitTransform = 'rotateY(180deg)';
};

/**
 * 取消video的镜面
 */
export const removeMirrorVideo = (video: HTMLVideoElement): void => {
	video.style.transform = 'unset';
	video.style.webkitTransform = 'unset';
};


/**
 * 创建video dom
 */
export const createVideoDom = (): HTMLVideoElement => {
	const video = document.createElement("video");
	video.style.objectFit = "cover";
	video.style.backgroundColor = "#000";
	return video;
};
