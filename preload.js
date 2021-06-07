// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

// expose cpp logic to renderer process

const { contextBridge } = require('electron');

const cpp_logic = require("bindings")("native");

contextBridge.exposeInMainWorld("compute_str", cpp_logic.compute_str)