<template>
<v-card class="mt-3 mx-auto" max-width="500">
  <v-card-title primary-title>
    <div>
      <h3 class="headline">Game D3VICES</h3>
    </div>
  </v-card-title>
  <game-device-list
    :iDevs="iDevs"
  ></game-device-list>
</v-card>
</template>

<script>
  import GameDeviceList from './GameDeviceList/GameDeviceList';
  export default {
    name: 'GameDevices',
    components: {
      GameDeviceList
    },
    props: {
      iDevs: {
        type: Array,
        required: true
      }
    }
  }
</script>

<style>
</style>
