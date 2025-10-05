<script setup lang="ts">
import type { Instance } from '../../shared/types/Instance'

interface Props {
  instance: Instance | null
  open: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

// Debug do componente
console.log('InstanciaModal mounted with props:', props)

// Debug das props
watch(() => props.open, (newValue) => {
  console.log('Modal open prop mudou para:', newValue)
})

watch(() => props.instance, (newValue) => {
  console.log('Modal instance prop mudou para:', newValue?.name)
})

// Composable do Toast
const toast = useToast()

// Função para copiar token
async function copyToken() {
  if (!props.instance) return
  
  try {
    await navigator.clipboard.writeText(props.instance.token)
    toast.add({
      title: 'Token copiado!',
      description: `Token da instância ${props.instance.name} copiado para a área de transferência`,
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

// Função para formatar data
function formatDate(dateString: string | undefined) {
  if (!dateString) return null
  const date = new Date(dateString)
  return {
    date: date.toLocaleDateString('pt-BR'),
    time: date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }
}
</script>

<template>
  <UModal 
    :open="props.open" 
    @update:open="emit('update:open', $event)"
    :title="instance?.name || 'Detalhes da Instância'"
  >
    <template v-if="instance" #body>
      <div class="space-y-6">
        <!-- Header com avatar e informações básicas -->
        <div class="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
          <UAvatar
            :src="instance.profilePicUrl || undefined"
            :alt="instance.profileName || instance.name"
            size="lg"
            :icon="!instance.profilePicUrl ? 'i-lucide-user' : undefined"
          />
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ instance.name }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ instance.profileName || 'Sem nome do perfil' }}
            </p>
          </div>
          <UBadge 
            :color="getStatusColor(instance.status)"
            variant="subtle"
            class="capitalize"
          >
            {{ getStatusLabel(instance.status) }}
          </UBadge>
        </div>

        <!-- Informações Básicas -->
        <div>
          <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Informações Básicas
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Número
              </label>
              <p class="mt-1 text-sm font-mono text-gray-900 dark:text-white">
                {{ instance.owner }}
              </p>
            </div>
            <div>
              <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Nome da Instância
              </label>
              <p class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ instance.name }}
              </p>
            </div>
            <div>
              <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Nome do Perfil
              </label>
              <p class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ instance.profileName || '-' }}
              </p>
            </div>
            <div>
              <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Status
              </label>
              <div class="mt-1">
                <UBadge 
                  :color="getStatusColor(instance.status)"
                  variant="subtle"
                  class="capitalize"
                >
                  {{ getStatusLabel(instance.status) }}
                </UBadge>
              </div>
            </div>
          </div>
        </div>

        <!-- Datas -->
        <div>
          <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Histórico de Conexão
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Criada em
              </label>
              <div class="mt-1" v-if="formatDate(instance.created)">
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ formatDate(instance.created)?.date }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatDate(instance.created)?.time }}
                </p>
              </div>
              <p v-else class="mt-1 text-sm text-gray-500 dark:text-gray-400">-</p>
            </div>
            <div v-if="instance.lastDisconnect">
              <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Última Desconexão
              </label>
              <div class="mt-1" v-if="formatDate(instance.lastDisconnect)">
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ formatDate(instance.lastDisconnect)?.date }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatDate(instance.lastDisconnect)?.time }}
                </p>
              </div>
              <p v-else class="mt-1 text-sm text-gray-500 dark:text-gray-400">-</p>
            </div>
          </div>
          
          <div v-if="instance.lastDisconnectReason" class="mt-4">
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Motivo da Última Desconexão
            </label>
            <p class="mt-1 text-sm text-gray-900 dark:text-white">
              {{ instance.lastDisconnectReason }}
            </p>
          </div>
        </div>

        <!-- Token -->
        <div>
          <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Token de Acesso
          </h4>
          <div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <code class="flex-1 text-xs font-mono text-gray-900 dark:text-white break-all">
              {{ instance.token }}
            </code>
            <UButton
              color="neutral"
              variant="outline"
              size="xs"
              icon="i-lucide-copy"
              @click="copyToken"
            >
              Copiar
            </UButton>
          </div>
        </div>

        <!-- Informações Adicionais -->
        <div v-if="instance.info">
          <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Informações Adicionais
          </h4>
          <div class="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div class="flex items-start gap-2">
              <UIcon name="i-lucide-info" class="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <p class="text-sm text-blue-800 dark:text-blue-200">
                {{ instance.info }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-if="instance" #footer>
      <div class="flex justify-end">
        <UButton
          color="neutral"
          variant="outline"
          @click="emit('update:open', false)"
        >
          Fechar
        </UButton>
      </div>
    </template>
  </UModal>
</template>
