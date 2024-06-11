import {initContentScript} from './content-script';

export const config = {
  matches: ["<all_urls>"],
  all_frames: true
};

initContentScript();