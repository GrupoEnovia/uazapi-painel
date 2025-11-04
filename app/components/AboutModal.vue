<script setup lang="ts">
// Modal Sobre o sistema

// Props e Emits seguindo padrão v-model
const open = defineModel<boolean>('open', { default: false })
</script>

<template>
  <UModal 
    v-model:open="open"
    title="Sobre o Sistema"
    description="Informações sobre o painel UAZAPI"
  >
    <template #body>
      <div class="space-y-6">
        <!-- Descrição principal -->
        <div class="space-y-4">
          <p class="text-gray-700 dark:text-gray-300">
            Este painel foi desenvolvido para gerenciamento de instâncias do UAZAPI.
          </p>
          
          <p class="text-gray-700 dark:text-gray-300">
            O painel funciona 100% no cliente, ou seja, nenhum dado é salvo no servidor. Ao cadastrar seus servidores, essas informações são salvas nos cookies do navegador e somente você tem acesso.
          </p>
          
          <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div class="flex items-start gap-3">
              <UIcon name="i-lucide-alert-triangle" class="w-5 h-5 text-yellow-500 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <p class="text-sm text-yellow-700 dark:text-yellow-300">
                <strong>Importante:</strong> Devido a isso, se limpar os cookies os dados são perdidos e tem que cadastrar novamente.
              </p>
            </div>
          </div>
        </div>

        <!-- Código fonte -->
        <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Código Fonte
          </h4>
          <p class="text-gray-700 dark:text-gray-300 mb-4">
            O código fonte deste sistema é livre e está disponível no GitHub para ser usado e alterado como quiser.
          </p>
          <a 
            href="https://github.com/IsraelHenriquee/uazapi-painel"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
          >
            <UIcon name="i-lucide-github" class="w-4 h-4" />
            <span class="font-medium">github.com/IsraelHenriquee/uazapi-painel</span>
            <UIcon name="i-lucide-external-link" class="w-3 h-3" />
          </a>
        </div>
      </div>
    </template>

    <template #footer="{ close }">
      <div class="flex gap-3 justify-end w-full">
        <UButton
          color="primary"
          @click="close"
        >
          Fechar
        </UButton>
      </div>
    </template>
  </UModal>
</template>
