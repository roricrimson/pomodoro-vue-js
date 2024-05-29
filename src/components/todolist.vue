<template>
  <div class="bg-[#CBD2DC] m-[25px] p-[30px]">
    <div v-for="object in todoList">
      <div>
        <ion-button fill="clear" @click="changeCheckBox(object.id)">
          <ion-icon
            slot="icon-only"
            :icon="squareOutline"
            v-if="!object.checked"
          ></ion-icon>
          <ion-icon slot="icon-only" :icon="checkboxOutline" v-else></ion-icon
        ></ion-button>

        <input type="text" v-model="object.name" class="bg-transparent" />
        <ion-button fill="clear" @click="addToLocalStorage()"
          ><ion-icon slot="icon-only" :icon="checkmark"></ion-icon
        ></ion-button>
        <ion-button fill="clear" @click="removeItem(object.id)"
          ><ion-icon slot="icon-only" :icon="close"></ion-icon
        ></ion-button>
      </div>
    </div>
    <div>
      <input type="text" class="bg-transparent " v-model="notes" />
      <ion-button fill="clear" @click="addItem()"
        ><ion-icon slot="icon-only" :icon="add"></ion-icon
      ></ion-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon, IonButton } from "@ionic/vue";
import {
  squareOutline,
  checkboxOutline,
  close,
  add,
  checkmark,
  key,
} from "ionicons/icons";
import { computed, ref } from "vue";
import { Preferences } from "@capacitor/preferences";

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
  console.log(todoList.value);
}

function removeItem(id: number) {
  todoList.value = todoList.value.filter((i) => i.id !== id);
  addToLocalStorage();
}

function changeCheckBox(id: number) {
  todoList.value.forEach((i) => {
    if (i.id === id) {
      i.checked = !i.checked;
    }
  });
  addToLocalStorage();
  console.log(todoList.value);
}
async function addToLocalStorage() {
  await Preferences.set({
    key: KEY,
    value: JSON.stringify(todoList.value),
  });
}
</script>
