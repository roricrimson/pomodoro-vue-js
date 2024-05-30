<template>
  <div>
    <input type="text" v-model="props.name" ref="gesture" />
    <ion-button fill="clear" @click="emits('update')"
      ><ion-icon slot="icon-only" :icon="checkmark"></ion-icon
    ></ion-button>
    <ion-button fill="clear" @click="emits('delete')"
      ><ion-icon slot="icon-only" :icon="close"></ion-icon
    ></ion-button>
  </div>
</template>
<script setup lang="ts">
import { IonIcon, IonButton, createGesture } from "@ionic/vue";
import { close, checkmark } from "ionicons/icons";
import { Ref, computed, onMounted, ref, toValue } from "vue";

const props = defineProps<{
  name?: string;
  checked?: boolean;
}>();
const emits = defineEmits(["toggleCheck", "update", "delete"]);

const gesture = ref<any>(null);

onMounted(() => {
  if (gesture.value) {
    const swipe = createGesture({
      direction: "x",
      threshold: 100,
      el: gesture.value,
      onMove: (ev) => {
        if (Math.sign(ev.deltaX) == 1) {
          emits("toggleCheck", false);
        } else if (Math.sign(ev.deltaX) == -1) {
          emits("toggleCheck", true);
        }
      },
      gestureName: "example",
    });
    swipe.enable();
  }
});
</script>
<style scoped>
input{
background-color: transparent;
}

input[type="text"]{
  background-color: transparent;
}
</style>