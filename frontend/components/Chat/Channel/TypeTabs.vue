<script setup lang="ts">

    const props = defineProps<{
        channel: Omit<Channel, "id" | "messages" | "users" | "unread">
    }>();
</script>
<template>
    <div class="flex flex-col sm:flex-row w-full mx-auto max-w-80% gap-2 sm:gap-0 " style="font-family: terminal;">
        <label :class="[channel.type == 'PUBLIC' ? 'bg-white text-gray-800 ' : '']" for="public_channel" class="flex-1 text-center hover:bg-white cursor-pointer hover:text-gray-800  sm:b-1 overflow-hidden">
            
            <div class="px-3 py-1 flex gap-1 justify-center items-center ">
                <div class="i-mdi:lock-open"></div>
                <div>Public</div>
            </div>
            <input class="hidden" v-model="channel.type" type="radio" id="public_channel" name="channel-type" value="PUBLIC"/>
        </label>
        <label :class="[channel.type == 'PRIVATE' ? 'bg-white text-gray-800 ' : '']" for="private_channel" class="flex-1 text-center hover:bg-white cursor-pointer hover:text-gray-800  sm:b-y overflow-hidden">
            <div class=" px-3 py-1 flex gap-1 justify-center items-center">
                <div class="i-mdi:lock"></div>
                <div>Private</div>
            </div>
            <input class="hidden" v-model="channel.type" type="radio" id="private_channel" name="channel-type" value="PRIVATE"/>
        </label>
        <label :class="[channel.type == 'PROTECTED' ? 'bg-white text-gray-800 ' : '']" for="protected_channel" class="flex-1 text-center hover:bg-white cursor-pointer hover:text-gray-800  overflow-hidden sm:b-1 ">
            <div class="px-3 py-1 flex gap-1 justify-center items-center ">
                <div class="i-mdi:key"></div>
                <div>Protected</div>
            </div>
            <input class="hidden" v-model="channel.type" type="radio" id="protected_channel" name="channel-type" value="PROTECTED"/>
        </label>
    </div>
</template>