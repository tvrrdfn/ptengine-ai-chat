<template>
    <!--气泡样式-->
    <ChatBubble
        :opened="opened"
        v-if="visibleBubble"
        @open-chat="openChat"
        @close-chat="closeChat"
    ></ChatBubble>

    <!--对话框-->
    <ChatBot :opened="opened" :sid="sid" :sdkArea="sdkArea"></ChatBot>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, computed, ref, provide } from 'vue';
import ChatBot from '@/bot/ChatBot.vue';
import ChatBubble from '@/bubble/ChatBubble.vue';
import { useEventBus } from '@/hooks/useEventBus';
import type { SDKArea } from '@/types/widget.types';

const topWindow = (window.top || window) as Window;
const sid = window.ptengineSid as string;
const sdkArea = window.ptengineArea as SDKArea;
const opened = ref(false);

provide('topWindow', topWindow);

/**
 * 显示气泡
 *
 *  1. 气泡已关闭 - 不显示
 *  2. 登陆中 - 不显示
 *  3. 未登录 - 显示
 *  4. 已登录(账号包含当前档案) - 显示
 *  5. 已登录(账号不包含当前档案) - 不显示
 */
const visibleBubble = computed(() => {
    // if (loginState.value === 'pageLoading' || widgetClosed.value) {
    //     return false;
    // }
    return true;
});

onMounted(() => {
    watchRouterChange();
});

onUnmounted(() => {});

function openChat() {
    opened.value = true;
}

function closeChat() {
    opened.value = false;
}

function createProxyHandler(preUrl: string, callback: (newUrl: string, preUrl: string) => void) {
    return {
        apply: (target, that, args) => {
            target.apply(that, args);
            const newUrl = document.location.href;
            callback(newUrl, preUrl);
            preUrl = newUrl;
        }
    };
}

function watchRouterChange() {
    try {
        const preUrl = topWindow.document?.location?.href;

        topWindow.history.pushState = new Proxy(
            topWindow.history.pushState,
            createProxyHandler(preUrl, handleStateChange)
        );

        topWindow.history.replaceState = new Proxy(
            topWindow.history.replaceState,
            createProxyHandler(preUrl, handleStateChange)
        );
    } catch (e) {
        console.log(e);
    }
}

function handleStateChange() {
    console.log('router --- change');
    useEventBus().emit('RouterChange');
}
</script>

<style lang="scss" module>
@import '@/assets/style/main.scss';
@import '@/assets/style/import.scss';

html {
    width: auto;
    height: auto;
}

body {
    --body-zindex: 2147483647; //需大于弹出热图
    --bubble-zindex: 2147483647;
    --bubble-size: 36px;
    --bubble-size-x: 44px;
    --bubble-shadow: 0px 4px 16px 0px rgba(0, 0, 0, 0.16);
    --bubble-bg: rgba(22, 184, 54, 0.8);
    --bubble-bg-blur: 8px;
    --bubble-hover-bg: #{$pt-green-70};
    --chat-bot-width: 430px;

    width: 0;
    height: 0;

    &[data-moving='true'] {
        width: 100vw;
        height: 100vh;

        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: transparent !important;
        z-index: var(--body-zindex);
    }
}
</style>
