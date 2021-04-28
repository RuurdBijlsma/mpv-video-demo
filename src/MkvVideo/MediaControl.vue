<template>
    <audio loop ref="audio"></audio>
</template>

<script>
import audioUrl from "./js/emptyAudio";

export default {
    name: "MediaControl",
    props: {
        paused: {
            type: Boolean,
            required: true,
        },
    },
    data: () => ({
        audioControl: null,
    }),
    mounted() {
        this.audioControl = this.$refs.audio;
        this.audioControl.src = audioUrl;
        if (!this.paused) {
            this.audioControl.play();
        }
        this.setMetadata();
    },
    methods: {
        async setMetadata() {
            if (!('mediaSession' in navigator))
                return;

            navigator.mediaSession.setActionHandler('play', () => {
                this.$emit('play');
            });

            navigator.mediaSession.setActionHandler('pause', () => {
                this.$emit('pause');
            });
        },
    },
    watch: {
        paused() {
            if (this.paused)
                this.audioControl.pause();
            else
                this.audioControl.play();
        },
    },
}
</script>

<style scoped>

</style>
