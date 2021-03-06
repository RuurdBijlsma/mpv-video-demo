/**
 * Corresponding JS part of mpv pepper plugin.
 * @module mpv.js
 */

"use strict";

const path = require("path");

/**
 * The MIME type associated with mpv.js plugin.
 */
const PLUGIN_MIME_TYPE = "application/x-mpvjs";

function containsNonASCII(str) {
    for (let i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) > 255) {
            return true;
        }
    }
    return false;
}

/**
 * Return value to be passed to `register-pepper-plugins` switch.
 *
 * @param {string} pluginDir - Plugin directory
 * @param {string} [pluginName=mpvjs.node] - Plugin name
 * @throws {Error} Resulting path contains non-ASCII characters.
 */
function getPluginEntry(pluginDir, pluginName = "mpvjs.node") {
    const fullPluginPath = path.join(pluginDir, pluginName);
    // Try relative path to workaround ASCII-only path restriction.
    let pluginPath = path.relative(process.cwd(), fullPluginPath);
    if (path.dirname(pluginPath) === ".") {
        // "./plugin" is required only on Linux.
        if (process.platform === "linux") {
            pluginPath = `.${path.sep}${pluginPath}`;
        }
    } else {
        // Relative plugin paths doesn't work reliably on Windows, see
        // <https://github.com/Kagami/mpv.js/issues/9>.
        if (process.platform === "win32") {
            pluginPath = fullPluginPath;
        }
    }
    if (containsNonASCII(pluginPath)) {
        if (containsNonASCII(fullPluginPath)) {
            throw new Error("Non-ASCII plugin path is not supported");
        } else {
            pluginPath = fullPluginPath;
        }
    }
    return `${pluginPath};${PLUGIN_MIME_TYPE}`;
}


module.exports = {PLUGIN_MIME_TYPE, getPluginEntry};
