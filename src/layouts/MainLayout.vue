<template>
  <q-layout view="hHh Lpr fFf">
    <q-header elevated class="bg-primary">
      <div class="layout-centralizado">
        <q-toolbar>
          <q-toolbar-title>
            <div class="row items-center no-wrap">
              <img src="public/icon-principal-preto.png" style="height: 40px; max-width: 150px;" class="q-mr-md">
              <div class="gt-xs">Mineração Cândido</div>
            </div>
          </q-toolbar-title>
          <div class="gt-sm">
            <q-btn stretch flat icon-right="home" label="Home" to="/" />
            <q-btn stretch flat icon-right="people" label="Clientes" to="/clientes" />
            <q-btn stretch flat icon-right="assessment" label="Relatórios" to="/relatorios" />
            <q-btn flat color="negative" icon-right="logout" label="Sair" @click="logout" />
          </div>
          <q-btn flat dense round icon="menu" aria-label="Menu" class="lt-md" @click="toggleLeftDrawer" />
        </q-toolbar>
      </div>
    </q-header>
    <q-drawer v-model="leftDrawerOpen" side="right" overlay behavior="mobile" bordered>
      <q-list>
        <q-item-label header>Navegação</q-item-label>

        <q-item clickable to="/">
          <q-item-section avatar><q-icon name="home" /></q-item-section>
          <q-item-section>Home</q-item-section>
        </q-item>

        <q-item clickable to="/clientes">
          <q-item-section avatar><q-icon name="people" /></q-item-section>
          <q-item-section>Clientes</q-item-section>
        </q-item>

        <q-item clickable to="/relatorios">
          <q-item-section avatar><q-icon name="assessment" /></q-item-section>
          <q-item-section>Relatórios</q-item-section>
        </q-item>

        <q-separator />

        <q-item clickable class="text-negative" @click="logout">
          <q-item-section avatar><q-icon name="logout" color="negative" /></q-item-section>
          <q-item-section>Sair</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container class="layout-centralizado">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function logout() {
  localStorage.removeItem('usuario');
  window.location.href = '/login';
}
</script>
<style>
.layout-centralizado {
  display: flex;
  justify-content: center;
}

.layout-centralizado>* {
  width: 90%;
  margin: 0 auto;
}

/* Ajuste para telas pequenas (celular) */
@media (max-width: 600px) {
  .layout-centralizado>* {
    width: 95%;
    /* No celular, 80% fica muito apertado */
  }
}
</style>
