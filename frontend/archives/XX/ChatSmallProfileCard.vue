<script setup lang="ts">
    const chat = useChat()
	const auth = useAuth()
	const props = defineProps<{user: Profile}>()
</script>
<template>
	<div  class="rounded-lg b-1  bg-zinc-700 overflow-hidden">
		<div class="hover:bg-white/10   gap-2 flex flex-col " :class="[user.user.id == auth.session.id ? '' : '']">
			<div class="w-full flex pt-3">
				<div class="rounded-full bg-gray p-2 relative mx-auto">
					<div class="i-mdi:user text-3xl text-white"></div>
					<div v-if="user.online" class="i-mdi-circle text-green absolute -bottom-2px -right-2px text-16px"></div>
					<div v-if="!user.online" class="i-mdi-circle text-red absolute -bottom-2px -right-2px text-16px"></div>
				</div>
			</div>
			<div class="flex flex-col items-center w-full">
				<div>@{{ user.user.username }} <span v-if="user.user.id == auth.session.id">(You)</span></div>
				<div class="pb-2">ELO: 123</div>
				<div class="flex flex-wrap justify-center gap-5 b-t-1 w-full">
					<div class="flex items-center justify-center flex-col">
						<div class="font-bold text-2xl">111</div>
						<div>Victories</div>
					</div>
					<div class="flex items-center justify-center flex-col">
						<div class="font-bold text-2xl">123</div>
						<div>Defeats</div>
					</div>
				</div>
			</div>
		</div>
		<div class="flex flex-row sm:flex-col md:flex-row items-center justify-center w-full" >
			<div @click="chat.currentProfile = user" class="flex-1 hover:bg-white w-full hover:text-gray-700 cursor-pointer flex items-center px-2 gap-2 justify-center py-1 b-t-1 sm:b-r-0">
				<div class="i-ion:ellipsis-horizontal"></div>
				MORE </div>
			
		</div>
	</div>
</template>