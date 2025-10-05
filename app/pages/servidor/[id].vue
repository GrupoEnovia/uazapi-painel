<script setup lang="ts">
import type { Server } from '../../../shared/types/Server'

// Página de detalhes do servidor
const route = useRoute()
const serverId = route.params.id as string

// Buscar servidor pelo ID
const { servers } = useServers()
const server = computed(() => servers.value.find(s => s.id === serverId))

// Buscar instâncias do servidor
const { instances, loading, error, fetchInstances, clearInstances } = useInstances()

// Se servidor não encontrado, redirecionar para home
watchEffect(() => {
  if (servers.value.length > 0 && !server.value) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Servidor não encontrado'
    })
  }
})

useHead({
  title: computed(() => server.value ? `${server.value.nome} - Detalhes do Servidor` : 'Carregando...')
})

// Watcher para buscar instâncias quando o servidor mudar
watchEffect(() => {
  if (server.value && server.value.serverUrl && server.value.adminToken) {
    fetchInstances(server.value.serverUrl, server.value.adminToken)
  } else {
    clearInstances()
  }
})

// Estados para mostrar/esconder token e controlar cópia
const showToken = ref(false)
const copied = ref(false)

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Erro ao copiar:', err)
  }
}

const copyToken = () => {
  if (server.value?.adminToken) {
    copyToClipboard(server.value.adminToken)
  }
}

const copyServerUrl = () => {
  if (server.value?.serverUrl) {
    copyToClipboard(server.value.serverUrl)
  }
}

// Itens do dropdown com todos os servidores
const dropdownItems = computed(() => {
  if (servers.value.length <= 1) {
    return [[
      {
        label: 'Nenhum outro servidor',
        icon: 'i-lucide-info',
        disabled: true
      }
    ]]
  }

  return [
    servers.value.map(s => ({
      label: s.nome,
      icon: s.id === serverId ? 'i-lucide-check' : 'i-lucide-server',
      to: s.id === serverId ? undefined : `/servidor/${s.id}`,
      disabled: s.id === serverId
    }))
  ]
})
</script>

<template>
  <NuxtLayout name="default-layout">
    <div class="container mx-auto px-4 py-8">
      <!-- Loading state -->
      <div v-if="!server" class="flex items-center justify-center py-12">
        <div class="text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p class="text-gray-600 dark:text-gray-400">Carregando servidor...</p>
        </div>
      </div>

      <!-- Server details -->
      <div v-else>
        <!-- Header -->
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ server.nome }}
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            Detalhes e configurações do servidor
          </p>
        </div>

        <!-- Informações do servidor -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <!-- Server URL - Dropdown style -->
          <div>
            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Server URL
            </label>
            <UDropdownMenu :items="dropdownItems" :ui="{ content: 'w-(--reka-dropdown-menu-trigger-width)' }">
              <UButton
                class="w-full justify-start h-10"
                color="neutral"
                variant="outline"
                :label="server.serverUrl"
                trailing-icon="i-lucide-chevron-down"
                truncate
              />
            </UDropdownMenu>
          </div>

          <!-- Admin Token - Input style readonly -->
          <div>
            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Admin Token
            </label>
            <div class="relative w-full">
              <UInput
                :model-value="showToken ? server.adminToken : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'"
                readonly
                class="w-full pr-20"
                :type="showToken ? 'text' : 'password'"
              />
              <div class="absolute inset-y-0 right-0 flex items-center pr-3 gap-1">
                <UButton
                  color="neutral"
                  variant="link"
                  size="xs"
                  :icon="showToken ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  class="cursor-pointer"
                  @click="showToken = !showToken"
                />
                <UButton
                  color="neutral"
                  variant="link"
                  size="xs"
                  :icon="copied ? 'i-lucide-copy-check' : 'i-lucide-copy'"
                  :class="copied ? 'text-success' : ''"
                  class="cursor-pointer"
                  @click="copyToken"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Tabela de instâncias -->
        <InstanceTable
          :instances="instances"
          :loading="loading"
          :error="error"
        />
      </div>
    </div>
  </NuxtLayout>
</template>
