<script lang="ts" setup>
defineProps({
    content: String,
})

</script>

<template>
    <div class="custom-block tip">
        <p class="custom-block-title">💡 提示</p>
        <p>
            此页面需要更多补充。
            <a href="/about/contribute">
                <strong>帮助我们</strong>
            </a>
        </p>
        <ul v-if="content">
            <li v-for="line in content.split(';')">{{ line }}</li>
        </ul>
    </div>
</template>