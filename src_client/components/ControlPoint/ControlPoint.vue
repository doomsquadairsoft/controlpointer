<!--
To disable context menu in responsive mode, paste this into console:
window.oncontextmenu = function() { return false; }
sauce: https://stackoverflow.com/a/46337736/1004931
 -->


<template>
  <div
  @touchstart="catchDoubleTaps"
  class="invis"
  :class="{ 'fullscreen-container': isFullscreen }"
  >
    <div class="fullscreen-header">
      <!--
           the problem here is that bluProgress is based on DOM data,
            not a device. We need to change ControlPoint.vue to be created
            and destroyed when ControlPointContainer selects something,
            rather than working with selection.bluProgress, etc.
      -->
      <v-progress-linear
        v-model="bluProgress"
        height="25"
        color="blue"
        background-color="grey"
      ></v-progress-linear>
    </div>
    <div :class="{'fullscreen-body': isDeviceSelected }" align-end justify-center fill-height row>
      <v-btn
        color="blue"
        @touchstart="touchstartBlu"
        @touchend="touchendBlu"
      >BLU</v-btn>

      <v-btn
        class="tinybutton"
        color="DarkGray"
        @click="toggleFullscreen"
      ><v-icon>close</v-icon>
      </v-btn>

      <v-btn
        color="red"
        @touchstart="mousedownRed"
        @touchend="mouseupRed"
      >RED</v-btn>
    </div>
  </div>
</template>

<script>
import di from '@/assets/futuristic_ammo_box_01.png'
import {
  mapState,
  mapActions
} from 'vuex'

import store from '@/store';
import _ from 'lodash';


export default {
  name: 'ControlPoint',
  props: {
    isDeviceSelected: {
      type: Boolean,
      required: true
    },
    isFullscreen: {
      type: Boolean,
      required: true
    },
    toggleFullscreen: {
      type: Function,
      required: true
    },
    did: String,
    controllingTeam: {
      type: Number,
      default: 0,
      required: true
    },
    redProgress: {
      type: Number,
      default: 10,
      required: true
    },
    bluProgress: {
      type: Number,
      default: 10,
      required: true
    },
    location: {
      type: String,
      default: "Safe Zone"
    },
    image: {
      type: String,
      default: di
    },
    latLng: {
      type: Object
    },
    _id: String,
    createdAt: Number,
    patchDevice: {
      type: Function,
      required: true
    },
    getDevice: {
      type: Function,
      required: true
    },
    createTimelineEvent: {
      type: Function,
      required: true
    },
    // incrementBluProgress: {
    //   type: Function,
    //   required: true
    // },
    // incrementRedProgress: {
    //   type: Function,
    //   required: true
    // }
  },
  computed: {
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
    }
  },
  methods: {
    incrementBluProgress() {
      console.log('incrementing blu progress')
      // var dev = this.getDevice(this._id, {}).then((d) => {
      //   console.log(d)
      this.patchDevice([this._id, {
        bluProgress: 50
      }])
      // })
      //console.log(dev)

    },
    incrementRedProgress() {
      this.getDevice(this._id, {}).then((device) => {
        this.patchDevice([this._id, {
          bluProgress: device.bluProgress += 10
        }])
      })
    },
    updateProgress () {
      console.log('udpating progress')
      if (this.isBluHeld)
        this.incrementBluProgress();
      if (this.isRedHeld)
        this.incrementRedProgress();
    },
    advanceBlu () {
      console.log('advancing blu')
      this.test-=10;
    },
    catchDoubleTaps (evt) {
      if (evt.touches.length < 2) {
        // preventing double tap zoom
        evt.preventDefault();
      }
    },
    touchstartBlu () {
      console.log('touch start blu')
      this.isBluHeld = true;
      console.log(this.isBluHeld)
    },
    touchendBlu () {
      console.log('touch end blu')
      this.isBluHeld = false;
      console.log(this.isBluHeld)
    },
    mousedownRed () {
      console.log('touch start red')
      this.isRedHeld = true;
      console.log(this.isRedHeld)
    },
    mouseupRed () {
      console.log('touch end red')
      //this.isRedHeld = false;
    },
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
          target: this.did
        }, {});
      //store.dispatch('changeControllingTeamBlue')
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
          target: this.did
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
          target: this.did
        }, {});
      //this.patchDevice([this._id, {redProgress: 0, bluProgress: 0}, undefined])
    },
    deleteDevice: function() {
      if (this.deletable) {
        this.removeDevice(this._id)
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
  created () {
    setInterval(this.updateProgress, 250);
  },
  data: () => ({
    editMode: false,
    menu: 0,
    deletable: 0,
    lastCap: '',
    takeDown: true,
    test: 60,
    isBluHeld: false,
    isRedHeld: false
  })
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
  color: #42b983;
}
.invis {
  display: none;
}
.fullscreen-container {
  position: absolute;
  z-index: 500;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: black;
}
.fullscreen-header {
}
.fullscreen-body {
  display: flex;
  justify-content:space-around;
  align-content: flex-end;
}
.fullscreen-body button {
  width: 46vw;
  height: 80vh;
}
.fullscreen-body .tinybutton {
  width: 1vw;
  height: 3em;
}
</style>
