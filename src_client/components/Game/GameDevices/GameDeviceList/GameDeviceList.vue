<template>
<div>
  <v-list>
    <v-list-group v-for="d in iDevs" :key="d._id">
      <v-container class="pa-2">
        <v-layout column>
          <v-flex>ID: {{ d._id }}</v-flex>
          <v-flex>Lat: {{ d.latLng.lat }}</v-flex>
          <v-flex>Lon: {{ d.latLng.lng }}</v-flex>
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

              <v-btn icon color="blue" @click="changeControllingTeam(d, 'blu')">
                <v-icon>star</v-icon>
              </v-btn>
              <v-btn icon color="red" @click="changeControllingTeam(d, 'red')">
                <v-icon>star</v-icon>
              </v-btn>
              <v-btn icon color="grey" @click="changeControllingTeam(d, 'unc')">
                <v-icon>star</v-icon>
              </v-btn>
              <v-btn icon color="green" @click="showDeviceLocation(d._id)">
                <v-icon>gps_fixed</v-icon>
              </v-btn>

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

export default {
  name: 'GameDevices',
  components: {
    // GameDevice
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
    controllingTeam() {

    }
  },
  methods: {
    ...mapActions('timeline', {
        createTimelineEvent: 'create'
    }),
    changeControllingTeam: function(device, color) {
      if (typeof device === 'undefined') throw new Error('first param sent to changeControllingTeam must be the device object. Got undefined.');
      if (typeof color === 'undefined') throw new Error('second param sent to changeControllingTeam must be (red|blu|unc). Got undefined.');
      const c = cond([
        [equals('blu'), always('cap_blu')],
        [equals('red'), always('cap_red')],
        [equals('unc'), always('cap_unc')],
      ])(color);

      this.createTimelineEvent({
        type: "timeline",
        action: c,
        source: "admin",
        target: device.did,
        targetId: device._id,
        gameId: this.myGame._id
      }, {});
    },
    showDeviceLocation: function(deviceId) {
      const address = `/game/${this.myGame._id}/map/${deviceId}`;
      console.log(address);
      this.$router.push(address);
    },
  }
}
</script>

<style>
</style>
