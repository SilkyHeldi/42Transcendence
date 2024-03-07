<script setup lang="ts">
const client = useClient()
const auth = useAuth()
const twoFA = ref('')


const isValid = computed(() => {
    return twoFA.value !== ''
})

</script>
<template>
    <div class="w-80 bg-white p-6 rounded-lg relative">
        <h1 class="text-gray text-2xl mb-6">2FA verification</h1>
            <input type="password" v-model="twoFA" autocomplete="false" name="twoFA" placeholder="2FA Code" class="rounded-lg w-full  mb-4 px-3 py-2 text-black b-1 " />

            <button type="button" @click="auth.verify2FA(twoFA)" :disabled="!isValid" class=" text-white w-full rounded-lg  cursor-pointer hover:scale-105 transition px-4 py-2" :class="{
                'bg-blue-500/50': !isValid,
                'bg-blue-500 hover:bg-blue-600 transition duration-300': isValid,
            }">
                Verify
            </button>
            <button type="button" @click=" auth.logout" class=" mt-5 text-blue-600 w-full rounded-lg  cursor-pointer hover:scale-105 transition px-4 py-2" :class="{
                'b-blue-500 hover:b-blue-600 transition duration-300': true,
            }">
                Logout
            </button>
    </div>
</template> 