<template>
<div>
  <v-list>
    <v-list-group v-for="d in iDevs" :key="d._id">
      <v-list-tile slot="activator">
        <v-list-tile-content>
          <v-container class="pa-0">
          <v-layout row align-center justify-start fill-height>
            <v-flex>
              <v-list-tile-title>{{ d.did }}</v-list-tile-title>
            </v-flex>

            <v-flex>
              <v-progress-circular :value="100" color="blue">{{ bluValue }}</v-progress-circular>
            </v-flex>
            <v-flex>
              <v-progress-circular :value="50" color="red">{{ redValue }}</v-progress-circular>
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

              <v-btn icon color="blue">
                <v-icon>star</v-icon>
              </v-btn>
              <v-btn icon color="red">
                <v-icon>star</v-icon>
              </v-btn>
              <v-btn icon color="grey">
                <v-icon>star</v-icon>
              </v-btn>
              <v-btn icon color="green">
                <v-icon>gps_fixed</v-icon>
              </v-btn>

            </v-layout>
          </v-container>
        </v-list-tile-content>
      </v-list-tile>


    </v-list-group>
  </v-list>

  <!-- <v-list>
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

            <v-flex>
              <v-progress-circular :value="100" color="blue">{{ bluValue }}</v-progress-circular>
            </v-flex>
            <v-flex>
              <v-progress-circular :value="50" color="red">{{ redValue }}</v-progress-circular>
            </v-flex>

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

          </v-layout>
        </v-list-tile-action>

      </v-list-tile>
    </v-list>
  </v-list> -->
</div>
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
  data() {
    return {
      redValue: 0,
      bluValue: 50
    }
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
