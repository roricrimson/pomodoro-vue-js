<template>
  <div class="flex relative" style="border-bottom: 1px solid black">
    <input
      class="w-[75%]"
      type="text"
      :value="name"
      @input="$emit('update:name', $event.target.value)"
      ref="gesture"
      @focus="isFocused = true"
      @blur="isFocused = false"
    />
    <div class="flex w-[25%] items-end justify-end">
      <ion-button fill="clear" @click="emits('update')" v-if="isFocused"
        ><ion-icon
          class="text-black"
          slot="icon-only"
          :icon="checkmark"
        ></ion-icon
      ></ion-button>
      <ion-button fill="clear" @click="emits('delete')"
        ><ion-icon class="text-black" slot="icon-only" :icon="close"></ion-icon
      ></ion-button>
    </div>

    <div
      class="absolute h-[2px] bg-black top-[50%] left-[-5px] w-0 transition-all"
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

const isFocused = ref(false);

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
        console.log(props.checked);
      },
      gestureName: "example",
    });
    swipe.enable();
  }
});
</script>
<style scoped>
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

.checked {
  width: 75%;
}
</style>
