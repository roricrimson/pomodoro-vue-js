<template>
  <div
    class="bg-[#CAD7C5] m-5 mt-8 p-6 pb-8 rounded-3xl shadow-md shadow-[#989E8E] relative flex-1 h-0 flex flex-col"
  >
    <div class="spiral-pin absolute -top-[11px] left-0 right-0 flex gap-1 px-6">
      <span
        v-for="item in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12]"
        class="block rounded-full flex-1 aspect-square border-4 border-[#828E80]"
      ></span>
    </div>
    <form
      @submit.prevent="addItem()"
      style="border-bottom: 1px solid #828e80"
      class="flex gap-2"
    >
      <input
        class="bg-transparent text-[#828e80] flex-1 placeholder:text-sm focus:outline-none pb-1"
        v-model="notes"
        placeholder="Tap to write"
      />
      <button class="w-6 aspect-square" type="submit">
        <ion-icon class="text-[#828E80] text-2xl" :icon="add"></ion-icon>
      </button>
    </form>
    <div class="flex flex-col flex-1 no-scrollbar overflow-y-scroll">
      <todoItem
        v-for="item in todoListDesc"
        @toggle-check="changeCheckBox($event, item.id)"
        @delete="removeItem(item.id)"
        @update="updateLocalStorage"
        :id="item.id"
        :checked="item.checked"
        :key="item.id"
        v-model:name="item.name"
      />

      <div
        v-for="n in 5 - todoList.length"
        :key="n"
        style="border-bottom: 1px solid #828e80"
        class="h-8"
        v-if="todoList.length < 5"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from "@ionic/vue";
import { add } from "ionicons/icons";
import { computed, ref, onMounted } from "vue";
import { Preferences } from "@capacitor/preferences";
import todoItem from "../components/TodoItem.vue";

const KEY = "TodoList";

const todoList = ref<any[]>([]);

const todoListDesc = computed(() => {
  return todoList.value.slice().reverse();
});

const notes = ref("");

load();

onMounted(() => {});
async function load() {
  const result = await Preferences.get({ key: KEY });
  if (result.value) {
    todoList.value = JSON.parse(result.value);
  }
}

function addItem() {
  if (notes.value !== "") {
    todoList.value.push({
      id: new Date().getTime(),
      name: notes.value,
      checked: false,
    });
    notes.value = "";

    updateLocalStorage();
  }
}

function removeItem(id: number) {
  todoList.value = todoList.value.filter((i) => i.id !== id);
  updateLocalStorage();
}

function changeCheckBox(isChecked: boolean, id: number) {
  todoList.value.forEach((i) => {
    if (i.id === id) {
      i.checked = isChecked;
    }
  });
  updateLocalStorage();
}

async function updateLocalStorage() {
  await Preferences.set({
    key: KEY,
    value: JSON.stringify(todoList.value),
  });
}
</script>
<style scoped>
ion-button {
  --padding-end: 0;
  --padding-start: 0;
}
</style>
