<template>
  <div class="DeviceControls">
    <v-btn icon color="blue" @click="changeControllingTeam('blu')">
      <v-icon>star</v-icon>
    </v-btn>
    <v-btn icon color="red" @click="changeControllingTeam('red')">
      <v-icon>star</v-icon>
    </v-btn>
    <v-btn icon color="grey" @click="changeControllingTeam('unc')">
      <v-icon>star</v-icon>
    </v-btn>
    <v-btn icon color="green" @click="showDeviceLocation(_id)">
      <v-icon>gps_fixed</v-icon>
    </v-btn>
    <v-btn icon color="purple" @click="showDeviceEditor(_id)">
      <v-icon>edit</v-icon>
    </v-btn>
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
    // myGame() {
    //   const deviceIdViaRoute = this.$route.params.deviceId;
    //
    //   return this.findGameInStore({
    //     query: {
    //       $sort: {
    //         createdAt: 1
    //       },
    //       _id:
    //     }
    //   }).data[0];
    // }
  },
  methods: {
    ...mapActions('timeline', {
      createTimelineEvent: 'create'
    }),
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
</style>
