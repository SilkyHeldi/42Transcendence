<script setup lang="ts">
const chat = useChat();
const props = defineProps<{
  userId: number;
}>();

const user = computed(() => {
  return chat.manager.active?.getUser(props.userId);
});
</script>
<template>
  <div @click="user ? chat.showProfile(user) : undefined"><slot :user="user"></slot></div>
</template>
