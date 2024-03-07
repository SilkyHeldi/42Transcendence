<script setup lang="ts">
import { WrappedConversation } from '~/composables/chat';
	const auth = useAuth()
	const chat = useChat()

</script>
<template>
    <div class="h-full  flex items-center w-full bg-zinc-900/50 p-1 rounded-br gap-2" v-if="chat.manager.active">
		<textarea style="font-family : terminal;" placeholder="Write something..." v-model="chat.manager.active.message" @keypress.ctrl.enter="chat.manager.active?.write" class="h-80px flex-1 w-full bg-transparent text-lg outline-none pl-3 pt-1 resize-none"></textarea>
		<div>
			<div @click=chat.manager.active?.write class="bg-zinc hover:scale-110 cursor-pointer rounded-full text-3xl p-2 mr-2">
				<div class="i-mdi:send"></div>
			</div>
		</div>
	</div>
</template>