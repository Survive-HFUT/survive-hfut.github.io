<script setup>
import { useRouter } from 'vitepress';
import { data } from '../../sidebar.data'

const url = data[Math.floor(Math.random() * data.length)];
useRouter().go(url);

</script>

<template></template>