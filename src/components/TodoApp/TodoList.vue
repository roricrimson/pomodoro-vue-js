<template>
  <div
    class="bg-[#CAD7C5] m-5 mt-8 p-6 pb-8 pt-8 rounded-3xl shadow-[3px_3px_3px_0_#989e8e] relative h-72 flex flex-col"
  >
    <!-- Spiral binding decoration -->
    <div class="spiral-pin absolute -top-[11px] left-0 right-0 flex gap-1 px-6">
      <span
        v-for="i in 9"
        :key="i"
        class="block rounded-full flex-1 aspect-square border-[3px] border-[#828E80]"
      ></span>
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
      />
      <button class="w-6 aspect-square" type="submit">
        <ion-icon class="text-[#828E80] text-2xl" :icon="add"></ion-icon>
      </button>
    </form>
    
    <!-- Todo items list -->
    <div class="flex flex-col flex-1 no-scrollbar overflow-y-scroll" v-auto-animate>
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
import { add } from "ionicons/icons";
import TodoItem from "./TodoItem.vue";
import { useTodoList } from "@/composables/useTodoList";

const {
  newTodoText,
  sortedTodoItems,
  emptySlots,
  addTodoItem,
  removeTodoItem,
  toggleTodoItem,
  saveTodoItems,
} = useTodoList();
</script>
<style scoped>
ion-button {
  --padding-end: 0;
  --padding-start: 0;
}
</style>
