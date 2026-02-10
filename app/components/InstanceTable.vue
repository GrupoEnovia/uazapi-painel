<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn, TableRow } from '@nuxt/ui'
import type { Instance } from '../../shared/types/Instance'
import { useInstancesStore } from '../stores/instances'
import { useInstanciaAtualStore } from '../stores/instanciaAtual'

const UAvatar = resolveComponent('UAvatar')
const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')

// Composable do Toast
const reconnectingInstances = ref(new Set<string>())

// ... existing code ...

const toast = useToast()

interface Props {
  instances: readonly Instance[]
  loading: boolean
  error: string | null
  serverUrl?: string
  adminToken?: string
}

const props = defineProps<Props>()

// Definir emits
const emit = defineEmits<{
  createInstance: []
  refreshInstances: []
  openGlobalWebhook: []
}>()

// Stores Pinia
const instancesStore = useInstancesStore()
const instanciaAtualStore = useInstanciaAtualStore()

interface Props {
  instances: readonly Instance[]
  loading: boolean
  error: string | null
  serverUrl?: string
  adminToken?: string
}

// Função para navegar para página da instância
function openInstancePage(row: TableRow<Instance>) {
  const instance = row.original
  console.log('Navegando para página da instância:', instance.name)
  
  // Definir a instância atual no store com informações do servidor
  if (props.serverUrl && props.adminToken) {
    instanciaAtualStore.setInstanciaWithServer(instance, props.serverUrl, props.adminToken)
  } else {
    instanciaAtualStore.setInstancia(instance)
  }
  
  // Navegar para a página da instância
  navigateTo(`/instancia/${instance.id}`)
}

// Estado para o filtro de pesquisa (lendo e escrevendo na store)
const searchQuery = computed({
  get: () => instancesStore.searchQuery,
  set: (val) => instancesStore.setSearchQuery(val)
})

// Estado para o filtro de status (lendo e escrevendo na store)
const statusFilter = computed({
  get: () => instancesStore.statusFilter,
  set: (val) => instancesStore.setStatusFilter(val)
})

// Opções do filtro de status
const statusOptions = [
  { label: 'Todos', value: 'all' },
  { label: 'Conectado', value: 'connected' },
  { label: 'Desconectado', value: 'disconnected' },
  { label: 'Conectando', value: 'connecting' }
]

// Computed para filtrar instâncias usando o getter da store (que já usa os estados da store)
const filteredInstances = computed(() => {
  return instancesStore.filteredInstances
})

// Estado para controlar a ordenação (lendo e escrevendo na store)
const sorting = computed({
  get: () => instancesStore.tableSorting,
  set: (val) => instancesStore.setTableSorting(val)
})

// Computed para ordenar instâncias (removido a ordenação manual pois o TanStack Table vai gerenciar)
const sortedInstances = computed(() => {
  if (!filteredInstances.value) return []
  return [...filteredInstances.value]
})

// Computed para contar status usando o store (agora usa o getter da store para pegar totais reais)
const statusCounts = computed(() => instancesStore.statusCounts)



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
  },
  {
    accessorKey: 'lastDisconnect',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()
      
      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Última Desconexão',
        icon: isSorted ? (isSorted === 'asc' ? 'i-lucide-arrow-up-narrow-wide' : 'i-lucide-arrow-down-wide-narrow') : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    },
    cell: ({ row }) => {
      const instance = row.original
      
      if (!instance.lastDisconnect) {
        return h('span', { class: 'text-gray-400 text-sm' }, '-')
      }
      
      const disconnectDate = new Date(instance.lastDisconnect)
      // Verificar se a data é válida
      if (isNaN(disconnectDate.getTime())) {
        return h('span', { class: 'text-gray-400 text-sm' }, '-')
      }

      return h('div', { class: 'text-sm text-gray-600 dark:text-gray-400' }, [
        h('div', { class: 'font-medium' }, disconnectDate.toLocaleDateString('pt-BR')),
        h('div', { class: 'text-xs' }, 
          disconnectDate.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        )
      ])
    },
    meta: {
      class: {
        th: 'w-36',
        td: 'w-36'
      }
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

// Handler para refresh das instâncias
const handleInstanceUpdated = () => {
  // Emitir evento para o componente pai recarregar as instâncias
  emit('refreshInstances')
}

// Handler para reiniciar servidor
const handleRestartServer = async () => {
  if (!props.serverUrl || !props.adminToken) {
    toast.add({
      title: 'Erro de configuração',
      description: 'URL do servidor ou token não configurados',
      color: 'error',
      icon: 'i-lucide-alert-circle'
    })
    return
  }
  
  
  const loadingToast = toast.add({
    title: 'Reiniciando servidor...',
    description: 'Aguarde enquanto o serviço é reiniciado',
    color: 'warning',
    icon: 'i-lucide-loader-2'
  })
  
  try {
    const result = await instancesStore.restartServer(props.serverUrl, props.adminToken)
    
    toast.remove(loadingToast.id)
    
    if (result.success) {
      toast.add({
        title: 'Servidor reiniciado',
        description: 'O servidor foi reiniciado com sucesso',
        color: 'success',
        icon: 'i-lucide-check-circle'
      })
      // Dar um tempo para o servidor subir e atualizar a lista
      setTimeout(() => emit('refreshInstances'), 5000)
    } else {
      toast.add({
        title: 'Erro ao reiniciar',
        description: result.error || 'Falha ao reiniciar servidor',
        color: 'error',
        icon: 'i-lucide-alert-circle'
      })
    }
  } catch (err) {
    toast.remove(loadingToast.id)
    toast.add({
      title: 'Erro inesperado',
      description: 'Ocorreu um erro ao tentar reiniciar o servidor',
      color: 'error',
      icon: 'i-lucide-alert-circle'
    })
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Badges com estatísticas / Filtros -->
    <div v-if="!loading && !error" class="flex items-center justify-end gap-2">
      <UButton 
        :variant="statusFilter === 'connected' ? 'solid' : 'soft'" 
        color="success"
        size="xs"
        class="cursor-pointer"
        :icon="statusFilter === 'connected' ? 'i-lucide-check' : undefined"
        @click="statusFilter = 'connected'"
      >
        {{ statusCounts.connected }} conectada{{ statusCounts.connected !== 1 ? 's' : '' }}
      </UButton>
      
      <UButton 
        :variant="statusFilter === 'disconnected' ? 'solid' : 'soft'" 
        color="error"
        size="xs"
        class="cursor-pointer"
        :icon="statusFilter === 'disconnected' ? 'i-lucide-check' : undefined"
        @click="statusFilter = 'disconnected'"
      >
        {{ statusCounts.disconnected }} desconectada{{ statusCounts.disconnected !== 1 ? 's' : '' }}
      </UButton>

      <UButton 
        :variant="statusFilter === 'all' ? 'solid' : 'soft'" 
        color="neutral"
        size="xs"
        class="cursor-pointer"
        :icon="statusFilter === 'all' ? 'i-lucide-check' : undefined"
        @click="statusFilter = 'all'"
      >
        {{ statusCounts.total }} Todas
      </UButton>
    </div>

    <!-- Campo de pesquisa e botões -->
    <div v-if="!loading && !error" class="flex items-center justify-between gap-3">
      <div v-if="props.instances.length > 0" class="flex items-center gap-3">
        <UInput
          v-model="searchQuery"
          placeholder="Pesquisar por nome, perfil ou token..."
          icon="i-lucide-search"
          class="w-96"
        />
        <UButton
          v-if="searchQuery || statusFilter !== 'all'"
          color="neutral"
          variant="ghost"
          icon="i-lucide-x"
          size="sm"
          @click="() => { searchQuery = ''; statusFilter = 'all' }"
        >
          Limpar
        </UButton>
      </div>
      
      <!-- Div vazia para manter os botões à direita quando não há input -->
      <div v-else></div>
      
      <div class="flex items-center gap-2">
        <UButton 
          color="warning" 
          size="lg" 
          icon="i-lucide-power"
          variant="outline"
          class="cursor-pointer hover:cursor-pointer"
          @click="handleRestartServer"
        >
          Reiniciar Servidor
        </UButton>
        <UButton 
          color="secondary" 
          size="lg" 
          icon="i-lucide-webhook"
          variant="outline"
          class="cursor-pointer hover:cursor-pointer"
          @click="emit('openGlobalWebhook')"
        >
          Webhook Global
        </UButton>
        <UButton 
          color="neutral" 
          size="lg" 
          icon="i-lucide-refresh-cw"
          variant="outline"
          class="cursor-pointer hover:cursor-pointer"
          :loading="loading"
          @click="emit('refreshInstances')"
        >
          Atualizar
        </UButton>
        <UButton 
          color="primary" 
          size="lg" 
          icon="i-lucide-plus"
          class="cursor-pointer hover:cursor-pointer"
          @click="emit('createInstance')"
        >
          Criar Instância
        </UButton>
      </div>
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
            :name="searchQuery ? 'i-lucide-search-x' : 'i-lucide-smartphone'" 
            class="w-8 h-8 text-gray-400 mx-auto mb-3" 
          />
          <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-1">
            {{ searchQuery ? 'Nenhuma instância encontrada' : 'Nenhuma instância encontrada' }}
          </h4>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ searchQuery 
              ? `Nenhuma instância corresponde à busca "${searchQuery}"` 
              : 'Este servidor não possui instâncias WhatsApp ativas' 
            }}
          </p>
          <UButton
            v-if="searchQuery"
            color="neutral"
            variant="outline"
            size="sm"
            class="mt-3"
            @click="searchQuery = ''"
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
        @select="openInstancePage"
      />
    </UCard>

    <!-- Modal removido - agora navegamos para a página da instância -->
  </div>
</template>
