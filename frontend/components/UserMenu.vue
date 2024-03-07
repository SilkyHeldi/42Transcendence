<script setup lang="ts">
const auth = useAuth()


</script>
<template>
    <div  class=" absolute top-100% right-0 term-box text-dark min-w-160px  rounded-lb overflow-hidden z-500" style="background : rgb(14, 64, 80); font-family: terminal;">
        <ul>
            <div class="b-t-1 select-none hover:bg-gray-200 text-white hover:text-gray-800 px-3 py-2 cursor-pointer">
                <div class="font-bold  ">{{ auth.session.email }}</div>
                <div class="">@{{ auth.session.username }}</div>
            </div>
            <li class="" v-if="auth.session?.username">
            </li>
            <li @click="auth.logout" class="flex items-center text-white  gap-2 b-t-1 select-none hover:bg-gray-200 hover:text-gray-800 px-3 py-2 cursor-pointer">
                <div class="i-mdi:logout"></div>
                <div>Logout</div>
            </li>
        </ul>
    </div>
</template>