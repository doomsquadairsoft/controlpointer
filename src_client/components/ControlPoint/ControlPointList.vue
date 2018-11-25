<template>
<v-container grid-list-lg>
  <v-layout column>
    <h2>Virtual Control Point</h2>
    <p>Select the control point that this virtual control point will represent.</p>
  </v-layout>

  <v-layout column>
    <control-point
      v-for="d in devices"
      v-bind:key="d._id"
      v-bind:controllingTeam="d.controllingTeam"
      v-bind:createdAt="d.createdAt"
      v-bind:did="d.did"
      v-bind:redProgress="d.redProgress"
      v-bind:bluProgress="d.bluProgress"
      v-bind:patchDevice="patchDevice"
      v-bind:getDevice="getDevice"
      v-bind:createTimelineEvent="createTimelineEvent"
    ></control-point>
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

export default {
  name: 'ControlPointList',
  data() {
    return {
      placeholder: 'PLACEHOLDER',
      test: 'hi',
      selection: {},
      isFullscreen: false
    }
  },
  components: {
    ControlPoint
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

<style scoped>
.invis {
  display: none;
}
</style>
