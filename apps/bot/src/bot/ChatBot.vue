<template>
    <div :class="[$style.bot, props.opened && $style.open]" ref="BotRef">
        <iframe :src="IframeUrl" ref="IframeRef" :onload="handleLoad"></iframe>
    </div>
</template>

<script lang="ts" setup>
import { ref, inject, onMounted } from 'vue';
import { useMessage, Message } from '@/hooks/useMessage';
import { useEventBus } from '@/hooks/useEventBus';

const props = defineProps<{
    opened: boolean;
    sid: string;
}>();

// state
const topWindow = inject('topWindow') as Window;
const BotRef = ref();
const IframeRef = ref();
const IframeUrl = import.meta.env.VITE_AI_CHAT_URL!.toString();

onMounted(() => {
    useEventBus().on('RouterChange', handleRouterChange);
    useMessage()
        .start(IframeRef.value.contentWindow, IframeUrl, topWindow)
        .subscribe('ChatBotRequestConnection', handleRequestConnection);
});

/**
 * 当接收到Bot内发出的请求连接的消息，则发送sid及url等信息
 */
function handleRequestConnection() {
    console.log('ChatBotRequestConnection --->');
    const curUrl = topWindow.location.href;
    useMessage().sendMessage({
        command: 'ChatBotRequestConnectionCallback',
        source: curUrl,
        data: {
            sid: props.sid,
            url: curUrl
        }
    });
}

function handleLoad() {
    console.log('load --->');
    // useMessage().sendMessage({
    //     command: 'hellow',
    //     source: curUrl
    // });
}

function handleRouterChange() {
    handleRequestConnection();
}
</script>

<style lang="scss" module>
@import '@/assets/style/import.scss';

.bot {
    position: fixed;
    right: calc(var(--chat-bot-width) * -1);
    top: 0;
    bottom: 0;
    z-index: 1;
    width: var(--chat-bot-width);
    height: 100%;
    background-color: #fff;
    box-shadow: -1px 0 1px #919eab3d;
    transition: transform 0.3s ease-in-out;

    &.open {
        transform: translateX(calc(var(--chat-bot-width) * -1));
    }

    iframe {
        width: 100%;
        height: 100%;
        border: none;
    }
}
</style>
