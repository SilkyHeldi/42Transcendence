<script setup lang="ts">
	const auth = useAuth()
    const chat = useChat()
	const props = defineProps<{user: Profile}>()
</script>
<template>
	<div  class="rounded-lg b-1  bg-zinc-700 overflow-hidden">
		<div class="hover:bg-white/10  cursor-pointer gap-2 flex flex-col " :class="[user.user.id == auth.session.id ? 'h-full' : '']">
			<div class="w-full flex pt-3">
				<div class="rounded-full bg-gray p-2 relative mx-auto">
					<div class="i-mdi:user text-3xl text-white"></div>
					<div v-if="user.online" class="i-mdi-circle text-green absolute -bottom-2px -right-2px text-16px"></div>
					<div v-if="!user.online" class="i-mdi-circle text-red absolute -bottom-2px -right-2px text-16px"></div>
				</div>
			</div>
			<div class="flex flex-col items-center w-280px">
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
		<div class="flex flex-row sm:flex-col md:flex-row items-center justify-center w-full" v-if="user.user.id != auth.session.id">
			<div @click="chat.addFriend(user.user.id)" class="flex-1 hover:bg-white w-full hover:text-gray-700 cursor-pointer flex items-center px-2 gap-2 justify-center py-1 b-t-1 b-r-1 md:b-r-1  sm:b-r-0">
				<div class="i-mdi:user"></div>
				Add </div>
			<div @click="chat.challenge(user.user.id)"  class="flex-1 hover:bg-white w-full hover:text-gray-700 cursor-pointer flex items-center px-2 gap-2 justify-center py-1  b-t-1 " >
				<div class="i-mdi:trophy"></div>
				Challenge</div>
			<div @click="chat.blockUser(user.user.id)"  class="flex-1 hover:bg-white w-full hover:text-gray-700 cursor-pointer flex items-center px-2 gap-2 justify-center py-1  b-t-1  b-l-1 md:b-l-1 sm:b-l-0">
				<div class="i-mdi:block-helper"></div>
				Block</div>
		</div>
	</div>
</template>