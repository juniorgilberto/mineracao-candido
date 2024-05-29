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
      <div class="row wrap justify-between q-mt-md">
        <div>
          <input type="search" class="q-mr-xl text-white input-pesquisar" placeholder="Pesquisar...">
          <button class="btn-table">Filtro</button>
        </div>

        <button class="btn-table">Nova Venda</button>
      </div>

      <q-table
      :rows="rows"
      :columns="columns"
      row-key="name"
      class="bg-dark text-white q-mt-lg"
      header-class="table-vendas-head text-white"
      >

      <template v-slot:header-cell="props">
        <q-th :props="props" style="border-bottom: 1px solid #FFA700">
          {{ props.col.label }}
        </q-th>
      </template>


      </q-table>
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

  const  columns = [
        { name: 'numero', format: val => `${val}`, required: true, label: 'Número', align: 'left', field: 'numero'},
        { name: 'client', required: true, label: 'Cliente', align: 'left', field: 'client' },
        { name: 'material', required: true, label: 'Material', align: 'left', field: 'material' },
        { name: 'metragem', required: true, label: 'Metragem', align: 'left', field: 'metragem' },
        { name: 'valor', required: true, label: 'Valor', align: 'left', field: 'valor' },
        { name: 'status', required: true, label: 'Status', align: 'left', field: 'status' },
      ]
  const  rows = [
        {
          numero: '0001',
          client: 'TOP TERRA',
          material: 'Cascalho',
          metragem: '12m³',
          valor: 'R$ 216,00',
          status: 'Em aberto'
        },
        {
          numero: '0002',
          client: 'PAIAGUÁS TERRAPLANAGEM',
          material: 'Terra',
          metragem: '12m³',
          valor: 'R$ 90,00',
          status: 'Em aberto'
        },
        {
          numero: '0003',
          client: 'GRAN12 SERVIÇOS DE TERRAPLANAGEM',
          material: 'Terra',
          metragem: '12m³',
          valor: 'R$ 90,00',
          status: 'Em aberto'
        },
        {
          numero: '0004',
          client: 'GRAN12 SERVIÇOS DE TERRAPLANAGEM',
          material: 'Terra',
          metragem: '12m³',
          valor: 'R$ 90,00',
          status: 'Em aberto'
        },
        {
          numero: '0005',
          client: 'VIA LOG TRANSPORTES',
          material: 'Cascalho',
          metragem: '25m³',
          valor: 'R$ 450,00',
          status: 'Pago'
        },
        {
          numero: '0006',
          client: 'LUCIO PAGLIOTE',
          material: 'Terra',
          metragem: '12m³',
          valor: 'R$ 90,00',
          status: 'Pago'
        },

      ]
export default {
  setup () {
    return {
      columns,
      rows
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
  .input-pesquisar {
    width: 300px;
    padding: 10px;
    background-color: transparent;

    // ICONE de Pesquisar
      background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ffffff"><path d="M10 2a8 8 0 0 0-6.32 13.26l-4.28 4.29 1.42 1.41 4.28-4.28A8 8 0 1 0 10 2zm0 2a6 6 0 1 1 0 12A6 6 0 0 1 10 4z"/></svg>');
      background-repeat: no-repeat;
      background-position: right 10px center;
      background-size: 20px 20px;

    border: 1px solid #FFA700;
    border-radius: 10px;
    color: #ffffff;

    ::-webkit-input-placeholder {
      color: #ffffff;
    }

    .icon-pesquisar {
      color: #ffffff;
    }

  }

  .btn-table {
    width: 150px;
    background-color: transparent;
    padding: 10px;
    border: 1px solid #FFA700;
    border-radius: 10px;
    color: #ffffff;

    &:hover {
      color: #FFA700;
      cursor: pointer;
    }
  }

  .table-vendas-head {
    font-weight: bold;
    border-bottom: 1px solid #FFA700;
    background-color: #FFA700;
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
