// jest.setup.js
require('@testing-library/jest-dom');

const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

if (typeof global.TransformStream === 'undefined') {
    global.TransformStream = require('web-streams-polyfill/dist/ponyfill').TransformStream;
}
if (typeof global.BroadcastChannel === 'undefined') {
    global.BroadcastChannel = require('broadcast-channel').BroadcastChannel;
}

global.BroadcastChannel = class {
    constructor() {}
    postMessage() {}
    close() {}
    onmessage = null;
};

