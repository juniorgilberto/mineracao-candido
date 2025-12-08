<template>
  <q-layout view="hHh Lpr fFf">
    <q-header elevated>
      <q-toolbar>

        <q-toolbar-title>
          Mineração Cândido
        </q-toolbar-title>

        <q-space />

        <q-btn stretch flat label="Home" to="/" />
        <q-btn stretch flat label="Clientes" to="/clientes" />
        <q-btn stretch flat label="Relatórios" to="/relatorios"/>
        <q-btn flat color="negative" label="Logout" @click="logout" />

      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>

function logout() {
  localStorage.removeItem('usuario');
  window.location.href = '/login';
}
</script>
