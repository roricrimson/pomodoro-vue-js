<template>
  <div
    class="bg-[#CAD7C5] m-5 mt-8 p-6 pb-8 pt-8 rounded-3xl shadow-[3px_3px_3px_0_#989e8e] relative h-72 flex flex-1 flex-col before:absolute before:-top-2 before:left-1/2 before:-translate-x-1/2 before:w-11/12 before:h-7 before:bg-size-[21px_28px] before:bg-[radial-gradient(circle_at_5%_45%,transparent_70%,#828E80_20%)]"
  >
    <!-- Error Toast Notification -->
    <div
      v-if="errorMessage"
      class="absolute -top-2 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-3 py-2 rounded-lg shadow-lg max-w-xs"
    >
      <div class="flex items-center gap-2">
        <ion-icon :icon="alertCircle" class="text-sm flex-shrink-0"></ion-icon>
        <span class="text-xs">{{ errorMessage }}</span>
        <button
          @click="clearError"
          class="ml-1 text-white hover:text-gray-200 flex-shrink-0"
        >
          <ion-icon :icon="close" class="text-sm"></ion-icon>
        </button>
      </div>
    </div>

    <!-- Add new todo form -->
    <form
      @submit.prevent="addTodoItem()"
      style="border-bottom: 1px solid #828e80"
      class="flex gap-2"
    >
      <input
        class="bg-transparent text-[#828e80] flex-1 placeholder:text-sm focus:outline-hidden pb-1"
        v-model="newTodoText"
        placeholder="Tap to write"
        :disabled="isLoading"
      />
      <button class="w-6 aspect-square" type="submit" :disabled="isLoading">
        <div
          v-if="isLoading"
          class="animate-spin rounded-full h-5 w-5 border-2 border-[#828E80] border-t-transparent"
        ></div>
        <ion-icon v-else class="text-[#828E80] text-2xl" :icon="add"></ion-icon>
      </button>
    </form>

    <!-- Todo items list -->
    <div
      class="flex flex-col flex-1 no-scrollbar overflow-y-scroll"
      v-auto-animate
    >
      <TodoItem
        v-for="item in sortedTodoItems"
        :key="item.id"
        :id="item.id"
        :checked="item.checked"
        v-model:name="item.name"
        @toggle-check="toggleTodoItem(item.id, $event)"
        @delete="removeTodoItem(item.id)"
        @update="saveTodoItems"
      />

      <!-- Empty slots for visual consistency -->
      <div
        v-for="slot in emptySlots"
        :key="slot"
        style="border-bottom: 1px solid #828e80"
        class="h-10"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from "@ionic/vue";
import { add, alertCircle, close } from "ionicons/icons";
import TodoItem from "./TodoItem.vue";
import { useTodoList } from "@/composables/useTodoList";

const {
  newTodoText,
  sortedTodoItems,
  emptySlots,
  errorMessage,
  isLoading,
  addTodoItem,
  removeTodoItem,
  toggleTodoItem,
  saveTodoItems,
  clearError,
} = useTodoList();
</script>
<style scoped>
ion-button {
  --padding-end: 0;
  --padding-start: 0;
}
</style>
