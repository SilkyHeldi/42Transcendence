<script setup lang="ts">
    const friends = ref([
        {
            id: 1,
            name: 'Marco',
            last: 'Hey'
        },
        {
            id: 2,
            name: 'Jean',
            last: 'Yo'
        },
        //{
        //    id: 2,
        //    name: 'Youhou',
        //},
        //{
        //    id: 2,
        //    name: 'Youhou',
        //},
        //{
        //    id: 2,
        //    name: 'Youhou',
        //},
        //{
        //    id: 2,
        //    name: 'Youhou',
        //},
        //{
        //    id: 2,
        //    name: 'Youhou',
        //},
        //{
        //    id: 2,
        //    name: 'Youhou',
        //},
        //{
        //    id: 2,
        //    name: 'Youhou',
        //},
        //{
        //    id: 2,
        //    name: 'Youhou',
        //},
        //{
        //    id: 2,
        //    name: 'Youhou',
        //},
        //{
        //    id: 2,
        //    name: 'Youhou',
        //},
        //{
        //    id: 2,
        //    name: 'Youhou',
        //},
        //{
        //    id: 2,
        //    name: 'Youhou',
        //},
        //{
        //    id: 2,
        //    name: 'Youhou',
        //},
    ])
</script>
<template>
    <div class="h-50% text-white flex flex-col b-t-gray/20 b-t-1">
        <div class="font-bold capitalize flex justify-between items-center p-2.5  px-5">
            <div>Friends</div>
            <div class="bg-gray p-1 rounded">
                <div class="i-mdi:plus"></div>
            </div>
        </div>
        <div class="overflow-y-scroll flex-1 mx-1 pt-2">
            <div v-for="friend in friends" class="px-2.5 py-1 mb-1 hover:bg-white/10 rounded-lg cursor-pointer gap-2 flex items-center">

                <div class="rounded-full bg-gray p-2 relative">
                    <div class="i-mdi:user text-xl text-white"></div>
                    <div class="i-mdi-circle text-green absolute -bottom-2px -right-2px text-12px"></div>
                </div>
                <div class="flex flex-col">
                    <div>@{{ friend.name }}</div>
                    <div class="text-xs text-gray">{{ friend.last }}</div>
                </div>
            </div>
        </div>
    </div>
</template>