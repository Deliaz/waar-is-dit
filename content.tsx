import {initContentScript} from './content-script/index';

export const config = {
  matches: ["<all_urls>"],
  all_frames: true
};

initContentScript();