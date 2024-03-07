<script setup lang="ts">
const chat = useChat();
const props = defineProps<{
  userId: number;
}>();

const user = computed(() => {
  return chat.activeConversation?.getUser(props.userId);
});
</script>
<template>
  <div
    class="hover:text-blue-200 cursor-pointer hover:scale-120 transition-all"
    @click="chat.showProfile(user)"
  >
    @{{ user?.username }}
  </div>
</template>
