<template>
  <div class="DeviceControls">
    <v-container mt-2 mb-4 pa-0 style="width:100%;">
      <v-layout row wrap text-xs-center>
        <v-flex>
          <v-btn icon color="cyan" @click="goToVirtualControlpoint()">
            <v-icon>fingerprint</v-icon>
          </v-btn>
        </v-flex>
        <v-flex justify-center>
          <v-btn icon color="blue" @click="changeControllingTeam('blu')">
            <v-icon>star</v-icon>
          </v-btn>
        </v-flex>
        <v-flex>
          <v-btn icon color="red" @click="changeControllingTeam('red')">
            <v-icon>star</v-icon>
          </v-btn>
        </v-flex>
        <v-flex>
          <v-btn icon color="grey" @click="changeControllingTeam('unc')">
            <v-icon>star</v-icon>
          </v-btn>
        </v-flex>
        <v-flex>
          <v-btn icon color="green" @click="showDeviceLocation(_id)">
            <v-icon>gps_fixed</v-icon>
          </v-btn>
        </v-flex>
        <v-flex>
          <v-btn icon color="purple" @click="showDeviceEditor(_id)">
            <v-icon>edit</v-icon>
          </v-btn>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import {
  mapActions,
  mapGetters
} from 'vuex';
import { cond, equals, always } from 'ramda';

export default {
  name: 'DeviceGameControls',
  props: {
    myDevice: {
      type: Object,
      required: true,
    },
    gameId: {
      type: String,
      required: false,
    }
  },
  computed: {
    ...mapGetters('game', {
      findGameInStore: 'find'
    }),
    did() {
      return this.myDevice.did
    },
    createdAt() {
      return this.myDevice.createdAt
    },
    lat() {
      return this.myDevice.latLng.lat
    },
    lng() {
      return this.myDevice.latLng.lng
    },
    _id() {
      return this.myDevice._id
    },
    associatedGames() {
      return this.myDevice.associatedGames
    },
    virtualControlpointLink() {
      return `/device/${this._id}/controlpoint`;
    },
  },
  methods: {
    ...mapActions('timeline', {
      createTimelineEvent: 'create'
    }),
    goToVirtualControlpoint() {
      this.$router.push({
        path: this.virtualControlpointLink
      });
    },
    changeControllingTeam: function(color) {
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
        target: this.did,
        targetId: this._id,
        gameId: this.gameId,
      }, {});
    },
    showDeviceLocation: function(deviceId) {
      const address = `/map/${this.gameId}`;
      const q = {
        deviceId: deviceId
      };
      this.$router.push({
        path: address,
        query: q
      });
    },
    showDeviceEditor: function(deviceId) {
      const address = `/device/${deviceId}`;
      const q = {
        edit: 1
      };
      this.$router.push({
        path: address,
        query: q
      });
    },

  }
}
</script>

<style>
.DeviceControls {

}
</style>
