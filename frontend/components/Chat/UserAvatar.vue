<script setup lang="ts">
const chat = useChat();

const props = defineProps({
  userId: {
    type: Number,
    required: true,
  },
  avatar: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    default: "h-12 w-12",
  },
});
</script>

<template>
  <div class="flex overflow-hidden mx-auto" :class="size">
        <div class="rounded bg-white p-.5 relative  mx-auto">
            <img :src="avatar" alt="" class="aspect-square h-full rounded">
            <div
                v-if="chat.status[userId] == 'online'"
                class="i-mdi-circle text-green absolute -bottom-2px -right-2px text-16px"
            ></div>         
        <div
            v-if="chat.status[userId] == 'offline'"
            class="i-mdi-circle text-red absolute -bottom-2px -right-2px text-16px"
        ></div>
        </div>
    </div>
</template>
