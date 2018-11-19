<template>
    <v-container grid-list-lg>
        <v-layout row>
            <h2>Control Point</h2>
        </v-layout>
        <v-flex xs12 sm12 d-flex>
          <v-select
            :items="devices"
            item-text="did"
            label="Select a D3VICE"
            box
            v-model="selection"
          ></v-select>
          <v-btn
            :class="{'invisible': !isDeviceSelected}"
            color="primary"
            @click="toggleFullscreen"
          >
              Fullscreen
          </v-btn>
        </v-flex>
        <v-layout row wrap>
            <control-point
                v-bind:key="selection._id"
                v-bind:_id="selection._id"
                v-bind:did="selection.did"
                v-bind:location="selection.location"
                v-bind:latLng="selection.latLng"
                v-bind:createdAt="selection.createdAt"
                v-bind:controllingTeam="selection.controllingTeam"
                v-bind:bluProgress="selection.bluProgress"
                v-bind:redProgress="selection.redProgress"
                v-bind:image="selection.image"
                v-bind:patchDevice="patchDevice"
                v-bind:removeDevice="removeDevice"
                v-bind:createTimelineEvent="createTimelineEvent"
                v-bind:isFullscreen="isFullscreen"
                v-bind:toggleFullscreen="toggleFullscreen"
                v-bind:isDeviceSelected="isDeviceSelected"
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
        name: 'ControlPointContainer',
        data () {
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
            }
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
        created () {
            this.findDevices();
        }
    }
</script>

<style scoped>
.invisible {
  display: none;
}
</style>
