<template>
  <q-page class="row items-center justify-center bg-grey-1">
    <q-card class="q-pa-md" style="max-width: 420px; width: 95%">
      <q-toolbar class="q-pl-none q-pr-none">
        <q-toolbar-title>
          Entrar
          <div class="text-subtitle2">Acesse sua conta</div>
        </q-toolbar-title>
      </q-toolbar>

      <q-separator />

      <q-form @submit.prevent="onSubmit" class="q-gutter-md" ref="formRef">
        <q-input
          v-model="form.email"
          label="E-mail"
          type="email"
          :rules="[val => !!val || 'E-mail é obrigatório', val => /.+@.+\..+/.test(val) || 'E-mail inválido']"
          dense
          autofocus
        />

        <q-input
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          label="Senha"
          :rules="[val => !!val || 'Senha é obrigatória', val => (val && val.length >= 6) || 'Mínimo 6 caracteres']"
          dense
        >
          <template #after>
            <q-btn flat round dense icon="visibility" v-if="!showPassword" @click="showPassword = true" />
            <q-btn flat round dense icon="visibility_off" v-else @click="showPassword = false" />
          </template>
        </q-input>

        <div class="row items-center q-gutter-sm">
          <q-checkbox v-model="form.remember" label="Lembrar-me" dense />
          <div class="col">
            <q-btn flat class="text-primary" @click="onForgot">Esqueci a senha</q-btn>
          </div>
        </div>

        <q-btn
          label="Entrar"
          type="submit"
          color="primary"
          class="full-width"
          :loading="loading"
        />

        <q-separator />


        <q-banner v-if="error" dense class="bg-red-1 text-red-10">
          {{ error }}
        </q-banner>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { api } from 'src/boot/axios'
import { useUsuarioStore } from 'src/stores/usuario'

const $q = useQuasar()
const router = useRouter()

const usuarioStore = useUsuarioStore()

const formRef = ref(null)
const form = ref({
  email: '',
  password: '',
  remember: false
})
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

function validateForm() {
  // Use the q-form rules by validating programmatically
  return formRef.value ? formRef.value.validate() : true
}

async function onSubmit() {
  error.value = ''
  if (!validateForm()) {
    error.value = 'Corrija os campos marcados.'
    return
  }

  loading.value = true
  try {
    // Simulação de chamada de API

    api.post('/auth/login', {
      email: form.value.email,
      password: form.value.password
    }).then(response => {
      // Suponha que a resposta contenha um token e informações do usuário
      const data = response.data;


      usuarioStore.setLogin({
        usuario: "Junin",
        email: form.value.email,
        token: "nome"
      });

      // Exemplo: sucesso -> notificação e redirecionamento
      $q.notify({ type: 'positive', message: 'Login efetuado com sucesso' })

      // Redirecione para a página principal (ajuste conforme sua rota)
      router.push("/")

    }).catch(err => {
      throw new Error('Erro na autenticação');
    });



  } catch (err) {
    console.error(err)
    error.value = 'Falha ao autenticar. Verifique suas credenciais.'
  } finally {
    loading.value = false
  }
}

function onForgot() {
  $q.notify({ type: 'info', message: 'Fluxo de recuperação de senha aqui.' })
}

function onRegister() {
  // Redirecione para a página de registro (ajuste conforme sua rota)
  router.push({ name: 'register' }).catch(() => {})
}
</script>

<style scoped>
.q-page {
  min-height: 100vh;
}
.q-card {
  max-width: 480px;
}
.full-width {
  width: 100%;
}
</style>
