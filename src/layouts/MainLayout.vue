<template>
  <q-layout view="hHh LpR fFf ">
    <q-header reveal class="bg-dark text-white header">
      <div class="container">
        <div class="header-div">
          <img
            src="/src/assets/Mineração Candido - Logo Branca.svg"
            class="logo"
          />
          <div>
            <ul class="nav-list">
              <li><RouterLink to="/">Home</RouterLink></li>
              <li><RouterLink to="/cadastros">Cadastros</RouterLink></li>
              <li><RouterLink to="/">Custos</RouterLink></li>
              <li><RouterLink to="/">Relatórios</RouterLink></li>
            </ul>
          </div>
        </div>
      </div>
    </q-header>

    <q-page-container class="container">
      <router-view />
    </q-page-container>

    <q-footer elevated class="bg-dark text-white">
      <q-toolbar>
        <q-toolbar-title class="footer">
          <img src="/icons/icon-branco.svg" width="50px" />
          <span class="footer-span">Direitos Reservados ©</span>
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script setup></script>
