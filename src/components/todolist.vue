<template>
  <div class="bg-[#CBD2DC] m-[25px] mt-5 p-[30px] rounded-3xl highlights relative">
    <div class="spiral-pin absolute -top-[15px] left-0 right-0 flex gap-1 px-4">
      <span
        v-for="item in [1, 2, 3, 4, 5, 6, 7, 8, 9]"
        class="block rounded-full flex-1 aspect-square border-4 border-indigo-900"
      ></span>
    </div>
    <todoItem
      v-for="item in todoList"
      @toggle-check="changeCheckBox($event, item.id)"
      @delete="removeItem(item.id)"
      @update="addToLocalStorage()"
      :id="item.id"
      :checked="item.checked"
      :key="item.id"
      v-model:name="item.name"
    />
    <div style="border-bottom: 1px solid black">
      <input type="text" v-model="notes"  @keyup.enter="addItem()"/>
      <ion-button fill="clear" @click="addItem()"
        ><ion-icon class="text-black" slot="icon-only" :icon="add"></ion-icon
      ></ion-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon, IonButton } from "@ionic/vue";
import { add } from "ionicons/icons";
import { computed, ref } from "vue";
import { Preferences } from "@capacitor/preferences";
import todoItem from "../components/TodoItem.vue";

const KEY = "TodoList";

const todoList = ref<any[]>([]);

const notes = ref("");
load();
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
    addToLocalStorage();
  }
}

function removeItem(id: number) {
  todoList.value = todoList.value.filter((i) => i.id !== id);
  addToLocalStorage();
}

function changeCheckBox(isChecked: boolean, id: number) {
  todoList.value.forEach((i) => {
    if (i.id === id) {
      i.checked = isChecked;
    }
  });
  addToLocalStorage();
}

async function addToLocalStorage() {
  await Preferences.set({
    key: KEY,
    value: JSON.stringify(todoList.value),
  });
}
</script>
<style scoped>
.highlights {
  border-top: 2px solid white;
  border-left: 2px solid white;
  box-shadow: 1px 3px 3px #683a5481;
}
input {
  background-color: transparent;
}

input:focus {
  outline: none;
}

input[type="text"] {
  background-color: transparent;
}
ion-button {
  --padding-end: 0;
  --padding-start: 0;
}
</style>
