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
    <div class="col q-ml-xl">
      <q-btn label="Filtro" class="btn-vendas" text-color="black" />
    </div>
    <div class="col-auto">
      <q-btn
        label="Novo Cadastro"
        class="btn-vendas"
        text-color="black"
        @click="showDialog = true"
      />
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

  <q-dialog
    v-model="showDialog"
    persistent
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="bg-dark text-white" style="width: 75%; max-width: 80vw">
      <q-card-section>
        <div class="text-h6">Novo Cadastro</div>
      </q-card-section>

      <q-card-section class="text-white">
        <q-form ref="myForm" @submit.prevent="submitForm" class="q-gutter-md">

          <q-input v-model="form.cliente" label="Cliente" dark />

          <q-input v-model="form.dataHora" label="Data e Hora" dark />

          <q-input v-model="form.veiculo" label="Veículo(Placa)" dark />

          <q-input
            v-model.number="form.metragem"
            label="Metragem(m³)"
            type="number"
            dark
          />

          <q-input v-model="form.material" label="Material" dark />

          <q-input
            v-model.number="form.valor"
            label="Valor"
            type="number"
            prefix="R$ "
            dark
          />

          <q-select
            v-model="form.status"
            :options="statusOptions"
            label="Status"
            dark
          />

          <q-btn flat type="submit" label="Cadastrar" color="positive" />
          <q-btn
            flat
            label="Cancelar"
            color="negative"
            @click="cancelForm"
            v-close-popup
          />
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, reactive, computed, onMounted } from "vue";
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
      { name: 'id', required: true, label: 'Número', align: 'left', field: 'id' },
      { name: 'client', label: 'Cliente', align: 'left', field: 'client' },
      { name: 'material', label: 'Material', align: 'left', field: 'material' },
      { name: 'metragem', label: 'Metragem(m³)', align: 'left', field: 'metragem' },
      { name: 'valor', label: 'Valor(R$)', align: 'left', field: 'valor' },
      { name: 'status', label: 'Status', align: 'left', field: 'status' }
    ];

    const rows = ref([]);

    const listaVendas = async () => {
      try {
        const response = await fetch(
          "https://mineracao-candido-default-rtdb.firebaseio.com/mineracao-candido/vendas.json?auth=BjnEyRJ8uJarULytYsLc8iKfMSml7JEeUb8CoAKl"
        );
        const data = await response.json();

        rows.value = Object.keys(data).map((key, index) => ({
          id: index + 1,  // O ID será baseado na posição (index + 1)
          client: data[key].cliente,
          material: data[key].material,
          metragem: data[key].metragem,
          valor: data[key].valor,
          status: data[key].status.label,
        }));
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };

    onMounted(() => {
      listaVendas();
    });

    const confirmDialog = ref(false);
    const showDialog = ref(false);
    const activeCell = ref(null);

    const getCellClass = (rowId, colName) => {
      const row = rows.value.find((row) => row.id === rowId);
      if (row && colName === "status") {
        return row.status === "PAGO" ? "pago" : "em-aberto";
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
          rows.value[rowIndex][colName] === "PAGO" ? "EM ABERTO" : "PAGO";
      }
      // Fecha o modal de confirmação
      confirmDialog.value = false;
    };

    const filteredRows = computed(() => {
      const searchTerm = filtro.pesquisa.trim().toLowerCase();
      if (!searchTerm) {
        return rows.value;
      }
      return rows.value.filter((row) => {
        return String(row.client).toLowerCase().startsWith(searchTerm);
      });
    });

    const initialFormState = {
      cliente: null,
      dataHora: new Date().toISOString().substr(0, 10),
      veiculo: null,
      metragem: null,
      material: null,
      valor: null,
      status: null,
    };

    const form = reactive({ ...initialFormState });

    const myForm = ref(null);

    const statusOptions = [
      { label: "PAGO", value: true },
      { label: "EM ABERTO", value: false },
    ];

    const resetForm = () => {
      Object.assign(form, initialFormState);
      myForm.value.resetValidation();
    };

    const submitForm = async () => {
      // Lógica para salvar o formulário
      const response = await fetch(
        "https://mineracao-candido-default-rtdb.firebaseio.com/mineracao-candido/vendas.json?auth=BjnEyRJ8uJarULytYsLc8iKfMSml7JEeUb8CoAKl",
        {
          method: "POST", // or 'PUT'
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const result = await response.json();
      console.log(result);
      showDialog.value = false;
      resetForm();
    };
    const cancelForm = () => {
      showDialog.value = false;
      resetForm(); // Limpar o formulário após cancelar
    };

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
      showDialog,
      form,
      statusOptions,
      myForm,
      submitForm,
      cancelForm,
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

// TABELA DE VENDAS

.btn-vendas {
  background-color: #ffa700;
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
