<template>
  <div
  class="invis"
  :class="{ 'fullscreen-container': isFullscreen }"
  >
    <div class="fullscreen-header">
      <v-progress-linear
        v-model="test"
        height="25"
        color="red"
        background-color="grey"
      ></v-progress-linear>
    </div>
    <div :class="{'fullscreen-body': isDeviceSelected }" align-end justify-center fill-height row>
      <v-btn color="blue">BLU</v-btn>
      <v-btn
      class="tinybutton"
      color="DarkGray"
      @click="toggleFullscreen"
      >
        <v-icon>close</v-icon>
      </v-btn>
      <v-btn color="red">RED</v-btn>
    </div>
  </div>
</template>

<script>
import di from '@/assets/futuristic_ammo_box_01.png'
import {
  mapState,
  mapActions
} from 'vuex'

import store from '@/store'


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
    createTimelineEvent: {
      type: Function,
      required: true
    }
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
  data: () => ({
    editMode: false,
    menu: 0,
    deletable: 0,
    lastCap: '',
    takeDown: true,
    test: 60
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
