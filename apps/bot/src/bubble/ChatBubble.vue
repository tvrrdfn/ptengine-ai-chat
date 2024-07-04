<template>
    <div
        data-position-x="right"
        data-position-y="bottom"
        :data-locale="i18n.global.locale"
        :class="[$style.animate__zoomInLeft, $style.container, props.opened && $style.opened]"
        ref="draggableRef"
    >
        <!-- 拖拽 -->
        <div :class="$style.handle" ref="draggableHandleRef">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="10"
                height="18"
                viewBox="0 0 10 18"
                fill="none"
            >
                <g filter="url(#filter0_d_1987_8551)">
                    <rect x="2" width="2" height="2" rx="1" fill="white" />
                    <rect x="6" width="2" height="2" rx="1" fill="white" />
                    <rect x="2" y="4" width="2" height="2" rx="1" fill="white" />
                    <rect x="6" y="4" width="2" height="2" rx="1" fill="white" />
                    <rect x="2" y="8" width="2" height="2" rx="1" fill="white" />
                    <rect x="6" y="8" width="2" height="2" rx="1" fill="white" />
                    <rect x="2" y="12" width="2" height="2" rx="1" fill="white" />
                    <rect x="6" y="12" width="2" height="2" rx="1" fill="white" />
                </g>
                <defs>
                    <filter
                        id="filter0_d_1987_8551"
                        x="0"
                        y="0"
                        width="10"
                        height="18"
                        filterUnits="userSpaceOnUse"
                        color-interpolation-filters="sRGB"
                    >
                        <feFlood flood-opacity="0" result="BackgroundImageFix" />
                        <feColorMatrix
                            in="SourceAlpha"
                            type="matrix"
                            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                            result="hardAlpha"
                        />
                        <feOffset dy="2" />
                        <feGaussianBlur stdDeviation="1" />
                        <feComposite in2="hardAlpha" operator="out" />
                        <feColorMatrix
                            type="matrix"
                            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.16 0"
                        />
                        <feBlend
                            mode="normal"
                            in2="BackgroundImageFix"
                            result="effect1_dropShadow_1987_8551"
                        />
                        <feBlend
                            mode="normal"
                            in="SourceGraphic"
                            in2="effect1_dropShadow_1987_8551"
                            result="shape"
                        />
                    </filter>
                </defs>
            </svg>
        </div>

        <!-- 退出Chat -->
        <div :class="$style.exit" v-if="props.opened" @click="emit('closeChat')">
            <div :class="$style.icon">
                <pt-icon icon="pt-icon-exit"></pt-icon>
            </div>
            <span>{{ $t('chat.bubble_exit_chat') }}</span>
        </div>

        <!-- Chat Logo -->
        <div :class="$style.logo" v-else @click="emit('openChat')">
            <pt-icon icon="pt-icon--pt"></pt-icon>
            <span>{{ $t('chat.open_chat') }}</span>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { debounce } from 'lodash-es';
import { ref, onMounted, onUnmounted, inject } from 'vue';
import i18n from '@/i18n/i18n';
import { useDraggable } from '@/hooks/useDraggable';
import { getViewSize } from '@/utils/dom.util';
import { createObserver } from '@/utils/browser.util';

const props = defineProps<{
    opened: boolean;
}>();

const topWindow = inject('topWindow') as Window;
const emit = defineEmits(['openChat', 'closeChat']);

// state
const draggableRef = ref();
const draggableHandleRef = ref();
const bubbleObserver = ref();

onMounted(() => {
    if (draggableRef.value) {
        activeDraggable(draggableRef.value, draggableHandleRef.value);

        const moveDebounce = debounce(updatePosition, 500);
        bubbleObserver.value = createObserver(
            draggableRef.value,
            { attributes: true },
            function (mutations: MutationRecord[], observer: MutationObserver) {
                for (const mutation of mutations) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        moveDebounce();
                    }
                }
            }
        );
    }
});

onUnmounted(() => {
    bubbleObserver.value?.disconnect();
});

/**
 * 初始化拖拽
 */
function activeDraggable(targetElement: HTMLElement, handleElement: HTMLElement) {
    targetElement &&
        useDraggable(targetElement, handleElement, {
            maxX: 0,
            disableX: true
        });
}
/**
 * 根据偏移位置调整悬浮元素坐标
 */
function updatePosition() {
    if (!draggableRef.value) {
        return;
    }

    const bubbleWidth = 200;
    const bubbleHeight = 150;
    const { viewportWidth, viewportHeight } = getViewSize(topWindow);
    const { left, top, bottom, right } = draggableRef.value.getBoundingClientRect();
    const x = left + bubbleWidth > viewportWidth ? 'right' : 'left';
    const y = bottom - bubbleHeight > 0 ? 'bottom' : 'top';

    draggableRef.value.setAttribute('data-position-x', x);
    draggableRef.value.setAttribute('data-position-y', y);
}
</script>

<style lang="scss" module>
@import '@/assets/style/import.scss';

@mixin bubbleTransition() {
    transition-timing-function: ease;
    transition-duration: 0.3s;
    transition-delay: 60ms;
}

.animate__animated {
    -webkit-animation-duration: 1s;
    animation-duration: 1s;
    -webkit-animation-duration: 1s;
    animation-duration: 1s;
    -webkit-animation-fill-mode: both;
    animation-fill-mode: both;
}

@-webkit-keyframes zoomInLeft {
    0% {
        opacity: 0;
        -webkit-transform: scale3d(0.1, 0.1, 0.1) translate3d(-1000px, 0, 0);
        transform: scale3d(0.1, 0.1, 0.1) translate3d(-1000px, 0, 0);
        -webkit-animation-timing-function: cubic-bezier(0.55, 0.055, 0.675, 0.19);
        animation-timing-function: cubic-bezier(0.55, 0.055, 0.675, 0.19);
    }

    60% {
        opacity: 1;
        -webkit-transform: scale3d(0.475, 0.475, 0.475) translate3d(10px, 0, 0);
        transform: scale3d(0.475, 0.475, 0.475) translate3d(10px, 0, 0);
        -webkit-animation-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1);
        animation-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1);
    }
}

@keyframes zoomInLeft {
    0% {
        opacity: 0;
        -webkit-transform: scale3d(0.1, 0.1, 0.1) translate3d(-1000px, 0, 0);
        transform: scale3d(0.1, 0.1, 0.1) translate3d(-1000px, 0, 0);
        -webkit-animation-timing-function: cubic-bezier(0.55, 0.055, 0.675, 0.19);
        animation-timing-function: cubic-bezier(0.55, 0.055, 0.675, 0.19);
    }

    60% {
        opacity: 1;
        -webkit-transform: scale3d(0.475, 0.475, 0.475) translate3d(10px, 0, 0);
        transform: scale3d(0.475, 0.475, 0.475) translate3d(10px, 0, 0);
        -webkit-animation-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1);
        animation-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1);
        -moz-transform: scale3d(0.475, 0.475, 0.475) translate3d(10px, 0, 0);
        -ms-transform: scale3d(0.475, 0.475, 0.475) translate3d(10px, 0, 0);
        -o-transform: scale3d(0.475, 0.475, 0.475) translate3d(10px, 0, 0);
    }
}

.animate__zoomInLeft {
    -webkit-animation-name: zoomInLeft;
    animation-name: zoomInLeft;
}

/* 定义动画 */
@keyframes move {
    0% {
        transform: translateY(0);
    }

    100% {
        transform: translateY(-100%);
    }
}

@keyframes rotate {
    100% {
        transform: rotate(360deg);
    }
}

.container {
    position: fixed;
    bottom: 30px;
    left: 0;
    display: flex;
    align-items: center;
    z-index: var(--bubble-zindex);

    &[data-position-x='left'] {
        flex-direction: row;

        .label {
            left: 0 !important;
            right: auto !important;
            flex-direction: row;
        }

        .detail {
            padding: 0 12px 0 0;
        }

        .tooltip {
            left: 100% !important;
            right: auto !important;
            margin: 0 0 0 6px !important;
            white-space: nowrap;
        }
    }
    &[data-position-x='right'] {
        left: auto;
        right: 0;
        flex-direction: row-reverse;

        .label {
            left: auto !important;
            right: 0 !important;
            flex-direction: row-reverse;
        }

        .detail {
            padding: 0 0 0 12px;
        }

        .tooltip {
            left: auto !important;
            right: 100% !important;
            margin: 0 6px 0 0 !important;
        }
    }
    &[data-position-y='top'] {
        .menu {
            top: 100% !important;
            bottom: auto !important;
        }
    }
    &[data-position-y='bottom'] {
        .menu {
            top: auto !important;
            bottom: 100% !important;
        }
    }
    &[data-moving='true'] {
        pointer-events: none;
    }
    &[data-moving='true'],
    &:hover {
        .handle {
            visibility: visible;
        }
    }

    &[data-locale='EN'] {
        .widget:hover .main {
            width: 220px !important;
        }
    }

    &[data-locale='ZH'] {
        .widget:hover .main {
            width: 192px !important;
        }
    }

    &[data-locale='JP'] {
        .widget:hover .main {
            width: 190px !important;
        }
    }

    &.opened {
        right: var(--chat-bot-width);
    }

    .widget {
        position: relative;
        cursor: pointer;
        user-select: none;

        &:hover {
            .menu {
                height: calc(var(--bubble-size-x) * 2 + 8px * 2);
                opacity: 1;
                overflow: inherit;

                .item {
                    opacity: 1;
                    transform: scale(1);
                }
            }

            .main {
                // width: attr(data-width) !important;// 190px !important;
                height: var(--bubble-size-x);
                border-radius: calc(var(--bubble-size-x) / 2);
                background-color: var(--bubble-bg);
                backdrop-filter: blur(--bubble-bg-blur);

                .left {
                    margin-left: 10px;
                    .user {
                        display: none;
                    }
                    .heatmapIcon {
                        display: block;
                    }
                }

                .right {
                    div[data-user='true'] {
                        display: none;
                    }

                    .detail {
                        opacity: 1;
                    }
                }
            }
        }

        .menu {
            display: flex;
            opacity: 1;
            flex-direction: column;
            opacity: 0;
            height: 0px;
            position: absolute;
            top: 100%;
            overflow: hidden;

            .item {
                align-items: center;
                display: flex;
                transition: all 0.2s ease 0s;
                opacity: 0;
                transform: scale(0);
                transform-origin: left center;
                position: relative;
                margin-bottom: 8px;

                &:hover {
                    .tooltip {
                        display: block;
                    }
                }

                .content {
                    position: relative;
                    -webkit-box-align: center;
                    align-items: center;
                    -webkit-box-pack: center;
                    justify-content: center;
                    display: flex;
                    border-radius: 50%;
                    width: var(--bubble-size-x);
                    height: var(--bubble-size-x);
                    background-color: var(--bubble-bg);
                    box-shadow: var(--bubble-shadow);
                    backdrop-filter: blur(var(--bubble-bg-blur));

                    &:hover {
                        background-color: var(--bubble-hover-bg);
                        backdrop-filter: none;
                    }

                    svg {
                        fill: $pt-white;
                    }
                }

                .tooltip {
                    -webkit-box-align: center;
                    align-items: center;
                    display: none;
                    margin-left: 6px;
                    border-radius: 14px;
                    padding: 0 12px;
                    color: $pt-white;
                    font-size: 13px;
                    height: 28px;
                    line-height: 28px;
                    background-color: rgba(34, 34, 34, 0.9);
                    backdrop-filter: blur(4px);
                    position: absolute;
                    left: 100%;
                }
            }
        }

        .main {
            height: var(--bubble-size);
            position: relative;
            background-color: rgba(255, 255, 255, 0.8);
            border-radius: calc(var(--bubble-size) / 2);
            box-shadow: var(--bubble-shadow);
            backdrop-filter: blur(var(--bubble-bg-blur));
            overflow: hidden;
            @include bubbleTransition();
            display: flex;
            align-items: center;

            &:hover {
                background-color: var(--bubble-hover-bg);
            }

            .left {
                width: 24px;
                height: 24px;
                margin-left: 6px;

                .user {
                    position: relative;

                    svg {
                        width: calc(var(--bubble-size) - 12px);
                        height: calc(var(--bubble-size) - 12px);
                    }

                    .circle {
                        position: absolute;
                        top: 0;
                        left: 0;

                        svg {
                            animation-name: rotate;
                            animation-duration: 1s; //与 widget.config.ts 中 loadingAnimationDurationTime 一致
                            animation-timing-function: linear;
                            animation-iteration-count: infinite;
                            transform-origin: center center;
                        }
                    }
                }

                .heatmapIcon {
                    width: 24px !important;
                    height: 24px !important;
                    fill: $pt-white;
                    display: none;
                }
            }

            .right {
                flex: 1;
                padding-right: 12px;
                display: flex;
                position: relative;

                div[data-user='true'] {
                    margin-left: 8px;
                    text-align: center;
                    height: 14px;
                    line-height: 14px;
                    overflow: hidden;

                    &[data-active] span {
                        animation: move 1s;
                        animation-fill-mode: forwards;
                    }

                    span {
                        color: $pt-green-60;
                        font-weight: 500;
                        font-size: 12px;
                        display: block;
                        transform: translateY(0);
                    }
                }

                .detail {
                    padding: 0 12px;
                    line-height: 1em;
                    color: $pt-white;
                    overflow: hidden;
                    opacity: 0;
                    position: absolute;
                    left: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    @include bubbleTransition();

                    h4 {
                        font-size: 13px;
                        font-weight: 500;
                        white-space: nowrap;
                        display: flex;
                        align-items: center;
                    }

                    p {
                        font-size: 12px;
                        font-weight: 400;
                        opacity: 0.8;
                        white-space: nowrap;
                    }
                }
            }

            .label {
                height: var(--bubble-size-x);
                align-items: center;
                white-space: nowrap;
                overflow: hidden;
                display: flex;
                box-shadow: var(--bubble-shadow);
                padding: 0 10px;

                .icon {
                    flex: 0 0 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;

                    svg {
                        width: 24px !important;
                        height: 24px !important;
                        fill: $pt-white;
                    }
                }
            }
        }
    }

    .handle {
        display: flex;
        align-items: center;
        cursor: move;
        height: var(--bubble-size);
        visibility: hidden;
        margin-right: 4px;

        svg {
            margin-top: 6px;
        }
    }

    .logo {
        width: var(--bubble-size);
        height: var(--bubble-size);
        border-radius: calc(var(--bubble-size) / 2);
        background: $pt-white;
        box-shadow: var(--bubble-shadow);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        text-align: center;
        overflow: hidden;
        @include bubbleTransition();

        &::before {
            content: '';
            width: calc(var(--bubble-size) - 10px);
            height: calc(var(--bubble-size) - 10px);
            border-radius: 50%;
            background-color: $pt-green-60;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }

        &:hover {
            width: auto;
            width: 150px;
            background: $pt-green-60;

            &::before,
            svg {
                display: none;
            }

            span {
                display: block;
            }
        }

        svg {
            fill: $pt-white;
            width: 14px !important;
            height: 14px !important;
            position: relative;
            z-index: 10;
        }

        span {
            color: $pt-white;
            font-size: 13px;
            font-style: normal;
            font-weight: 500;
            padding: 0 12px;
            white-space: nowrap;
            display: none;
        }
    }

    .exit {
        height: var(--bubble-size);
        background: $pt-white;
        box-shadow: 0px 4px 8px rgba(9, 30, 66, 0.2);
        cursor: pointer;
        display: flex;
        align-items: center;
        border-radius: calc(var(--bubble-size) / 2);

        &:hover {
            span {
                display: block;
            }
        }

        span {
            display: none;
            font-family: 'Noto Sans SC';
            font-style: normal;
            font-weight: 500;
            font-size: 13px;
            color: #222;
            margin: 0 16px 0 0;
        }

        .icon {
            width: var(--bubble-size);
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;

            svg {
                width: 20px !important;
                height: 20px !important;
                fill: #222;
            }
        }
    }
}
</style>
