<template>
<v-container grid-list-lg>
  <v-layout column>
    <h2>Virtual Control Point</h2>
    <p>Select the control point that this virtual control point will represent.</p>
  </v-layout>

  <v-layout column>
    <doom-alert level="info" v-if="devices.length < 1">
      No D3VICES have been added. Please add some on the <router-link to="/d3vices">D3VICES Page</router-link>
    </doom-alert>
    <control-point v-for="d in devices" v-bind:key="d._id" v-bind:_id="d._id" v-bind:controllingTeam="d.controllingTeam" v-bind:createdAt="d.createdAt" v-bind:did="d.did" v-bind:redProgress="d.redProgress" v-bind:bluProgress="d.bluProgress"
      v-bind:patchDevice="patchDevice" v-bind:getDevice="getDevice" v-bind:createTimelineEvent="createTimelineEvent"></control-point>
  </v-layout>
</v-container>
</template>

<script>
import ControlPoint from './ControlPoint.vue'
import {
  mapState,
  mapGetters,
  mapActions
} from 'vuex'
import DoomAlert from '@/components/DoomAlert/DoomAlert';

export default {
  name: 'ControlPointList',
  components: {
    DoomAlert,
    ControlPoint
  },
  data() {
    return {
      placeholder: 'PLACEHOLDER',
      test: 'hi',
      selection: {},
      isFullscreen: false
    }
  },
  methods: {
    ...mapActions('devices', {
      getDevice: 'get',
      patchDevice: 'patch',
      removeDevice: 'remove',
      findDevices: 'find'
    }),
    ...mapActions('timeline', {
      createTimelineEvent: 'create'
    }),
    toggleFullscreen() {
      console.log(`toggling full screen. was=${this.isFullscreen} now=${!this.isFullscreen}`)
      this.isFullscreen = !this.isFullscreen
    },

  },
  computed: {
    isDeviceSelected() {
      console.log(typeof this.selection.did)
      var is = typeof this.selection.did === 'undefined' ? false : true
      console.log(`isDeviceSelected=${is}`)
      return is
    },
    ...mapState('devices',
      'devices'
    ),
    ...mapGetters('devices', {
      findDevicesInStore: 'find'
    }),
    devices() {
      return this.findDevicesInStore({
        query: {
          $sort: {
            createdAt: 1
          }
        }
      }).data
    },
  },
  created() {
    this.findDevices();
  }
}
</script>

<style>
.invis {
  display: none;
}
.whitelink {
  color: white;
}
</style>
