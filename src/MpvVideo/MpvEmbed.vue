<template>
    <div class="embed" ref="player">
    </div>
</template>

<script>
export default {
    name: "MpvEmbed",
    data: () => ({
        embed: null,
        state: null,
        command: null,
        hiddenState: {},
        ready: null,
    }),
    beforeDestroy() {
        this.embed.remove();
    },
    mounted() {
        this.ready = new Promise(resolve => {
            this.$on('ready', resolve);
        });

        const setProperty = (p, v) => this.setProperty(p, v);
        const executeCommand = (...args) => this.executeCommand(...args);
        const hiddenState = () => this.hiddenState;
        this.state = new Proxy({}, {
            get(target, property, receiver) {
                return hiddenState()[property];
            },
            set(target, property, value, receiver) {
                hiddenState()[property] = value;
                setProperty(property, value);
                return true;
            },
        });
        this.command = new Proxy({}, {
            get(target, property, receiver) {
                return (...args) => executeCommand(property.toLowerCase(), ...args);
            },
        });

        this.embed = document.createElement('embed');
        this.embed.type = 'application/x-mpvjs';
        this.$refs.player.appendChild(this.embed);
        this.embed.addEventListener('error', e => {
            console.warn('error', e);
        });
        this.embed.addEventListener('message', e => {
            let {type, data} = e.data;
            if (type === 'property_change') {
                let {name, value} = data;
                this.hiddenState[name] = value;
            }
            this.$emit('message', e.data);
            this.$emit(type, data);
        });
    },
    methods: {
        observe(...names) {
            names.forEach(name => this.postMessage('observe_property', name));
        },
        setProperty(property, value) {
            this.postMessage('set_property', {name: property, value});
        },
        executeCommand(...params) {
            this.postMessage('command', params);
        },
        postMessage(type, data) {
            this.embed.postMessage({type, data});
        },
    },
}
</script>

<style scoped>
.embed >>> embed {
    width: 100%;
    height: 100%;
}
</style>
