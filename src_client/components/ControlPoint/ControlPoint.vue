<!--
To disable context menu in responsive mode, paste this into console:
window.oncontextmenu = function() { return false; }
sauce: https://stackoverflow.com/a/46337736/1004931
(added to created function so you don't have to copy+paste it every time)
 -->


<template>
<v-flex xs12>
  <v-flex xs12 class="selectableControlPoint">
    <v-card>
      <v-layout row align-center justify-center>
        <v-flex xs7>
          <v-card-title primary-title>
            <div>
              <div class="headline">Controlpoint {{ did }}</div>
            </div>
          </v-card-title>
        </v-flex>
        <v-flex xs5>
          <v-btn color="primary" @click="toggleFullscreen">Select {{ did }}</v-btn>
        </v-flex>
      </v-layout>
    </v-card>
  </v-flex> <!-- /.selectableControlPoint  -->
  <div @touchstart="catchDoubleTaps" class="invis" :class="{ 'fullscreen-container': isFullscreen }">
    <div class="fullscreen-header">
      <div class="stackhere">
        <v-progress-linear class="samespace" v-model="bluProgress" height="25" color="blue" background-opacity="0"></v-progress-linear>
        <v-progress-linear class="samespace flipped" v-model="redProgress" height="25" color="red" background-opacity="0"></v-progress-linear>
      </div>
      <v-progress-linear :class="{'hidden': !isBtnHeld }" :indeterminate="true" color="purple"></v-progress-linear>
    </div>
    <div :class="{'fullscreen-body': isFullscreen }" align-end justify-center fill-height row>
      <v-btn class="hugebutton" color="blue" @touchstart="mousedownBlu" @touchend="mouseupBlu">BLU</v-btn>

        <v-btn class="tinybutton" color="DarkGray" @click="toggleFullscreen">
          <v-icon>close</v-icon>
        </v-btn>

      <v-btn class="hugebutton" color="red" @touchstart="mousedownRed" @touchend="mouseupRed">RED</v-btn>
    </div>
  </div>
</v-flex>
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
    isFullscreen: false,
    isDeviceSelected: false,
  }),
  props: {
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
    _id: {
      type: String,
      required: true
    },
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
  },
  computed: {
    isBtnHeld() {
      return (this.isBluHeld || this.isRedHeld) ? true : false
    }
  },
  methods: {
    ...mapGetters('devices', {
      getCopy: 'getCopy'
    }),
    toggleFullscreen() {
      if (!this.isFullscreen) document.body.classList.add('noscroll')
      else document.body.classList.remove('noscroll')
      this.isFullscreen = !this.isFullscreen;
    },
    catchDoubleTaps(evt) {
      if (evt.touches.length < 2) {
        // preventing double tap zoom
        evt.preventDefault();
      }
    },
    mousedownBlu() {
      this.isBluHeld = true;
      this.createTimelineEvent({
        type: "timeline",
        action: "press_blu",
        source: "player",
        target: this.did,
        targetId: this._id
      }, {});
    },
    mouseupBlu() {
      this.isBluHeld = false;
      this.createTimelineEvent({
        type: "timeline",
        action: "release_blu",
        source: "player",
        target: this.did,
        targetId: this._id
      }, {});
    },
    mousedownRed() {
      this.isRedHeld = true;
      this.createTimelineEvent({
        type: "timeline",
        action: "press_red",
        source: "player",
        target: this.did,
        targetId: this._id
      }, {});
    },
    mouseupRed() {
      this.isRedHeld = false;
      this.createTimelineEvent({
        type: "timeline",
        action: "release_red",
        source: "player",
        target: this.did,
        targetId: this._id
      }, {});
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
  created() {
    // disable context menu in firefox
    // when pressing and holding in responsive design mode
    window.oncontextmenu = function() {
      return false;
    }
    console.log(`id=${this._id}`)
    // const { Device } = Vue;
    // const dev = new Device({
    //   title: 'ROOKIE'
    // })

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
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
  color: #42b983;
}

.vis {
  display: inherit;
}
.invis {
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

.fullscreen-body .hugebutton {
  width: 46vw;
  height: 70vh;
}

.fullscreen-body .tinybutton {
  width: 1vw;
  height: 3em;
}
</style>
