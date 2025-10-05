<script setup lang="ts">
// Layout padrão com header
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
    <!-- Header -->
    <AppHeader />

    <!-- Conteúdo principal -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <UFooter class="border-t border-gray-200 dark:border-gray-800">
      <template #left>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          © {{ new Date().getFullYear() }} Minha App. Todos os direitos reservados.
        </p>
      </template>

      <template #right>
        <div class="flex items-center space-x-4">
          <!-- Links removidos pois as páginas não existem -->
        </div>
      </template>
    </UFooter>
  </div>
</template>
