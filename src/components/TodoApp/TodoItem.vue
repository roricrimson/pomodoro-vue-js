<template>
  <div class="py-2 has-[:active]:bg-[#d3ddce] transition-colors" style="border-bottom: 1px solid #828e80">
    <div class="flex items-start gap-2 " v-if="!isEditing">
      <p
        :class="{ 'line-through text-opacity-80': checked }"
        class="text-[#828e80] flex-1 break-all font-patrick-hand decoration-2 active:bg-[#d3ddce] transition-colors"
        @click="emits('toggleCheck', !checked)"
      >
        {{ name }}
      </p>
      <button
        class="w-6 aspect-square"
        @click="showPopover = { isOpen: true, event: $event }"
        type="button"
      >
        <ion-icon class="text-[#828E80]" :icon="ellipsisHorizontal"></ion-icon>
      </button>
    </div>
    <form
      class="flex items-start gap-2"
      @submit.prevent="onSubmit"
      v-if="isEditing"
    >
      <input
        ref="input"
        class="bg-transparent text-[#828e80] flex-1 focus:outline-none"
        :value="name"
      />
      <button class="w-6 aspect-square" type="submit">
        <ion-icon class="text-[#828E80] text-xl" :icon="checkmark"></ion-icon>
      </button>
    </form>

    <ion-popover
      :isOpen="showPopover.isOpen"
      :event="showPopover.event"
      reference="event"
      :show-backdrop="false"
      @didDismiss="showPopover = { isOpen: false, event: null }"
    >
      <ion-content>
        <ul class="p-2 flex flex-col gap-2">
          <li>
            <button
              class="text-[#828E80] active:text-[#9ba799]"
              @click="onEdit"
            >
              <ion-icon :icon="create"></ion-icon>
              Edit
            </button>
          </li>
          <li>
            <button
              class="text-[#828E80] active:text-[#9ba799]"
              @click="onDelete"
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
import { ref } from "vue";

defineProps<{
  id: any;
  name?: any;
  checked?: boolean;
}>();
const emits = defineEmits(["toggleCheck", "delete", "update:name", "update"]);
const input = ref<any>(null);
const isEditing = ref(false);
const showPopover = ref<any>({
  isOpen: false,
  event: null,
});
function onEdit() {
  showPopover.value = { isOpen: false, event: null };
  setTimeout(() => {
    isEditing.value = true;
  });
  setTimeout(() => {
    input.value?.focus();
  }, 500);
}

function onDelete() {
  showPopover.value = { isOpen: false, event: null };
  setTimeout(() => {
    emits("delete");
  });
}

function onSubmit() {
  emits("update:name", input.value?.value);
  emits("update");
  setTimeout(() => {
    isEditing.value = false;
  });
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
