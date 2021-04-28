import Directories from "./Directories";
import fs from "fs";
import path from 'path';
import fetch from 'node-fetch'
import decompressTargz from "decompress-targz";
import decompress from "decompress";


export function installMpv(app) {
    app.commandLine.appendSwitch("no-sandbox");
    app.commandLine.appendSwitch("ignore-gpu-blacklist");
    try {
        let pluginDir = path.join(Directories.files, 'build', 'Release');
        if (process.platform !== "linux")
            process.chdir(pluginDir);
        const filePath = path.join(pluginDir, 'mpvjs.node');
        const pluginEntry = getPluginEntry(pluginDir);
        const exists = fs.existsSync(filePath);
        console.log({
            pluginDir,
            filePath,
            exists,
            pluginEntry
        });
        app.commandLine.appendSwitch("register-pepper-plugins", pluginEntry);
    } catch (e) {
        console.log("Can't load mpv, downloading node file now");
        getMpvBuild().then(() => {
            app.relaunch();
            app.exit();
        });
    }
}


export async function checkFileExists(file) {
    return fs.promises.access(file, fs.constants.F_OK)
        .then(() => true)
        .catch(() => false)
}

export async function downloadFile(url, destinationFile, abortSignal = null) {
    let res = await fetch(url, {signal: abortSignal});
    let blob = await res.blob();
    let writer = fs.createWriteStream(destinationFile);
    writer.write(Buffer.from(await blob.arrayBuffer()));
}

export async function getMpvBuild() {
    let targetFile = path.join(Directories.files, 'build', 'Release', 'mpvjs.node');
    if (await checkFileExists(targetFile)) {
        console.log("Using cached mpv");
        return targetFile;
    }

    try {
        const repo = 'Kagami/mpv.js';
        const latestReleaseUrl = `https://api.github.com/repos/${repo}/releases/latest`;
        console.log('fetching latest release');
        const release = await fetch(latestReleaseUrl).then(d => d.json());
        console.log('fetching asset list for latest release');
        const assets = await fetch(release.assets_url).then(d => d.json());
        const asset = assets.find(a => a.name.includes(process.platform) && a.name.includes(process.arch));
        console.log('downloading', asset.browser_download_url);
        const targzFile = path.join(Directories.files, asset.name);
        await downloadFile(asset.browser_download_url, targzFile);
        console.log('downloaded to', targzFile);

        await decompress(targzFile, Directories.files, {plugins: [decompressTargz()]});
        console.log('Files decompressed to', Directories.files);
        return targetFile;
    } catch (e) {
        console.warn('download mpv error', e);
        return false;
    }
}

// From mpv.js: https://github.com/Kagami/mpv.js/
function containsNonASCII(str) {
    for (let i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) > 255) {
            return true;
        }
    }
    return false;
}

// From mpv.js: https://github.com/Kagami/mpv.js/
function getPluginEntry(pluginDir, pluginName = "mpvjs.node") {
    const PLUGIN_MIME_TYPE = "application/x-mpvjs";
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
