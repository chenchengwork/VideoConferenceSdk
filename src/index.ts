/**
 * Copyright (c) Shikongshuzhi, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import SK_VideoConference from './SK_VideoConference';
export { default as RecordingManager } from "./lib/RecordingManager";
export { default as RoomManager } from "./lib/RoomManager";
export { SK_VideoConference }

// @ts-ignore
global.SK_VideoConference = SK_VideoConference;
