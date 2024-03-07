<script setup lang="ts">
    const props = defineProps({
        time: String
    })

    const timer = computed(() => {
        return new Date(props.time).getTime()
    })

    const remaining = ref("")

    onMounted(() => {
        const secondsRemaining = setInterval(() => {
            const now = new Date().getTime()
            const distance = timer.value - now
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((distance % (1000 * 60)) / 1000)
            remaining.value = minutes + "m " + seconds + "s "
            if (distance < 0) {
                clearInterval(secondsRemaining)
                remaining.value = "EXPIRED"
            }
        }, 1000)
    })
</script>
<template>
    <div>
        {{ remaining }}
    </div>
</template>