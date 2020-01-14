/**
 * Copyright (c) Shikongshuzhi, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import SK_VideoConference from './SK_VideoConference';

// console.log(SK_VideoConference)
const echoStr: string = "hello world!!!s";
// console.log(echoStr);
// console.log(new SK_VideoConference());

export { SK_VideoConference }

// @ts-ignore
global.SK_VideoConference = SK_VideoConference;
