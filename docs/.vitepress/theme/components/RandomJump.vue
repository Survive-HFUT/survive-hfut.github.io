<script setup>
import { useRouter } from 'vitepress';
import { data } from '../../sidebar.data'

const url = data[Math.floor(Math.random() * data.length)];
useRouter().go(url);

</script>

<template>
    <div class="loading-container">
        <div class="loading"></div>
    </div>
</template>

<style scoped>
.loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 40px;
    margin-bottom: 40px;
}

.loading {
    display: block;
    position: relative;
    width: 6px;
    height: 10px;
    animation: rectangle infinite 1s ease-in-out -0.2s;
    background-color: #000;
}

.loading:before,
.loading:after {
    position: absolute;
    width: 6px;
    height: 10px;
    content: "";
    background-color: #000;
}

.loading:before {
    left: -14px;
    animation: rectangle infinite 1s ease-in-out -0.4s;
}

.loading:after {
    right: -14px;
    animation: rectangle infinite 1s ease-in-out;
}

@keyframes rectangle {

    0%,
    80%,
    100% {
        height: 20px;
        box-shadow: 0 0 #000;
    }

    40% {
        height: 30px;
        box-shadow: 0 -20px #000;
    }
}
</style>
