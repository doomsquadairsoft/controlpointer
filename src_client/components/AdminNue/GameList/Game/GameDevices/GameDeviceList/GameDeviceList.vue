<template>
<v-list>
  <v-list>
    <v-list-tile v-for="d in iDevs" :key="d._id" avatar>

      <v-list-tile-avatar>
        <img :src="deviceImage"></img>
      </v-list-tile-avatar>

      <v-list-tile-content>
        <v-list-tile-title>{{ d.did }}</v-list-tile-title>
      </v-list-tile-content>

      <v-list-tile-action>
        <v-layout row>
          <v-badge right>
            <v-icon large color="blue lighten-1">
              star
            </v-icon>
          </v-badge>
          <v-badge right>
            <v-icon large color="grey lighten-1">
              gps_fixed
            </v-icon>
          </v-badge>
          <v-badge right>
            <v-icon large color="grey lighten-1">
              signal_wifi_off
            </v-icon>
          </v-badge>
          <v-badge right>
            <v-icon large color="grey lighten-1">
              battery_full
            </v-icon>
          </v-badge>
          <v-badge right>
            <v-icon large color="grey lighten-1">
              edit
            </v-icon>
          </v-badge>
        </v-layout>
      </v-list-tile-action>

    </v-list-tile>
  </v-list>
</v-list>
</template>

<script>
// import GameDevice from './GameDevice/GameDevice';
//import R from 'ramda';
import di from '@/assets/futuristic_ammo_box_01.png'


export default {
  name: 'GameDevices',
  components: {
    // GameDevice
  },
  props: {
    iDevs: {
      type: Array,
      required: true
    }
  },
  computed: {
    deviceImage: () => di,
    controllingTeam() {

    }
  },
}
</script>

<style>
</style>
