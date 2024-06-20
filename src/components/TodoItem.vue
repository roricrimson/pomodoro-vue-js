<template>
  <div
    class="flex relative justify-between"
    style="border-bottom: 1px solid #828e80"
  >
    <!-- @input="" -->
    <textarea
      :value="name"
      @input="adjustHeight($event)"
      ref="gesture"
      rows="1"
      @keyup.enter="emits('toggleCheck')"
    ></textarea>
    <div class="flex w-[25%] justify-end">
      <ion-button
        fill="clear"
        @click="emits('update'), (isInputChange = false)"
        v-if="isInputChange"
        ><ion-icon
          class="text-[#828E80]"
          slot="icon-only"
          :icon="checkmark"
        ></ion-icon
      ></ion-button>
      <ion-button fill="clear" @click="emits('delete')"
        ><ion-icon
          class="text-[#828E80]"
          slot="icon-only"
          :icon="close"
        ></ion-icon
      ></ion-button>
    </div>

    <div
      class="absolute h-[2px] bg-[#828E80] top-[50%] left-[-5px] w-0 transition-all"
      :class="{ checked: props.checked }"
    ></div>
  </div>
</template>
<script setup lang="ts">
import { IonIcon, IonButton, createGesture } from "@ionic/vue";
import { close, checkmark } from "ionicons/icons";
import { Ref, computed, onMounted, ref, toValue, defineModel } from "vue";

const props = defineProps<{
  name?: any;
  checked?: boolean;
}>();
const emits = defineEmits(["toggleCheck", "update", "delete", "update:name"]);

const gesture = ref<any>(null);

const isInputChange = ref(false);

onMounted(() => {
  if (gesture.value) {
    const swipe = createGesture({
      direction: "x",
      threshold: 100,
      el: gesture.value,
      onMove: (ev) => {
        if (Math.sign(ev.deltaX) == 1) {
          emits("toggleCheck", true);
        } else if (Math.sign(ev.deltaX) == -1) {
          emits("toggleCheck", false);
        }
      },
      gestureName: "example",
    });
    swipe.enable();
    const textarea = gesture.value;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }
});

function adjustHeight(event: any) {
  const textarea = gesture.value;
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;

  emits("update:name", event.target.value);
  isInputChange.value = true;
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
ion-button {
  --padding-end: 0;
  --padding-start: 0;
}

.checked {
  width: 75%;
}
</style>
