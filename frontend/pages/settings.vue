<script setup lang="ts">
import '/public/styles/home.css';
import QRCode from 'qrcode'
import slugify from 'slugify'
    const auth = useAuth()


const avatarFile = ref(null);
const onFileSelected = async (event: any) => {
    avatarFile.value = event.target.files[0]
}
const avatarPreview = computed(() => {
    return avatarFile.value ? URL.createObjectURL(avatarFile.value) : auth.session.avatar
})

const debounce = (func: any, wait: any, immediate: any) => {
    let timeout: any;
    return function() {
        let context = this, args = arguments;
        let later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args)
        };
        let callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context,args)
    }
}
const onInput = debounce((event: any) => {
    auth.session.username = slugify(event.target.value, {
        replacement: '_',
        lower: true,
        strict: true
    })
}, 400, false)

const payload = ref({
    //changePassword: false,
    username: auth.session.username,
    email: auth.session.email,
    //password: '',
    //newPassword: '',
    //newPasswordConfirmation: '',
    avatar: auth.session.avatar,
    mfaEnabled: auth.session.mfaEnabled,
    mfaCode: '',
})
const isValid = computed(() => {
    return payload.value.email !== '' && payload.value.username !== ''
})

//const onChangePassword = (ev) => {
//    if (ev.target.checked) {
//    } else {
//        payload.value.newPassword = ''
//        payload.value.newPasswordConfirmation = ''
//    }
//}
const onMfaToggle = async (ev) => {
    if (ev.target.checked) {
        qseed.value = await auth.getMFASeed()
        qcode.value = await generateQR(qseed.value)
    } else {
        payload.value.mfaCode = ''
    }
}

const qcode = ref('')
const qseed = ref('')
const generateQR = async text => {
  try {
    return await QRCode.toDataURL(text)
  } catch (err) {
    console.error(err)
  }
}
const resetAvatar = () => {
    avatarFile.value = null
    payload.value.avatar = '/avatars/default.jpg'
    auth.session.avatar = '/avatars/default.jpg'
}



</script>
<template>
    <div>
        <div class="w-122 mx-auto my-5 term-box p-6 relative text-black">

            <h1 class="home-font text-2xl" style="letter-spacing : 2px" mb-4>
                My Profile
            </h1>
            <!-- <h1 class="text-gray text-2xl mb-2">You can update your profile here</h1>  -->
            <form @submit.prevent="auth.update({
                ...payload,
            avatar: avatarFile ? avatarFile : payload.avatar,
        })" class="flex flex-col gap-4" autocomplete="off">
            
            <div class="flex flex-col">
                <div class="home-font text-base mt-4">Change your profile picture (optional) [
                    <button class="text-white/50 home-button layers hero glitch text-sm" data-text="reset Avatar" type="button" @click="resetAvatar">Reset Avatar</button>
                    ]</div>
                <div class="flex justify-center">
                    <img :src="avatarPreview" class="mt-4 h-100px max-w-100px b-2 b-white p-.5" />
                </div>
                <div class="flex flex-row pt-2">
                    <input type="file" accept="image/jpeg,image/png" name="file" id="file" class="inputfile" ref="fileInput"  @change="onFileSelected" />
                    <label for="file" class="home-font home-button layers hero glitch ml-3" style="letter-spacing : 1px;" data-text="Choose a file">Choose a file</label>
                    <div class="i-material-symbols:file-copy-outline-sharp ml-2 home-font"></div>
                </div>
            </div>
            <div class="flex flex-col gap-1.5">
                <label class="font-bold home-font text-base ">Username</label>
                <input type="text" @input="onInput" v-model="payload.username" name="username" placeholder="New username" class="term-box px-3 py-2 text-white b-1 "  style="font-family : terminal;"/>
            </div>
            <div class="flex flex-col gap-1.5">

                <label class="font-bold home-font text-base ">Email</label>
                <input type="text" v-model="payload.email" name="email" placeholder="New email" class="term-box px-3 py-2 text-white b-1 "  style="font-family : terminal;"/>
            </div>
            <!--<div class="flex flex-col gap-1.5">

                <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" :onChange="onChangePassword" v-model="payload.changePassword" class="sr-only peer" checked>
                <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                <span class="ms-3 font-bold text-base text-gray-900 dark:text-gray-900">Change password</span>
                </label>
            </div>-->
            <!--<div class="flex flex-col gap-1.5" v-if="payload.changePassword">
                <input type="password" v-model="payload.newPassword" name="newPassword" placeholder="New password" class="rounded-lg px-3 py-2 text-black b-1 " />
                <input type="password" v-model="payload.newPasswordConfirmation" name="newPasswordConfirmation" placeholder="New password confirmation" class="rounded-lg px-3 py-2 text-black b-1 " />
            </div>-->

            <div class="flex flex-col gap-1.5">
                <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" :onChange="onMfaToggle" v-model="payload.mfaEnabled" class="sr-only peer" checked>
                <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal"></div>
                <span class="ms-3 font-bold home-font text-base text-white/50 dark:text-white/50">
                    {{ payload.mfaEnabled ? 'Disable 2FA' : 'Enable 2FA'  }}
                </span>
                </label>
                </div>
                <div class="flex flex-col gap-1.5" v-if="payload.mfaEnabled">
                    <div class="flex flex-col items-center justify-center" v-if="qcode">

                        <img :src="qcode" alt="" class="h-32 w-32">
                        <div>
                            {{ qseed  }}
                        </div>
                    </div>
                <input type="password" v-model="payload.mfaCode" name="newPassword" placeholder="Enter 2FA Code" class="term-box px-3 py-2 text-white b-1 " />
                
                </div>
                <!--<div class="flex flex-col gap-1.5">

                <label class="font-bold text-base ">Current password</label>
                <input type="password" v-model="payload.password" name="password" placeholder="password" class="rounded-lg px-3 py-2 text-black b-1 " />
            </div>-->


            <button type="submit" class=" text-white home-font home-button layers hero glitch cursor-pointer hover:scale-105 transition px-4 py-2" 
                data-text="Update profile"
                :class="{
                'transition duration-300': isValid,
                'bg-gray-500': isValid === false,
            }">
                Update profile
            </button>
            <!-- Add login button and other login form fields here -->
        </form>
    </div>
    </div>
</template>

<style scoped>
.inputfile {
	width: 0.1px;
	height: 0.1px;
	opacity: 0;
	overflow: hidden;
	position: absolute;
	z-index: -1;
}

.inputfile + label {
    font-size: 1.25em;
    font-weight: 700;
    display: inline-block;
    text-align : center;
}
</style>