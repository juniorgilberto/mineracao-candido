<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="row items-center q-mt-md">
    <div class="col-3">
      <q-input
        dense
        v-model="filtro.pesquisa"
        placeholder="Pesquisar"
        outlined
        color="white"
        class="input-pesquisar"
        input-class="text-white"
      >
        <template v-slot:append>
          <q-icon
            v-if="filtro.pesquisa !== ''"
            name="close"
            @click="filtro.pesquisa = ''"
            color="white"
          />
          <q-icon name="search" color="white" />
        </template>
      </q-input>
    </div>
    <div class="col"></div>
    <div class="col-auto">
      <q-btn label="Novo Cadastro" color="amber-9" text-color="black" />
    </div>
  </div>

  <q-table
    :rows="filteredRows"
    :columns="columns"
    row-key="id"
    class="bg-dark text-white q-mt-lg"
    header-class="table-vendas-head text-white"
  >
    <template v-slot:header-cell="props">
      <q-th :props="props" style="border-bottom: 1px solid #ffa700">
        {{ props.col.label }}
      </q-th>
    </template>

    <template v-slot:body-cell="props">
      <q-td
        :props="props"
        :class="getCellClass(props.row.id, props.col.name)"
        @click="toggleCell(props.row.id, props.col.name)"
      >
        {{ props.value }}
      </q-td>
    </template>
  </q-table>

  <q-dialog v-model="confirmDialog" persistent @keyup.enter="confirmChange">
    <q-card class="bg-dark text-white">
      <q-card-section class="row items-center">
        <q-icon name="warning" color="warning" size="2em" class="q-mr-sm" />
        <span class="text-h6">Confirmar Mudança de Status</span>
      </q-card-section>

      <q-card-section>
        Você tem certeza que deseja mudar o status?
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="negative" v-close-popup />
        <q-btn flat label="Confirmar" color="positive" @click="confirmChange" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, reactive, computed } from "vue";
import {
  QDialog,
  QCard,
  QCardSection,
  QCardActions,
  QBtn,
  QIcon,
} from "quasar";

export default {
  setup() {
    const filtro = reactive({
      pesquisa: "",
    });

    const columns = [
      {
        name: "numero",
        format: (val) => `${val}`,
        required: true,
        label: "Número",
        align: "left",
        field: "numero",
      },
      {
        name: "client",
        required: true,
        label: "Cliente",
        align: "left",
        field: "client",
      },
      {
        name: "material",
        required: true,
        label: "Material",
        align: "left",
        field: "material",
      },
      {
        name: "metragem",
        required: true,
        label: "Metragem",
        align: "left",
        field: "metragem",
      },
      {
        name: "valor",
        required: true,
        label: "Valor",
        align: "left",
        field: "valor",
      },
      {
        name: "status",
        required: true,
        label: "Status",
        align: "left",
        field: "status",
      },
    ];

    const rows = ref([
      {
        id: 1,
        numero: "0001",
        client: "TOP TERRA",
        material: "Cascalho",
        metragem: "12m³",
        valor: "R$ 216,00",
        status: "Em aberto",
      },
      {
        id: 2,
        numero: "0002",
        client: "PAIAGUÁS TERRAPLANAGEM",
        material: "Terra",
        metragem: "12m³",
        valor: "R$ 90,00",
        status: "Em aberto",
      },
      {
        id: 3,
        numero: "0003",
        client: "GRAN12 SERVIÇOS DE TERRAPLANAGEM",
        material: "Terra",
        metragem: "12m³",
        valor: "R$ 90,00",
        status: "Em aberto",
      },
      {
        id: 4,
        numero: "0004",
        client: "GRAN12 SERVIÇOS DE TERRAPLANAGEM",
        material: "Terra",
        metragem: "12m³",
        valor: "R$ 90,00",
        status: "Em aberto",
      },
      {
        id: 5,
        numero: "0005",
        client: "VIA LOG TRANSPORTES",
        material: "Cascalho",
        metragem: "25m³",
        valor: "R$ 450,00",
        status: "Pago",
      },
      {
        id: 6,
        numero: "0006",
        client: "LUCIO PAGLIOTE",
        material: "Terra",
        metragem: "12m³",
        valor: "R$ 90,00",
        status: "Pago",
      },
    ]);

    const confirmDialog = ref(false);
    const activeCell = ref(null);

    const getCellClass = (rowId, colName) => {
      const row = rows.value.find((row) => row.id === rowId);
      if (row && colName === "status") {
        return row.status === "Pago" ? "pago" : "em-aberto";
      }
      return "";
    };

    const toggleCell = (rowId, colName) => {
      if (colName !== "status") return; // Apenas a coluna 'status' é interativa

      // Define a célula ativa
      activeCell.value = { rowId, colName };

      // Atualiza o valor da célula
      confirmDialog.value = true;
    };

    const confirmChange = () => {
      const { rowId, colName } = activeCell.value;
      const rowIndex = rows.value.findIndex((row) => row.id === rowId);
      if (rowIndex !== -1) {
        // Alterna o valor da célula entre 'Pago' e 'Em aberto'
        rows.value[rowIndex][colName] =
          rows.value[rowIndex][colName] === "Pago" ? "Em aberto" : "Pago";
      }
      // Fecha o modal de confirmação
      confirmDialog.value = false;
    };

    const filteredRows = computed(() => {
      const searchTerm = filtro.pesquisa.trim().toLowerCase();
      if (!searchTerm) {
        return rows.value;
      }
      return rows.value.filter(row => {
        return columns.some(col =>
          String(row[col.field]).toLowerCase().includes(searchTerm)
        );
      });
    });

    return {
      columns,
      filtro,
      rows,
      confirmDialog,
      activeCell,
      getCellClass,
      toggleCell,
      confirmChange,
      filteredRows,
    };
  },
};
</script>

<style lang="scss">
.header {
  border-bottom: 1px solid #ffa700;
}
.container {
  width: 75%;
  margin: auto;
}
.header-div {
  height: 80px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.logo {
  width: 160px;
  margin-bottom: 8px;
}
.nav-list {
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
  color: #ffa700;
}

.btn-table {
  width: 150px;
  background-color: transparent;
  padding: 10px;
  border: 1px solid #ffa700;
  border-radius: 10px;
  color: #ffffff;

  &:hover {
    color: #ffa700;
    cursor: pointer;
  }
}

.table-vendas-head {
  font-weight: bold;
  border-bottom: 1px solid #ffa700;
  background-color: #ffa700;
}

.em-aberto {
  color: $warning; /* Cor de fundo para a célula específica */
  font-weight: bold; /* Texto em negrito */
  cursor: pointer;
}

.pago {
  color: $positive;
  font-weight: bold;
  cursor: pointer;
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
