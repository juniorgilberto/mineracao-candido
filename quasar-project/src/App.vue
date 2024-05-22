<template>
  <q-layout view="hHh LpR fFf ">

    <q-header reveal class="bg-dark text-white header">
      <div class="container">
        <div class="header-div">
          <img src="./assets/Mineração Candido - Logo Branca.svg" class="logo">
          <div>
            <ul class="nav-list">
              <li><a href="">Home</a></li>
              <li><a href="">Cadastros</a></li>
              <li><a href="">Custos</a></li>
              <li><a href="">Relatórios</a></li>
            </ul>
          </div>
        </div>
      </div>

    </q-header>

    <q-page-container class="container">
      <div class="q-mt-lg">
        <q-markup-table class="bg-dark text-white">
          <thead class="table-vendas-head">
            <tr>
              <th class="text-left">Número</th>
              <th class="text-center">Cliente</th>
              <th class="text-center">Material</th>
              <th class="text-center">Metragem (m³)</th>
              <th class="text-center">Valor (R$)</th>
              <th class="text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="text-left">
                <q-checkbox size="xs" v-model="val" val="xs" label="0001" />
              </td>
              <td class="text-center">TOP TERRA</td>
              <td class="text-center">Cascalho</td>
              <td class="text-center">12</td>
              <td class="text-center">216,00</td>
              <td class="text-center text-positive text-bold">Pago</td>
            </tr>
            <tr>
              <td class="text-left">
                <q-checkbox size="xs" v-model="val" val="xs" label="0002" />
              </td>
              <td class="text-center">POLEMICA SERVIÇOS</td>
              <td class="text-center">Terra</td>
              <td class="text-center">12</td>
              <td class="text-center">90,00</td>
              <td class="text-center text-negative text-bold">Em aberto</td>
            </tr>
            <tr>
              <td class="text-left">
                <q-checkbox size="xs" v-model="val" val="xs" label="0003" />
              </td>
              <td class="text-center">PAIAGUÁS TERRAPLANAGEM</td>
              <td class="text-center">Cascalho</td>
              <td class="text-center">25</td>
              <td class="text-center">450,00</td>
              <td class="text-center text-negative text-bold">Em aberto</td>

            </tr>
            <tr>
              <td class="text-left">
                <q-checkbox size="xs" v-model="val" val="xs" label="0004" />
              </td>
              <td class="text-center">GRAN12 TERRAPLANAGEM</td>
              <td class="text-center">Terra</td>
              <td class="text-center">12</td>
              <td class="text-center">90,00</td>
              <td class="text-center text-positive text-bold">Pago</td>

            </tr>
            <tr>
              <td class="text-left">
                <q-checkbox size="xs" v-model="val" val="xs" label="0005" />
              </td>
              <td class="text-center">GRAN12 TERRAPLANAGEM</td>
              <td class="text-center">Terra</td>
              <td class="text-center">12</td>
              <td class="text-center">90,00</td>
              <td class="text-center text-positive text-bold">Pago</td>

            </tr>
          </tbody>
        </q-markup-table>
      </div>
    </q-page-container>

    <q-footer elevated class="bg-dark text-white">
      <q-toolbar>
        <q-toolbar-title class="footer">
            <img src="/icons/icon-branco.svg" width="50px">
            <span class="footer-span">Direitos Reservados ©</span>
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>

  </q-layout>
</template>

<script>
import { ref } from 'vue'

export default {
  setup () {
    return {
      val: ref(true)
    }
  }
}


</script>

<style lang="scss">
  .header{
    border-bottom: 1px solid #FFA700;
  }
  .container{
    width: 75%;
    margin: auto;
  }
  .header-div{
    height: 80px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .logo {
    width: 160px;
    margin-bottom: 8px;
  }
  .nav-list{
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .nav-list li {
    list-style: none;
    padding: 0 20px;
  }
  .nav-list li a {
    text-decoration: none;
    color: #ffffff;
  }
  .nav-list li a:hover {
    color: #FFA700;
  }

  // TABELA DE VENDAS
  .table-vendas-head tr th {
    font-weight: bold;
    border-bottom: 1px solid #FFA700;
  }


  // RODAPÉ
  .footer {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
  }

  .footer-span {
    color: $grey-5;
    font-size: 10pt;
  }
</style>
