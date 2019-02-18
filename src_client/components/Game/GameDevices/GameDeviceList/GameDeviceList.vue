<template>
  <v-container class="pa-0 ma-0">
    <v-list>
      <v-list-group v-for="d in iDevs" :key="d._id">
        <v-list-tile slot="activator">
          <v-list-tile-content>
            <v-container class="pa-0">
              <game-device-header :myDevice="d" :myGame="myGame"></game-device-header>
            </v-container>
          </v-list-tile-content>
        </v-list-tile>
        <game-device :myDevice="d" :myGame="myGame"></game-device>
      </v-list-group>
    </v-list>
  </v-container>
</template>

<script>
// import GameDevice from './GameDevice/GameDevice';
//import R from 'ramda';
import di from '@/assets/futuristic_ammo_box_01.png';

import {
  cond,
  always,
  equals
} from 'ramda';
import {
  mapActions
} from 'vuex';
import GameDevice from './GameDevice/GameDevice';
import GameDeviceHeader from './GameDeviceHeader/GameDeviceHeader';


export default {
  name: 'GameDevices',
  components: {
    GameDevice,
    GameDeviceHeader,
  },
  data() {
    return {}
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
  },
  computed: {
    deviceImage: () => di,
    batteryColor() {
      return "green"
    }
  },
  methods: {

  }
}
</script>

<style>
</style>
