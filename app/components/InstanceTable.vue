<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn, TableRow } from '@nuxt/ui'
import type { Instance } from '../../shared/types/Instance'

const UAvatar = resolveComponent('UAvatar')
const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')

// Composable do Toast
const toast = useToast()

interface Props {
  instances: readonly Instance[]
  loading: boolean
  error: string | null
}

const props = defineProps<Props>()

// Estado para o filtro de pesquisa
const searchToken = ref('')

// Estado para o modal de instância
const showModal = ref(false)
const selectedInstance = ref<Instance | null>(null)

// Função para abrir modal com detalhes da instância
function openInstanceModal(row: TableRow<Instance>) {
  console.log('Abrindo modal para instância:', row.original.name)
  console.log('Estado atual do modal antes:', showModal.value)
  console.log('Instância selecionada antes:', selectedInstance.value)
  
  selectedInstance.value = row.original
  showModal.value = true
  
  console.log('Estado atual do modal depois:', showModal.value)
  console.log('Instância selecionada depois:', selectedInstance.value)
}



// Computed para filtrar instâncias por token
const filteredInstances = computed(() => {
  if (!props.instances) return []
  
  if (!searchToken.value.trim()) {
    return [...props.instances]
  }
  
  return props.instances.filter(instance => 
    instance.token.toLowerCase().includes(searchToken.value.toLowerCase().trim())
  )
})

// Estado para controlar a ordenação
const sorting = ref([{
  id: 'status',
  desc: false
}])

// Computed para ordenar instâncias (removido a ordenação manual pois o TanStack Table vai gerenciar)
const sortedInstances = computed(() => {
  if (!filteredInstances.value) return []
  return [...filteredInstances.value]
})

// Computed para contar status
const statusCounts = computed(() => {
  const connected = filteredInstances.value.filter(i => i.status.toLowerCase() === 'connected').length
  const total = filteredInstances.value.length
  const disconnected = total - connected
  
  return { connected, disconnected, total }
})



// Definir as colunas da tabela
const columns: TableColumn<Instance>[] = [
  {
    accessorKey: 'profilePicUrl',
    header: 'Foto',
    cell: ({ row }) => {
      const instance = row.original
      return h(UAvatar, {
        src: instance.profilePicUrl || undefined,
        alt: instance.profileName || instance.name,
        size: 'lg',
        icon: !instance.profilePicUrl ? 'i-lucide-user' : undefined
      })
    }
  },
  {
    accessorKey: 'owner',
    header: 'Número',
    cell: ({ row }) => {
      const instance = row.original
      return h('div', { class: 'font-mono text-sm' }, instance.owner)
    }
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()
      
      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Nome',
        icon: isSorted ? (isSorted === 'asc' ? 'i-lucide-arrow-up-narrow-wide' : 'i-lucide-arrow-down-wide-narrow') : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    },
    cell: ({ row }) => {
      const instance = row.original
      return h('div', { class: 'font-medium max-w-32 truncate' }, instance.name)
    },
    meta: {
      class: {
        th: 'w-32',
        td: 'w-32'
      }
    }
  },
  {
    accessorKey: 'profileName',
    header: 'Perfil',
    cell: ({ row }) => {
      const instance = row.original
      return h('div', { class: 'max-w-32 truncate' }, instance.profileName || '-')
    },
    meta: {
      class: {
        th: 'w-32',
        td: 'w-32'
      }
    }
  },
  {
    accessorKey: 'status',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()
      
      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Status',
        icon: isSorted ? (isSorted === 'asc' ? 'i-lucide-arrow-up-narrow-wide' : 'i-lucide-arrow-down-wide-narrow') : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    },
    cell: ({ row }) => {
      const instance = row.original
      const color = getStatusColor(instance.status)
      
      return h(UBadge, {
        color,
        variant: 'subtle',
        class: 'capitalize'
      }, () => getStatusLabel(instance.status))
    }
  },
  {
    accessorKey: 'created',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()
      
      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Criada em',
        icon: isSorted ? (isSorted === 'asc' ? 'i-lucide-arrow-up-narrow-wide' : 'i-lucide-arrow-down-wide-narrow') : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    },
    cell: ({ row }) => {
      const instance = row.original
      const createdDate = new Date(instance.created)
      
      return h('div', { class: 'text-sm' }, [
        h('div', { class: 'font-medium' }, createdDate.toLocaleDateString('pt-BR')),
        h('div', { class: 'text-xs text-gray-500 dark:text-gray-400' }, 
          createdDate.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        )
      ])
    },
    meta: {
      class: {
        th: 'w-28',
        td: 'w-28'
      }
    }
  },
  {
    accessorKey: 'token',
    header: 'Token',
    cell: ({ row }) => {
      const instance = row.original
      
      return h('div', { class: 'flex items-center gap-2' }, [
        h('code', { 
          class: 'text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded max-w-24 truncate'
        }, instance.token.substring(0, 12) + '...'),
        h(UButton, {
          color: 'neutral',
          variant: 'ghost',
          size: 'xs',
          icon: 'i-lucide-copy',
          onClick: async () => {
            try {
              await navigator.clipboard.writeText(instance.token)
              toast.add({
                title: 'Token copiado!',
                description: `Token da instância ${instance.name} copiado para a área de transferência`,
                icon: 'i-lucide-check-circle',
                color: 'success'
              })
            } catch (error) {
              toast.add({
                title: 'Erro ao copiar',
                description: 'Não foi possível copiar o token para a área de transferência',
                icon: 'i-lucide-alert-circle',
                color: 'error'  
              })
            }
          }
        })
      ])
    }
  }
]

// Função para determinar a cor do status
function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'connected':
      return 'success'
    case 'disconnected':
      return 'error'
    case 'connecting':
      return 'warning'
    default:
      return 'neutral'
  }
}

// Função para obter o label do status
function getStatusLabel(status: string) {
  switch (status.toLowerCase()) {
    case 'connected':
      return 'Conectado'
    case 'disconnected':
      return 'Desconectado'
    case 'connecting':
      return 'Conectando'
    default:
      return status
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Header da seção -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Instâncias WhatsApp
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Lista de todas as instâncias ativas no servidor · Clique em uma linha para ver detalhes
        </p>
      </div>
      
      <!-- Badges com estatísticas -->
      <div v-if="!loading && !error" class="flex items-center gap-2">
        <UBadge variant="subtle" color="success">
          {{ statusCounts.connected }} conectada{{ statusCounts.connected !== 1 ? 's' : '' }}
        </UBadge>
        <UBadge variant="subtle" color="error">
          {{ statusCounts.disconnected }} desconectada{{ statusCounts.disconnected !== 1 ? 's' : '' }}
        </UBadge>
        <UBadge variant="subtle" color="neutral">
          {{ statusCounts.total }} total
        </UBadge>
      </div>
    </div>

    <!-- Campo de pesquisa -->
    <div v-if="!loading && !error && props.instances.length > 0" class="flex items-center gap-3">
      <UInput
        v-model="searchToken"
        placeholder="Pesquisar por token..."
        icon="i-lucide-search"
        class="flex-1 max-w-sm"
      />
      <UButton
        v-if="searchToken"
        color="neutral"
        variant="ghost"
        icon="i-lucide-x"
        size="sm"
        @click="searchToken = ''"
      >
        Limpar
      </UButton>
    </div>

    <!-- Tabela -->
    <UCard>
      <!-- Estado de carregamento -->
      <div v-if="loading" class="flex items-center justify-center py-8">
        <div class="text-center">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-3"></div>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Carregando instâncias...
          </p>
        </div>
      </div>

      <!-- Estado de erro -->
      <div v-else-if="error" class="flex items-center justify-center py-8">
        <div class="text-center">
          <UIcon name="i-lucide-alert-circle" class="w-8 h-8 text-error mx-auto mb-3" />
          <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-1">
            Erro ao carregar instâncias
          </h4>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ error }}
          </p>
        </div>
      </div>

      <!-- Estado vazio -->
      <div v-else-if="sortedInstances.length === 0" class="flex items-center justify-center py-8">
        <div class="text-center">
          <UIcon 
            :name="searchToken ? 'i-lucide-search-x' : 'i-lucide-smartphone'" 
            class="w-8 h-8 text-gray-400 mx-auto mb-3" 
          />
          <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-1">
            {{ searchToken ? 'Nenhuma instância encontrada' : 'Nenhuma instância encontrada' }}
          </h4>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ searchToken 
              ? `Nenhuma instância possui o token "${searchToken}"` 
              : 'Este servidor não possui instâncias WhatsApp ativas' 
            }}
          </p>
          <UButton
            v-if="searchToken"
            color="neutral"
            variant="outline"
            size="sm"
            class="mt-3"
            @click="searchToken = ''"
          >
            Limpar pesquisa
          </UButton>
        </div>
      </div>

      <!-- Tabela com dados -->
      <UTable
        v-else
        v-model:sorting="sorting"
        :data="sortedInstances"
        :columns="columns"
        class="w-full"
        :ui="{ tr: 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50' }"
        @select="openInstanceModal"
      />
    </UCard>

    <!-- Modal de detalhes da instância -->
    <InstanciaModal
      :instance="selectedInstance"
      v-model:open="showModal"
    />
  </div>
</template>
