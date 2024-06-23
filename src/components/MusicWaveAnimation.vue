<script setup lang="ts">
defineProps(["play"]);
</script>
<template>
  <div class="music" :class="{ animated: play }">
    <div class="bar"></div>
    <div class="bar"></div>
    <div class="bar"></div>
    <div class="bar"></div>
    <div class="bar"></div>
    <div class="bar"></div>
    <div class="bar"></div>
    <div class="bar"></div>
    <div class="bar"></div>
    <div class="bar"></div>
  </div>
</template>
<style scoped>
.music {
    width: 100%;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
}
.music .bar {
  width: 10px;
  border-radius: 10px;
  background: white;
  height: 2px;
}

.music.animated .bar {
  animation: loader 1.5s ease-in-out infinite;
}

@keyframes loader {
  0%,
  100% {
    height: 5px;
  }

  50% {
    height: 20px;
  }
}

.music .bar:nth-child(1) {
  background: #CAD7C5;
  animation-delay: 1s;
}

.music .bar:nth-child(2) {
  background: #C6C8BD;
  animation-delay: 0.8s;
}

.music .bar:nth-child(3) {
  background: #B4B7A3;
  animation-delay: 0.6s;
}

.music .bar:nth-child(4) {
  background: #999C89;
  animation-delay: 0.4s;
}

.music .bar:nth-child(5) {
  background: #7F8579;
  animation-delay: 0.2s;
}

.music .bar:nth-child(6) {
  background: #7F8579;
  animation-delay: 0.2s;
}

.music .bar:nth-child(7) {
  background: #999C89;
  animation-delay: 0.4s;
}

.music .bar:nth-child(8) {
  background: #B4B7A3;
  animation-delay: 0.6s;
}

.music .bar:nth-child(9) {
  background: #C6C8BD;
  animation-delay: 0.8s;
}

.music .bar:nth-child(10) {
  background: #CAD7C5;
  animation-delay: 1s;
}
</style>
