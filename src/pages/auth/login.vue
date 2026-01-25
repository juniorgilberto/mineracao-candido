<template>
  <q-page class="row items-center justify-center bg-grey-1">
    <q-card class="q-pa-md" style="max-width: 420px; width: 95%">
      <q-toolbar class="q-pa-none">
        <div class="row items-center justify-center" style="width: 100%;">
          <q-icon name="img:logo-preta.svg" style="width: 250px; height: auto;" />
        </div>
      </q-toolbar>


      <q-form @submit.prevent="onSubmit" class="q-gutter-y-md" ref="formRef">
        <q-input
          v-model="form.usuario"
          label="Usuário"
          type="text"
          :rules="[val => !!val || 'Usuário é obrigatório' || 'Usuário inválido']"
          dense
          autofocus
        />

        <q-input
          v-model="form.senha"
          :type="showPassword ? 'text' : 'Senha'"
          label="Senha"
          :rules="[val => !!val || 'Senha é obrigatória', val => (val && val.length >= 3) || 'Mínimo 3 caracteres']"
          dense
        >
          <template #append>
            <q-btn flat round dense :icon="showPassword ? 'visibility_off' : 'visibility'" @click="showPassword = !showPassword" />
          </template>
        </q-input>

        <q-checkbox
          v-model="form.remember"
          label="Lembrar-me"
          dense
        />
        <q-btn
          label="Entrar"
          type="submit"
          color="primary"
          class="full-width"
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
  usuario: '',
  senha: '',
  remember: false
})
const showPassword = ref(false)
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

  $q.loading.show()
  try {
    const response = await api.post('/login', {
      usuario: form.value.usuario,
      senha: form.value.senha,
      lembrar: form.value.remember
    })

    // Chamamos a store passando a opção de "lembrar"
    usuarioStore.setLogin(response.data, form.value.remember);

    $q.notify({ type: 'positive', message: 'Login efetuado com sucesso' })
    router.push("/")

  } catch (err) {
    console.error(err)
    const msg = err.response?.data?.message || 'Falha ao autenticar. Verifique suas credenciais.'
    $q.notify({ type: 'negative', message: msg })
    error.value = msg
  } finally {
    $q.loading.hide()
  }
}

</script>

<style scoped>
.q-page {
  min-height: 100vh;
}
.q-card {
  max-width: 600px;
}
.full-width {
  width: 100%;
}
</style>
