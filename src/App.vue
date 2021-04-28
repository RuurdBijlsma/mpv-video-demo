<template>
    <div id="app">
        <pre>&lt;mpv-video&gt;</pre>
        <mpv-video height="auto" controls ref="video1" class="video"
                   src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        />

        <pre>&lt;video&gt;</pre>
        <video controls ref="video2" class="video"
               src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        />

        <br>
        <br>

        <input type="button" @click="switchVideo" value="switch source">
    </div>
</template>

<script>

import MpvVideo from "mpv-video";

export default {
    name: 'App',
    components: {
        MpvVideo,
    },
    mounted() {
        let video = this.$refs.video1;
        console.log("VIDEO", video);
    },
    methods: {
        switchVideo() {
            let video1 = this.$refs.video1;
            let video2 = this.$refs.video2;
            let newSrc = "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4";
            video1.src = newSrc;
            video2.src = newSrc;
            video1.play();
            video2.play();
        }
    }
}
</script>

<style>
html, body {
    margin: 0;
    text-align: center;
}

.video {
    width: 100%;
    max-width: 450px;
}

pre {
    color: #aaa;
    font-weight: bold;
    text-align: center;
    font-family: Consolas, monospace;
    font-size: 20px;

}
</style>
