<template>
<v-card class="mt-3 mx-auto" max-width="500">
  <v-card-title primary-title>
    <div>
      <h3 class="headline">Game D3VICES</h3>
    </div>
  </v-card-title>
  <doom-alert v-if="iDevs.length < 1" level="warning">No D3vices have been associated with this game. For the best experience, create a game with at least one D3vice.</doom-alert>
  <game-device-list
    :iDevs="iDevs"
    :myGame="myGame"
  ></game-device-list>
</v-card>
</template>

<script>
  import DoomAlert from '@/components/DoomAlert/DoomAlert';
  import GameDeviceList from './GameDeviceList/GameDeviceList';
  export default {
    name: 'GameDevices',
    components: {
      GameDeviceList,
      DoomAlert
    },
    props: {
      iDevs: {
        type: Array,
        required: true
      },
      myGame: {
        type: Object,
        required: true
      }
    }
  }
</script>

<style>
</style>
