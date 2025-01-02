<template>
  <q-page class="flex flex-center">
    <div class="q-pa-lg" style="width:100%; max-width: 500px; border-radius: 15px;">
      <h4 class="q-mb-md">Авторизация</h4>
      <q-form @submit.prevent="pressLogin">

        <q-input outlined v-model="login" type="text" label="Логин" required/>
        <q-input outlined v-model="pass" type="password" label="Пароль" :rules="[wrongPass]" ref="passRef" required>
          <template v-slot:append>
          <q-icon
            :name="isPwd ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="isPwd = !isPwd"
          ></q-icon>
        </template>
      </q-input>

        <div class="q-mt-lg">
          <q-btn label="Войти" type="submit" color="primary" class="q-px-xl q-py-sm full-width" :loading="loading" />
        </div>
      </q-form>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'; // Pinia store для "auth"
import {  useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const isPwd = ref(true)
const login = ref('')
const pass = ref('')
const loading = ref(false)
const passRef = ref(null)

const pressLogin = async () => {
  loading.value=true
  const result = await authStore.login({ login: login.value, password: pass.value });
  console.log(result);
  if (!result) {
    passRef.value.validate(false); // Убедитесь, что passRef определён.
  } else {
    console.log('Авторизация прошла успешно');
    router.replace(route.query.redirect || '/authzone');
  }
  loading.value=false
}

const wrongPass = (val) => (val ? true : 'Неверный пароль');
</script>
