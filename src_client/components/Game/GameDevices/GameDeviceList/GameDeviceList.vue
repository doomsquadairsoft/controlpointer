<template>
<div>
  <v-list>
    <v-list-group v-for="d in iDevs" :key="d._id">
      <v-container class="pa-2">
        <v-layout column>
          <v-flex>ID: {{ d._id }}</v-flex>
          <v-flex>Lat: {{ d.latLng.lat }}</v-flex>
          <v-flex>Lng: {{ d.latLng.lng }}</v-flex>
          <v-flex>Associated Games: {{ d.associatedGames }}</v-flex>
        </v-layout>
      </v-container>
      <v-list-tile slot="activator">
        <v-list-tile-content>
          <v-container class="pa-0">
            <v-layout row align-center justify-start fill-height>
              <v-flex>
                <v-list-tile-title>{{ d.did }}</v-list-tile-title>
              </v-flex>

              <v-flex>
                <v-progress-circular :value="d.bluProgress" color="blue">{{ d.bluProgress }}</v-progress-circular>
              </v-flex>
              <v-flex>
                <v-progress-circular :value="d.redProgress" color="red">{{ d.redProgress }}</v-progress-circular>
              </v-flex>

              <v-flex>
                <v-badge right>
                  <v-icon large color="grey lighten-1">
                    signal_wifi_off
                  </v-icon>
                </v-badge>
              </v-flex>

              <v-flex>
                <v-badge right>
                  <v-icon large color="grey lighten-1">
                    battery_full
                  </v-icon>
                </v-badge>
              </v-flex>

            </v-layout>
          </v-container>
        </v-list-tile-content>
      </v-list-tile>

      <v-list-tile>
        <v-list-tile-content>
          <v-container>
            <v-layout row justify-center fill-height>
              <device-game-controls :myDevice="d" :gameId="myGame._id"></device-game-controls>
            </v-layout>
          </v-container>
        </v-list-tile-content>
      </v-list-tile>


    </v-list-group>
  </v-list>

</div>
</template>

<script>
// import GameDevice from './GameDevice/GameDevice';
//import R from 'ramda';
import di from '@/assets/futuristic_ammo_box_01.png'
import { cond, always, equals } from 'ramda';
import { mapActions } from 'vuex';
import DeviceGameControls from '@/components/Device/DeviceControls/DeviceGameControls';

export default {
  name: 'GameDevices',
  components: {
    DeviceGameControls
  },
  data() {
    return {
    }
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
  },
  methods: {
  }
}
</script>

<style>
</style>
