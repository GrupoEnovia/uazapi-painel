import type { Instance } from '../../shared/types/Instance'

// Composable para gerenciar instâncias de um servidor
export const useInstances = () => {
  // Estado reativo das instâncias
  const instances = ref<Instance[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Buscar todas as instâncias de um servidor
  const fetchInstances = async (serverUrl: string, adminToken: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<Instance[]>(`${serverUrl}/instance/all`, {
        headers: {
          'admintoken': adminToken
        }
      })

      instances.value = response
    } catch (err: any) {
      console.error('Erro ao buscar instâncias:', err)
      
      // Tratar diferentes tipos de erro
      if (err.status === 401) {
        error.value = 'Token de administrador inválido'
      } else if (err.status === 404) {
        error.value = 'Servidor não encontrado'
      } else if (err.data?.error) {
        error.value = err.data.error
      } else {
        error.value = 'Erro ao conectar com o servidor'
      }
      
      instances.value = []
    } finally {
      loading.value = false
    }
  }

  // Limpar dados das instâncias
  const clearInstances = () => {
    instances.value = []
    error.value = null
  }

  return {
    instances: readonly(instances),
    loading: readonly(loading),
    error: readonly(error),
    fetchInstances,
    clearInstances
  }
}
