<!--
To disable context menu in responsive mode, paste this into console:
window.oncontextmenu = function() { return false; }
sauce: https://stackoverflow.com/a/46337736/1004931
(added to created function so you don't have to copy+paste it every time)
 -->


<template>
  <div class="ControlPoint">

    <v-container v-if="myDevice" class="ma-0 pa-0">
      <v-layout row>
        <div @touchstart="catchDoubleTaps" :class="{ 'fullscreen-container': isFullscreen }">
          <div class="fullscreen-header">
            <div class="stackhere">
              <v-progress-linear class="samespace" v-model="bluProgress" height="25" color="blue" background-opacity="0"></v-progress-linear>
              <v-progress-linear class="samespace flipped" v-model="redProgress" height="25" color="red" background-opacity="0"></v-progress-linear>
            </div>
            <v-progress-linear :class="{'hidden': !isBtnHeld }" :indeterminate="true" color="purple"></v-progress-linear>
          </div>

          <v-container class="pa-0 ">
            <v-layout justify-space-around align-center fill-height row>
              <div :class="{'fullscreen-body': isFullscreen }" align-end justify-center fill-height row>

                <v-flex>
                  <v-layout column align-center>
                    <v-flex v-if="devmode">
                      {{ bluProgress }}
                    </v-flex>
                    <v-flex>
                      <v-btn large color="blue" @touchstart="mousedownBlu" @mousedown="mousedownBlu" @touchend="mouseupBlu" @mouseup="mouseupBlu">BLU</v-btn>
                    </v-flex>
                  </v-layout>
                </v-flex>
                <v-flex class="spacer">
                </v-flex>
                <v-flex>
                  <v-layout column align-center>
                    <v-flex v-if="devmode">
                      {{ redProgress }}
                    </v-flex>
                    <v-flex>
                      <v-btn large color="red" @mousedown="mousedownRed" @mouseup="mouseupRed" @touchstart="mousedownRed" @touchend="mouseupRed">RED</v-btn>
                    </v-flex>
                  </v-layout>
                </v-flex>

              </div>
            </v-layout>
          </v-container>
        </div>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import di from '@/assets/futuristic_ammo_box_01.png'
import {
  mapState,
  mapActions,
  mapGetters,
  mapMutations
} from 'vuex'

//import store from '@/store';
//import _ from 'lodash';
import Vue from 'vue'

export default {
  name: 'ControlPoint',
  data: () => ({
    editMode: false,
    menu: 0,
    deletable: 0,
    lastCap: '',
    takeDown: true,
    isRedHeld: false,
    isBluHeld: false,
    test: 60,
    isFullscreen: true,
    isDeviceSelected: false,
  }),
  props: {},
  computed: {
    ...mapGetters('devices', {
      findDevicesInStore: 'find'
    }),
    ...mapGetters([
      'devmode'
    ]),
    isBtnHeld() {
      return (this.isBluHeld || this.isRedHeld) ? true : false
    },
    deviceId() {
      return this.$route.params.deviceId;
    },
    bluProgress() {
      return this.myDevice.bluProgress;
    },
    redProgress() {
      return this.myDevice.redProgress;
    },
    myDevice() {
      return this.findDevicesInStore({
        query: {
          _id: this.deviceId,
        }
      }).data[0];
    },
  },
  methods: {
    ...mapGetters('devices', {
      getCopy: 'getCopy',
    }),
    ...mapActions('devices', {
      findDevices: 'find'
    }),
    ...mapActions('timeline', {
      createTimelineEvent: 'create'
    }),
    catchDoubleTaps(evt) {
      if (evt.touches.length < 2) {
        // preventing double tap zoom
        evt.preventDefault();
      }
    },
    bluTick() {
      // get the value
      // const bluProgress = this.myDevice.bluProgress;
      // const redProgress = this.myDevice.redProgress;
      //
      // // do a computation
      // const fuck = this.$gameStats.deriveDevProgress()
      //
      // // submit new value
      // this.
      //
      //
      // this.createTimelineEvent({
      //   type: "timeline",
      //   action: "press_blu",
      //   source: "player",
      //   target: this.myDevice.did,
      //   targetId: this.myDevice._id,
      //   gameId: this.myDevice.associatedGames[0]
      // }, {});
    },
    redTick() {

    },
    mousedownBlu() {
      this.isBluHeld = true;
      // this.$options.bluInterval = setInterval(this.bluTick, 500);
      this.createTimelineEvent({
        type: "timeline",
        action: "press_blu",
        source: "player",
        target: this.myDevice.did,
        targetId: this.myDevice._id,
        gameId: this.myDevice.associatedGames[0]
      }, {});
    },
    mouseupBlu() {
      this.isBluHeld = false;
      // clearInterval(this.$options.bluInterval);
      this.createTimelineEvent({
        type: "timeline",
        action: "release_blu",
        source: "player",
        target: this.myDevice.did,
        targetId: this.myDevice._id,
        gameId: this.myDevice.associatedGames[0]
      }, {});
    },
    mousedownRed() {
      this.isRedHeld = true;
      this.createTimelineEvent({
        type: "timeline",
        action: "press_red",
        source: "player",
        target: this.myDevice.did,
        targetId: this.myDevice._id,
        gameId: this.myDevice.associatedGames[0]
      }, {});
    },
    mouseupRed() {
      this.isRedHeld = false;
      this.createTimelineEvent({
        type: "timeline",
        action: "release_red",
        source: "player",
        target: this.myDevice.did,
        targetId: this.myDevice._id,
        gameId: this.myDevice.associatedGames[0]
      }, {});
    },
    deleteDevice: function() {
      if (this.deletable) {
        this.removeDevice(this.myDevice._id)
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
    // disable context menu in browsers
    // when pressing and holding in responsive design mode
    window.oncontextmenu = function() {
      return false;
    }

    this.findDevices();
    this.isFullscreen = true;
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.spacer {
  width: 25vw;
}

.stackhere {
  position: relative;
  height: 50px;
}

.samespace {
  position: absolute;
}

.flipped {
  -webkit-transform: rotate(180deg);
  -moz-transform: rotate(180deg);
  -o-transform: rotate(180deg);
  -ms-transform: rotate(180deg);
  transform: rotate(180deg);
}

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

.vis {
  display: inherit;
}

.invist {
  display: none;
}

.hidden {
  visibility: hidden;
}

.fullscreen-container {
  position: fixed;
  z-index: 500;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: black;
  overflow: hidden;
}

.fullscreen-header {}

.fullscreen-body {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
}


div.btn__content {
  border: 3px solid yellow;
  padding: 0 0 0 0;
}
</style>
