<template>
    <div>App3</div>
    <button @click="handleClick">开启</button>
</template>

<script lang="ts" setup>
import axios from 'axios';

// interface

// props

// emits

// state

// computed

// watch

// onMounted

// onUnmounted

// function
function handleClick(){
    axios.post(import.meta.env.VITE_SERVER_URL + '/api/chat-messages', {"inputs":{},"query":"test","conversation_id":"7cc6ea95-7e91-4e57-a0c2-ce0cbd152ca5","response_mode":"streaming"})
}
</script>

<style lang="scss" module>
/* @import '@style/import.scss'; */

</style>