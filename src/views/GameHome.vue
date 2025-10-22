<template>
  <div class="game-home">
    <PanoramaMap 
      v-if="!currentLocation"
      @enterLocation="handleEnterLocation"
    />
    <LocationExploration
      v-else
      :location="currentLocation"
      @backToMap="handleBackToMap"
      @locationCompleted="handleLocationCompleted"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PanoramaMap from '../components/game/PanoramaMap.vue'
import LocationExploration from '../components/game/LocationExploration.vue'

const currentLocation = ref(null)

const handleEnterLocation = (location) => {
  currentLocation.value = location
}

const handleBackToMap = () => {
  currentLocation.value = null
}

const handleLocationCompleted = (location) => {
  console.log(`完成地点: ${location.name}`)
  currentLocation.value = null
}
</script>

<style scoped>
.game-home {
  height: 100vh;
  overflow: hidden;
}
</style>