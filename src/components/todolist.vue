<template>
  <div
    class="bg-[#CAD7C5] m-4 mt-8 p-6 pb-8 rounded-3xl shadow-md shadow-[#989E8E] relative"
  >
    <div class="spiral-pin absolute -top-[11px] left-0 right-0 flex gap-1 px-6">
      <span
        v-for="item in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12]"
        class="block rounded-full flex-1 aspect-square border-4 border-[#828E80]"
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

    <div style="border-bottom: 1px solid #828e80" class="flex justify-between">
      <textarea
        v-model="notes"
        @input="adjustHeight"
        ref="autosizeTextarea"
        rows="1"
        @keyup.enter="addItem()"
        placeholder="Tap to write"
      ></textarea>

      <ion-button fill="clear" @click="addItem()"
        ><ion-icon
          class="text-[#828E80]"
          slot="icon-only"
          :icon="add"
        ></ion-icon
      ></ion-button>
    </div>

    <div
      style="border-bottom: 1px solid #828e80"
      class="w-[100%] h-11"
      v-if="todoList.length <= 2"
    ></div>
    <div
      style="border-bottom: 1px solid #828e80"
      class="w-[100%] h-11"
      v-if="todoList.length <= 1"
    ></div>
    <div
      style="border-bottom: 1px solid #828e80"
      class="w-[100%] h-11"
      v-if="todoList.length === 0"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon, IonButton } from "@ionic/vue";
import { add } from "ionicons/icons";
import { computed, ref, onMounted, toValue } from "vue";
import { Preferences } from "@capacitor/preferences";
import todoItem from "../components/TodoItem.vue";

const KEY = "TodoList";

const todoList = ref<any[]>([]);

const notes = ref("");

load();

onMounted(() => {
  adjustHeight();
});
async function load() {
  const result = await Preferences.get({ key: KEY });
  if (result.value) {
    todoList.value = JSON.parse(result.value);
  }
}
const autosizeTextarea = ref<any>(null);
function adjustHeight() {
  const textarea = autosizeTextarea.value;
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
}

function addItem() {
  if (notes.value !== "") {
    todoList.value.push({
      id: new Date().getTime(),
      name: notes.value,
      checked: false,
    });
    notes.value = "";
    autosizeTextarea.value.style.height = `44px`;

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

textarea {
  background-color: transparent;
  color: #828e80;
  resize: none;
  overflow: hidden;
  min-height: 44px;
  width: 75%;
  padding: 10px 0;
}

textarea:focus {
  outline: none;
}
textarea::placeholder {
  color: #999c89;
  font-size: 15px;
}

ion-button {
  --padding-end: 0;
  --padding-start: 0;
}
</style>
