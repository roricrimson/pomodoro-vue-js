<template>
  <div class="py-2 has-active:bg-[#d3ddce] transition-colors" style="border-bottom: 1px solid #828e80">
    <!-- Display mode -->
    <div class="flex items-start gap-2" v-if="!isEditing">
      <p
        :class="{ 'line-through text-opacity-80': checked }"
        class="text-[#828e80] flex-1 break-all font-patrick-hand decoration-2 active:bg-[#d3ddce] transition-colors"
        @click="$emit('toggleCheck', !checked)"
      >
        {{ name }}
      </p>
      <button
        class="w-6 aspect-square"
        @click="showContextMenu = { isOpen: true, event: $event }"
        type="button"
      >
        <ion-icon class="text-[#828E80]" :icon="ellipsisHorizontal"></ion-icon>
      </button>
    </div>
    
    <!-- Edit mode -->
    <form
      class="flex items-start gap-2"
      @submit.prevent="handleSubmit"
      v-if="isEditing"
    >
      <input
        ref="inputRef"
        class="bg-transparent text-[#828e80] flex-1 focus:outline-hidden"
        :value="name"
      />
      <button class="w-6 aspect-square" type="submit">
        <ion-icon class="text-[#828E80] text-xl" :icon="checkmark"></ion-icon>
      </button>
    </form>

    <!-- Context menu -->
    <ion-popover
      :is-open="showContextMenu.isOpen"
      :event="showContextMenu.event"
      reference="event"
      :show-backdrop="false"
      @did-dismiss="showContextMenu = { isOpen: false, event: null }"
    >
      <ion-content>
        <ul class="p-2 flex flex-col gap-2">
          <li>
            <button
              class="text-[#828E80] active:text-[#9ba799]"
              @click="startEditing"
            >
              <ion-icon :icon="create"></ion-icon>
              Edit
            </button>
          </li>
          <li>
            <button
              class="text-[#828E80] active:text-[#9ba799]"
              @click="handleDelete"
            >
              <ion-icon :icon="trash"></ion-icon>
              Delete
            </button>
          </li>
        </ul>
      </ion-content>
    </ion-popover>
  </div>
</template>

<script setup lang="ts">
import { IonIcon, IonContent, IonPopover } from "@ionic/vue";
import { checkmark, ellipsisHorizontal, create, trash } from "ionicons/icons";
import { ref, nextTick } from "vue";

interface Props {
  id: number;
  name: string;
  checked: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  toggleCheck: [checked: boolean];
  delete: [];
  'update:name': [name: string];
  update: [];
}>();

const inputRef = ref<HTMLInputElement | null>(null);
const isEditing = ref(false);
const showContextMenu = ref<{
  isOpen: boolean;
  event: Event | null;
}>({
  isOpen: false,
  event: null,
});

async function startEditing() {
  showContextMenu.value = { isOpen: false, event: null };
  await nextTick();
  isEditing.value = true;
  await nextTick();
  inputRef.value?.focus();
}

function handleDelete() {
  showContextMenu.value = { isOpen: false, event: null };
  emit('delete');
}

function handleSubmit() {
  const newName = inputRef.value?.value?.trim() || '';
  emit('update:name', newName);
  emit('update');
  isEditing.value = false;
}
</script>

<style scoped>
ion-popover {
  --width: 100px;
}
ion-popover::part(content) {
  border-radius: 0.3rem;
}
ion-content {
  --background: #cad7c5;
  --width: 100px;
}
ion-button {
  --padding-end: 0;
  --padding-start: 0;
}
</style>
