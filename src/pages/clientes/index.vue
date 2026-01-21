<template>
  <q-page padding>
    <q-table
      :loading="carregandoClientes"
      :rows="filtered"
      :columns="columns"
      row-key="id"
      :grid="$q.screen.lt.md"
      class="text-center q-ma-lg no-shadow"
      @row-click="linhaCliente"
    >
      <template v-slot:top>
        <div class="col-12 row items-center justify-between q-gutter-y-sm">
          <div class="row items-center q-gutter-sm">
            <q-icon name="people" size="sm" color="primary" />
            <div class="text-h6 text-weight-medium">Clientes</div>
          </div>

          <div class="row q-gutter-sm items-center full-width-mobile">
            <q-input
              dense
              debounce="300"
              v-model="filter"
              placeholder="Pesquisar..."
              bg-color="white"
              class="col q-mr-md"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
            <q-btn
              color="positive"
              icon="add"
              label="Novo Cliente"
              unelevated
              @click="onAdd"
            />
          </div>
        </div>
      </template>

      <template v-slot:item="props">
        <div class="q-pa-xs col-xs-12 col-sm-6">
          <q-card flat bordered class="q-py-sm">
            <q-item clickable @click="linhaCliente(null, props.row)">
              <q-item-section>
                <q-item-label class="text-weight-bold">{{
                  props.row.nome
                }}</q-item-label>
              </q-item-section>

              <q-item-section side>
                <div class="row q-gutter-xs">
                  <q-btn
                    size="sm"
                    flat
                    round
                    color="primary"
                    icon="edit"
                    @click.stop="onEdit(props.row)"
                  />
                  <q-btn
                    size="sm"
                    flat
                    round
                    color="negative"
                    icon="delete"
                    @click.stop="confirmDelete(props.row)"
                  />
                </div>
              </q-item-section>
            </q-item>
          </q-card>
        </div>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td align="center">
          <q-btn
            dense
            flat
            icon="edit"
            color="primary"
            @click.stop="onEdit(props.row)"
          />
          <q-btn
            dense
            flat
            icon="delete"
            color="negative"
            @click.stop="confirmDelete(props.row)"
          />
        </q-td>
      </template>

      <template v-slot:no-data>
        <div class="full-width row flex-center text-grey-8 q-gutter-sm q-pa-lg">
          <q-icon size="2em" name="sentiment_dissatisfied" />
          <span>Nenhum cliente encontrado.</span>
        </div>
      </template>
    </q-table>

    <!-- MODAL CONFIRMAR EXCLUSÃO CLIENTE -->
    <q-dialog v-model="deleteDialog">
      <q-card>
        <q-card-section class="text-h6">Confirmar exclusão</q-card-section>

        <q-card-section>
          Deseja excluir o cliente
          <strong v-if="toDelete"> {{ toDelete.nome }} </strong>?
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancelar"
            v-close-popup
            @click="deleteDialog = false"
          />
          <q-btn color="negative" label="Excluir" @click="deleteClient" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- MODAL CADASTRAR/EDITAR CLIENTE -->
    <q-dialog v-model="dialogCliente" persistent>
      <q-card style="width: 550px; max-width: 90vw; border-radius: 12px">
        <q-card-section class="bg-primary text-white row items-center">
          <div class="text-h6">
            <q-icon name="person_add" class="q-mr-sm" />
            {{ form.id || form.clienteId ? "Editar Cliente" : "Novo Cliente" }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-form @submit="salvarCliente">
          <q-card-section class="q-gutter-md">
            <div class="text-subtitle2 q-mb-xs color-primary">
              Tipo de Cadastro
            </div>
            <div class="row q-gutter-sm">
              <q-radio
                v-model="form.type"
                val="PESSOA_FISICA"
                label="Pessoa Física"
                color="secondary"
              />
              <q-radio
                v-model="form.type"
                val="PESSOA_JURIDICA"
                label="Pessoa Jurídica"
                color="secondary"
              />
            </div>

            <q-separator q-my-md />

            <q-input
              v-model="form.nome"
              label="Nome Completo / Fantasia *"
              outlined
              dense
              :rules="[(val) => !!val || 'Campo obrigatório']"
            />

            <template v-if="form.type === 'PESSOA_FISICA'">
              <q-input
                v-model="form.cpf"
                label="CPF"
                outlined
                dense
                mask="###.###.###-##"
                unmasked-value
                :rules="[validarCPF]"
              />
            </template>

            <template v-else>
              <q-input
                v-model="form.cnpj"
                label="CNPJ"
                outlined
                dense
                mask="##.###.###/####-##"
                unmasked-value
                :rules="[validarCNPJ]"
              />
              <q-input
                v-model="form.razaoSocial"
                label="Razão Social"
                outlined
                dense
              />
              <q-input
                v-model="form.inscricaoEstadual"
                label="Inscrição Estadual"
                outlined
                dense
              />
            </template>

            <q-input
              v-model="form.telefone"
              label="Telefone"
              outlined
              dense
              mask="(##) #####-####"
              unmasked-value
            />
            <q-input
              v-model="form.email"
              label="E-mail"
              outlined
              dense
              type="email"
            />

            <q-input
              v-model="form.endereco"
              label="Endereço Completo"
              outlined
              dense
              autogrow
            />
          </q-card-section>

          <q-card-actions align="right" class="q-pb-md q-pr-md">
            <q-btn label="Cancelar" flat color="grey-7" v-close-popup />
            <q-btn
              type="submit"
              label="Salvar Cliente"
              color="secondary"
              class="text-weight-bold"
              :loading="loading"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- MODAL DETALHES DO CLIENTE -->
    <q-dialog
      v-model="modalLinhaCliente"
      transition-show="scale"
      transition-hide="scale"
    >
      <q-card style="width: 550px; max-width: 90vw; border-radius: 12px">
        <q-card-section class="row items-center bg-primary text-white q-pa-md">
          <q-icon name="person" size="lg" class="q-mr-sm" />
          <div>
            <div class="text-h6 line-height-1">Detalhes do Cliente</div>
            <div class="text-caption text-blue-1">
              Informações gerais e veículos
            </div>
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <div class="text-caption text-grey-7">Nome Completo</div>
              <div class="text-subtitle1 text-weight-bold">
                {{ linhaSelecionadaCliente.nome }}
              </div>
            </div>
            <template v-if="linhaSelecionadaCliente.type === 'PESSOA_FISICA'">
              <div class="col-12 col-sm-6">
                <div class="text-caption text-grey-7">CPF</div>
                <div class="text-subtitle1">
                  {{ formatarDocumento(linhaSelecionadaCliente.cpf) }}
                </div>
              </div>
            </template>
            <template v-else>
              <div class="col-12 col-sm-6">
                <div class="text-caption text-grey-7">CNPJ</div>
                <div class="text-subtitle1">
                  {{ formatarDocumento(linhaSelecionadaCliente.cnpj) }}
                </div>
              </div>
              <div class="col-12 col-sm-6">
                <div class="text-caption text-grey-7">Razão Social</div>
                <div class="text-subtitle1">
                  {{ linhaSelecionadaCliente.razaoSocial }}
                </div>
              </div>
              <div class="col-12 col-sm-6">
                <div class="text-caption text-grey-7">Inscrição Estadual</div>
                <div class="text-subtitle1">
                  {{ linhaSelecionadaCliente.inscricaoEstadual }}
                </div>
              </div>
            </template>
            <div class="col-12 col-sm-6">
              <div class="text-caption text-grey-7">E-mail</div>
              <div class="text-subtitle1">
                {{ linhaSelecionadaCliente.email }}
              </div>
            </div>
            <div class="col-12 col-sm-6">
              <div class="text-caption text-grey-7">Telefone</div>
              <div class="text-subtitle1">
                {{ formatarTelefone(linhaSelecionadaCliente.telefone) }}
              </div>
            </div>
            <div class="col-12 col-sm-6">
              <div class="text-caption text-grey-7">Cadastrado em</div>
              <div class="text-subtitle1">
                {{ formatDate(linhaSelecionadaCliente.createdAt) }}
              </div>
            </div>
            <div class="col-12">
              <div class="text-caption text-grey-7">Endereço</div>
              <div class="text-subtitle1">
                {{ linhaSelecionadaCliente.endereco }}
              </div>
            </div>
          </div>

          <q-separator class="q-my-lg" />

          <div class="row justify-between items-center q-mb-sm">
            <div class="text-h6 text-primary">
              <q-icon name="local_shipping" class="q-mr-xs" />
              Veículos
              <q-badge align="middle" color="orange" class="q-ml-xs">
                {{ linhaSelecionadaCliente.veiculos?.length || 0 }}
              </q-badge>
            </div>
            <q-btn
              outline
              icon="add"
              label="Novo Veículo"
              color="positive"
              size="md"
              class="rounded-borders"
              @click="adicionarVeiculo"
            />
          </div>

          <q-list
            bordered
            separator
            class="rounded-borders"
            v-if="linhaSelecionadaCliente.veiculos?.length > 0"
          >
            <q-item
              v-for="veiculo in linhaSelecionadaCliente.veiculos"
              :key="veiculo.id"
              class="q-py-md"
            >
              <q-item-section avatar>
                <q-avatar
                  color="blue-1"
                  text-color="blue-8"
                  icon="directions_car"
                />
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-bold">{{
                  veiculo.placa
                }}</q-item-label>
                <q-item-label caption>
                  Capacidade:
                  <span class="text-weight-medium text-black"
                    >{{ veiculo.metragem }} m³</span
                  >
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <div class="row q-gutter-xs">
                  <q-btn
                    size="sm"
                    flat
                    round
                    color="grey-7"
                    icon="edit"
                    @click="confirmVeiculo(veiculo)"
                  />
                  <q-btn
                    size="sm"
                    flat
                    round
                    color="negative"
                    icon="delete"
                    @click="confirmVeiculoDelete(veiculo)"
                  />
                </div>
              </q-item-section>
            </q-item>
          </q-list>

          <div
            v-else
            class="column items-center q-pa-lg text-grey-6 border-dashed rounded-borders"
          >
            <q-icon name="inventory_2" size="xl" />
            <div class="q-mt-sm">Nenhum veículo cadastrado.</div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="bg-grey-1 q-pa-md">
          <q-btn
            flat
            label="Fechar"
            color="primary"
            v-close-popup
            class="q-px-md"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- MODAL NOVO VEICULO -->
    <q-dialog
      v-model="novoVeiculoDialog"
      transition-show="scale"
      transition-hide="scale"
    >
      <q-card style="width: 400px; max-width: 90vw; border-radius: 12px">
        <q-card-section class="row items-center bg-positive text-white q-pa-md">
          <q-icon name="local_shipping" size="sm" class="q-mr-sm" />
          <div>
            <div class="text-h6 line-height-1">Novo Veículo</div>
            <div class="text-caption text-white opacity-80">
              Cadastrar novo veículo
            </div>
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-lg q-gutter-y-md">
          <q-input
            v-model="novoVeiculo.placa"
            label="Placa do Veículo"
            outlined
            dense
            hint="Ex: ABC1234"
            bg-color="grey-1"
          >
            <template v-slot:prepend>
              <q-icon name="directions_car" color="positive" />
            </template>
          </q-input>

          <q-input
            v-model.number="novoVeiculo.metragem"
            label="Capacidade/Metragem"
            type="number"
            outlined
            dense
            suffix="m³"
            bg-color="grey-1"
          >
            <template v-slot:prepend>
              <q-icon name="straighten" color="positive" />
            </template>
          </q-input>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md bg-grey-1">
          <q-btn
            flat
            label="Cancelar"
            color="grey-7"
            v-close-popup
            class="q-px-md"
          />
          <q-btn
            unelevated
            label="Cadastrar Veículo"
            color="positive"
            @click="addNovoVeiculo"
            :loading="loading"
            class="q-px-lg"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- MODAL EDITAR VEÍCULO -->
    <q-dialog
      v-model="editVeiculoDialog"
      transition-show="scale"
      transition-hide="scale"
    >
      <q-card style="width: 400px; max-width: 90vw; border-radius: 12px">
        <q-card-section class="row items-center bg-primary text-white q-pa-md">
          <q-icon name="edit" size="sm" class="q-mr-sm" />
          <div>
            <div class="text-h6 line-height-1">Editar Veículo</div>
            <div class="text-caption text-blue-1">
              Atualize os dados da frota
            </div>
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-lg q-gutter-y-md">
          <q-input
            v-model="toEditVeiculo.placa"
            label="Placa do Veículo"
            outlined
            dense
            hint="Ex: ABC-1234"
            bg-color="grey-1"
          >
            <template v-slot:prepend>
              <q-icon name="pin" color="secondary" />
            </template>
          </q-input>

          <q-input
            v-model.number="toEditVeiculo.metragem"
            label="Capacidade/Metragem"
            type="number"
            outlined
            dense
            suffix="m³"
            bg-color="grey-1"
          >
            <template v-slot:prepend>
              <q-icon name="straighten" color="secondary" />
            </template>
          </q-input>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md bg-grey-1">
          <q-btn
            flat
            label="Cancelar"
            color="grey-7"
            v-close-popup
            class="q-px-md"
          />
          <q-btn
            unelevated
            label="Salvar Alterações"
            color="secondary"
            @click="editVeiculo"
            :loading="loading"
            class="q-px-lg"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <!-- MODAL EXCLUIR VEÍCULO -->
    <q-dialog v-model="deleteVeiculoDialog">
      <q-card>
        <q-card-section class="text-h6">Confirmar exclusão</q-card-section>

        <q-card-section>
          Deseja excluir o veículo com placa:
          <strong v-if="toDeleteVeiculo"> {{ toDeleteVeiculo.placa }} </strong>?
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancelar"
            v-close-popup
            @click="deleteVeiculoDialog = false"
          />
          <q-btn
            color="negative"
            :loading="loading"
            label="Excluir"
            @click="deleteVeiculo"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useQuasar, date } from "quasar";
import { api } from "src/boot/axios";
const $q = useQuasar();
const router = useRouter();

// dados de exemplo — substitua por chamada à API conforme necessário
const clients = ref([]);
const carregandoClientes = ref(false);
const dialogCliente = ref(false);
const loading = ref(false);
const formPadrao = {
  type: "PESSOA_FISICA",
  nome: "",
  cpf: null,
  razaoSocial: null,
  cnpj: null,
  inscricaoEstadual: null,
  endereco: null,
  telefone: null,
  email: null,
};
const form = ref({ ...formPadrao });
const editVeiculoDialog = ref(false);
const novoVeiculoDialog = ref(false);
const novoVeiculo = ref({
  placa: "",
  metragem: null,
});

const modalLinhaCliente = ref(false);
const linhaSelecionadaCliente = ref(null);

const filter = ref("");

const columns = [
  {
    name: "nome",
    label: "Nome",
    field: (row) => row.nome,
    sortable: true,
  },
  { name: "email", label: "E‑mail", field: "email" },
  { name: "telefone", label: "Telefone", field: "telefone" },
  { name: "actions", label: "Ações", field: "actions", align: "center" },
];

const filtered = computed(() => {
  const q = filter.value && filter.value.toLowerCase().trim();
  if (!q) return clients.value;
  return clients.value.filter((c) =>
    (c.name + " " + c.email + " " + c.telefone).toLowerCase().includes(q),
  );
});

const validarCPF = (val) => {
  if (!val || val.length === 0) return true;
  const cpf = val.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return "CPF inválido";

  let soma = 0,
    resto;
  for (let i = 1; i <= 9; i++)
    soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return "CPF inválido";

  soma = 0;
  for (let i = 1; i <= 10; i++)
    soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return "CPF inválido";

  return true;
};

// Validador de CNPJ
const validarCNPJ = (val) => {
  if (!val || val.length === 0) return true;
  const cnpj = val.replace(/\D/g, "");
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return "CNPJ inválido";

  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  let digitos = cnpj.substring(tamanho);
  let soma = 0,
    pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return "CNPJ inválido";

  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(1))) return "CNPJ inválido";

  return true;
};

async function salvarCliente() {
  loading.value = true;
  try {
    const id = form.value.id || form.value.clienteId;

    const isEditing = !!id;
    const url = isEditing ? `/clients/${id}` : "/clients";
    const method = isEditing ? "put" : "post";

    const token = localStorage.getItem("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    await api[method](url, form.value, config);
    $q.notify({
      type: "positive",
      message: `Cliente ${
        isEditing ? "atualizado" : "cadastrado"
      } com sucesso!`,
      position: "top",
    });
    dialogCliente.value = false;
    carregaLista();
  } catch (error) {
    console.error(error);
    $q.notify({
      type: "negative",
      message: "Erro ao salvar os dados. Verifique a conexão.",
      position: "top",
    });
  } finally {
    loading.value = false;
  }
}
const onAdd = () => {
  // Reseta o formulário para o estado inicial
  form.value = {
    type: "PESSOA_FISICA",
    nome: "",
    cpf: null,
    razaoSocial: null,
    cnpj: null,
    inscricaoEstadual: null,
    endereco: null,
    telefone: null,
    email: null,
    // clienteId fica nulo aqui, então o título vira "Novo Cliente"
  };
  dialogCliente.value = true;
};

function onEdit(clienteDaLinha) {
  form.value = { ...clienteDaLinha };
  form.value.type = clienteDaLinha.type || "PESSOA_FISICA";

  dialogCliente.value = true;
}

const deleteDialog = ref(false);
const toDelete = ref(null);

function confirmDelete(row) {
  toDelete.value = row;
  deleteDialog.value = true;
}

async function deleteClient() {
  if (!toDelete.value) return;

  // Pegamos o ID correto (verifique se no seu banco é 'id' ou 'clienteId')
  const id = toDelete.value.id;
  const token = localStorage.getItem("token"); // Ou sua store de preferência

  try {
    // 1. Chamada para a API
    await api.delete(`/clients/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // 2. Se a API respondeu sucesso, removemos da lista local (UI)
    clients.value = clients.value.filter(
      (c) => c.id !== id && c.clienteId !== id,
    );

    // 3. Feedback e fechamento
    $q.notify({
      type: "positive",
      message: "Cliente excluído com sucesso da base de dados.",
    });

    deleteDialog.value = false;
    toDelete.value = null;
  } catch (error) {
    console.error("Erro ao excluir cliente:", error);

    // Feedback de erro para o usuário
    $q.notify({
      type: "negative",
      message: "Não foi possível excluir o cliente. Tente novamente.",
    });
  }
}

const linhaCliente = (evt, row) => {
  linhaSelecionadaCliente.value = row;
  modalLinhaCliente.value = true;
};

const toEditVeiculo = ref(null);

function confirmVeiculo(row) {
  toEditVeiculo.value = row;
  editVeiculoDialog.value = true;
}

const deleteVeiculoDialog = ref(false);
const toDeleteVeiculo = ref(null);
const confirmVeiculoDelete = (row) => {
  toDeleteVeiculo.value = row;
  deleteVeiculoDialog.value = true;
};

async function deleteVeiculo() {
  loading.value = true;
  if (!toDeleteVeiculo.value) return;

  const veiculoId = toDeleteVeiculo.value.id;
  try {
    // 1. Chamada para a API
    await api.delete(`/veiculos/${Number(veiculoId)}`);

    if (
      linhaSelecionadaCliente.value &&
      linhaSelecionadaCliente.value.veiculos
    ) {
      linhaSelecionadaCliente.value.veiculos =
        linhaSelecionadaCliente.value.veiculos.filter(
          (v) => v.id !== veiculoId,
        );
    }

    $q.notify({
      type: "positive",
      message: "Veículo excluído com sucesso da base de dados.",
    });

    deleteVeiculoDialog.value = false;
    toDeleteVeiculo.value = null;
  } catch (error) {
    console.error("Erro ao excluir veículo:", error);

    // Feedback de erro para o usuário
    $q.notify({
      type: "negative",
      message: "Não foi possível excluir o veículo. Tente novamente.",
    });
  } finally {
    loading.value = false;
  }
}

async function editVeiculo() {
  loading.value = true;
  if (!toEditVeiculo.value) return;

  const veiculoId = toEditVeiculo.value.id;
  try {
    await api.put(`/veiculos/${veiculoId}`, { ...toEditVeiculo.value });

    $q.notify({
      type: "positive",
      message: "Veículo atualizado com sucesso.",
    });

    editVeiculoDialog.value = false;
    toEditVeiculo.value = null;
    carregaLista();
  } catch (error) {
    console.error("Erro ao atualizar veículo:", error);

    $q.notify({
      type: "negative",
      message: "Não foi possível atualizar o veículo. Tente novamente.",
    });
  } finally {
    loading.value = false;
  }
}

const adicionarVeiculo = () => {
  novoVeiculo.value = { placa: "", metragem: null }; // Resetar campos
  novoVeiculoDialog.value = true;
};

const addNovoVeiculo = async () => {
  if (!novoVeiculo.value.placa || !novoVeiculo.value.metragem) {
    $q.notify({ color: "warning", message: "Preencha todos os campos." });
    return;
  }

  try {
    loading.value = true;
    const payload = {
      placa: novoVeiculo.value.placa.toUpperCase(),
      metragem: Number(novoVeiculo.value.metragem),
      clientId: Number(linhaSelecionadaCliente.value.id),
    };
    const response = await api.post("/veiculos", payload);

    if (!linhaSelecionadaCliente.value.veiculos) {
      linhaSelecionadaCliente.value.veiculos = [];
    }

    // Adicionamos o novo veículo à lista local
    linhaSelecionadaCliente.value.veiculos.push(response.data);

    $q.notify({
      type: "positive",
      message: "Veículo cadastrado com sucesso!",
      icon: "check_circle",
    });

    novoVeiculoDialog.value = false;
    // Aqui você deve atualizar a lista de veículos do cliente na tela
  } catch (error) {
    $q.notify({ color: "negative", message: "Erro ao cadastrar veículo." });
  } finally {
    loading.value = false;
  }
};

const carregaLista = async () => {
  carregandoClientes.value = true;
  try {
    const response = await api.get("/clients");
    clients.value = response.data;
  } catch (error) {
    console.error("Erro ao carregar clientes:", error);
    $q.notify({ type: "negative", message: "Erro ao carregar clientes" });
  } finally {
    carregandoClientes.value = false;
  }
};
const formatDate = (val) => {
  return date.formatDate(val, "DD/MM/YYYY [às] HH:mm");
};
const formatarTelefone = (tel) => {
  if (!tel) return "";

  // Remove tudo que não for número
  const num = tel.replace(/\D/g, "");

  // Formatação para (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
  if (num.length === 11) {
    return num.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  } else if (num.length === 10) {
    return num.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  }

  return tel; // Retorna o original caso não tenha o tamanho padrão
};

const formatarDocumento = (doc) => {
  if (!doc) return "Não informado";

  // Remove qualquer caractere que não seja número por segurança
  const numerico = String(doc).replace(/\D/g, "");

  if (numerico.length === 11) {
    // Máscara CPF: 000.000.000-00
    return numerico.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }

  if (numerico.length === 14) {
    // Máscara CNPJ: 00.000.000/0000-00
    return numerico.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5",
    );
  }

  return numerico; // Retorna o original se não for CPF nem CNPJ
};
// Limpa campos específicos ao trocar o tipo de pessoa
watch(
  () => form.value.type,
  (novoTipo) => {
    if (novoTipo === "PESSOA_FISICA") {
      form.value.cnpj = null;
      form.value.razaoSocial = null;
      form.value.inscricaoEstadual = null;
    } else {
      form.value.cpf = null;
    }
  },
);

onMounted(() => {
  carregaLista();
  // carregar dados da API aqui, se necessário
});
</script>
