<template>
  <div>
    <v-container class="pb-3">
      <v-card>
      <doom-alert level="error" v-if="!myDevice">
        No D3VICE exists with this ID. Return to the <router-link to="/device">D3VICE List</router-link>
      </doom-alert>
      <v-container v-if="myDevice">
        <v-layout>

          <v-flex xs12 sm12 md8 lg5 xl2>

            <device-stats :deviceId="this.$route.params.deviceId"></device-stats>

            <doom-alert v-if="myDevice.associatedGames.length < 1" level="info">This D3VICE is not associated with a <router-link to="/game">game</router-link>.</doom-alert>
            <!-- <device-game-controls v-if="myDevice.associatedGames.length > 0" :myDevice="myDevice"></device-game-controls> -->
            <!-- <v-btn color="teal" :to="virtualControlpointLink">
              <v-icon>fingerprint</v-icon> Virtual Controlpoint
            </v-btn> -->
            <device-lifecycle-controls :myDevice="myDevice"></device-lifecycle-controls>

            <v-btn color="red" small fab fixed bottom right @click="VueScrollTo.scrollTo('head')">
              <v-icon>keyboard_arrow_up</v-icon>
            </v-btn>

          </v-flex>
        </v-layout>
      </v-container>
    </v-card>
    </v-container>
  </div>
</template>

<script>
import di from '@/assets/futuristic_ammo_box_01.png';
import {
  mapActions,
  mapGetters
} from 'vuex';
import { propEq, find } from 'ramda';
import DeviceStats from './DeviceStats/DeviceStats';
import DeviceGameControls from '@/components/Device/DeviceControls/DeviceGameControls';
import DeviceLifecycleControls from '@/components/Device/DeviceControls/DeviceLifecycleControls';
import DoomAlert from '@/components/DoomAlert/DoomAlert';
import VueScrollTo from 'vue-scrollto';


export default {
  name: 'device',
  components: {
    DoomAlert,
    DeviceStats,
    DeviceGameControls,
    DeviceLifecycleControls,
  },
  props: {},
  data: () => ({
    editMode: false,
    menu: 0,
    deletable: 0,
    lastCap: '',
    takeDown: true
  }),
  computed: {
    ...mapGetters('devices', {
      findDevicesInStore: 'find'
    }),
    virtualControlpointLink() {
      return `/device/${this.myDevice._id}/controlpoint`;
    },
    deviceImage: () => di,
    controllingColor() {
      if (this.bluProgress < 100 && this.redProgress < 100) {
        return 'grey';
      } else if (this.redProgress >= 100 && this.bluProgress === 0) {
        return 'red';
      } else if (this.bluProgress >= 100 && this.redProgress === 0) {
        return 'blue';
      }
    },
    controlledByTeam() {
      if (this.bluProgress < 100 && this.redProgress < 100) {
        return 'Uncontrolled';
      } else if (this.redProgress >= 100 && this.bluProgress === 0) {
        return 'Controlled by Red Team';
      } else if (this.bluProgress >= 100 && this.redProgress === 0) {
        return 'Controlled by Blu Team';
      }
    },
    myDevice() {
      const deviceIdViaRoute = this.$route.params.deviceId;
      return this.findDevicesInStore({
        query: {
          $sort: {
            createdAt: 1
          },
          _id: deviceIdViaRoute
        }
      }).data[0];
    },
  },
  methods: {
    ...mapActions('devices', {
      findDevices: 'find',
      removeDevice: 'remove',
      patchDevice: 'patch',
    }),
    ...mapActions('timeline', {
      createTimelineEvent: 'create',
    }),
    changeControllingTeamBlue: function() {
      this.patchDevice([
        this._id, {
          bluProgress: 100,
          redProgress: 0
        }, {}
      ]);
      this.createTimelineEvent({
          type: "timeline",
          action: "cap_blu",
          source: "admin",
          target: this.myDevice.did
        }, {});
      //this.patchDevice([this._id, {bluProgress: 100, redProgress: 0}, undefined])
    },
    changeControllingTeamRed: function() {
      this.patchDevice([
        this._id, {
          bluProgress: 0,
          redProgress: 100
        }, {}
      ]);
      this.createTimelineEvent({
          type: "timeline",
          action: "cap_red",
          source: "admin",
          target: this.myDevice.did
        }, {});
      //this.patchDevice([this._id, {redProgress: 100, bluProgress: 0}, undefined])
    },
    changeControllingTeamUnc: function() {
      this.patchDevice([
        this._id, {
          bluProgress: 0,
          redProgress: 0
        }, {}
      ]);
      this.createTimelineEvent({
          type: "timeline",
          action: "cap_unc",
          source: "admin",
          target: this.myDevice.did
        }, {});
      //this.patchDevice([this._id, {redProgress: 0, bluProgress: 0}, undefined])
    },
    deleteDevice: function() {
      if (this.deletable) {
        this.removeDevice(this._id);
      }
    },
    showEditor: function() {
      this.editMode = !this.editMode
      this.menu = false
    },
    setPositionOnMap: function() {
      dispatch('setPositionOnMap')
    }
  },
  created() {
    this.findDevices();
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.icon {
  height: 1em;
}

h3 {
  margin: 40px 0 0;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #1aafffcc;
}
</style>
