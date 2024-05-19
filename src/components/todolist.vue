<template>
  <div class="todolist">
    <div v-for="object in todoList">
      <div>
        <ion-button fill="clear">
          <ion-icon
            slot="icon-only"
            :icon="squareOutline"
            v-if="!object.checked"
          ></ion-icon>
          <ion-icon slot="icon-only" :icon="checkboxOutline" v-else></ion-icon
        ></ion-button>

        <input type="text" v-model="object.name.value" class="bg-white" />
        <ion-button fill="clear"
          ><ion-icon slot="icon-only" :icon="close"></ion-icon
        ></ion-button>
      </div>
    </div>
    <div>
      <input type="text" class="bg-white" />
      <ion-button fill="clear"
        ><ion-icon slot="icon-only" :icon="add"></ion-icon
      ></ion-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon, IonButton } from "@ionic/vue";
import { squareOutline, checkboxOutline, close, add } from "ionicons/icons";
import { computed, ref, watch } from "vue";
import { Preferences } from "@capacitor/preferences";

var todoList = [{ id: 3, name: ref("something"), checked: false }];
</script>
