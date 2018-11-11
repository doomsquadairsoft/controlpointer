<template>
<v-flex xs12 sm6 lg4>


  <v-card>
    <v-card-media height="200px" :src="image">
      <v-container fill-height fluid>
        <v-layout fill-height>
          <v-flex xs12 align-end flexbox>
            <span class="headline white--text">D3VICE</span>
          </v-flex>
        </v-layout>
      </v-container>
    </v-card-media>

    <v-card-text v-show="editMode">
      <v-form :value="editMode">
        <v-text-field label="Location" v-model="location" :counter="40" required></v-text-field>
        <v-text-field label="Device ID" v-model="did" :counter="16" required></v-text-field>
        <v-btn color="info" @click=>
          Set position on map
        </v-btn>
      </v-form>
    </v-card-text>


    <v-card-text v-show="!editMode">
      <div>
        <span>Location: </span>
        <span>{{ location }}</span><br>
        <span>ID: </span>
        <span>{{ did }}</span><br>
        <span>CreatedAt: </span>
        <span>{{ createdAt | formatDate }}</span><br>
        <span>Latitude: </span>
        <span>{{ latLng.lat }}</span><br>
        <span>Longitude: </span>
        <span>{{ latLng.lng }}</span>
      </div>
    </v-card-text>

    <v-card-text>
      <v-container fluid class="my-0 py-0">
        <div class="text-xs-center">
          <v-layout row>
            <v-flex xs12>
              <v-progress-circular :size="100" :width="15" :rotate="0" :value="bluProgress" color="blue">
                {{ bluProgress }}
              </v-progress-circular>
              <v-progress-circular :size="100" :width="15" :rotate="0" :value="redProgress" color="red">
                {{ redProgress }}
              </v-progress-circular>
              <v-layout row>
                <v-flex xs12>
                  <v-chip v-bind:color="controllingColor" text-color="white">
                    <v-avatar>
                      <v-icon>group</v-icon>
                    </v-avatar>
                    {{ controlledByTeam }}
                  </v-chip>
                </v-flex>
              </v-layout>
            </v-flex>
          </v-layout>
        </div>
      </v-container>
    </v-card-text>




    <v-card-actions class="xs1 my-buttons">
      <v-spacer></v-spacer>
      <v-btn color="blue" @click="changeControllingTeamBlue">
        BLU
      </v-btn>
      <v-btn color="red" @click="changeControllingTeamRed">
        RED
      </v-btn>
      <v-btn color="grey" @click="changeControllingTeamUnc">
        UNC
      </v-btn>



      <v-menu offset-x v-bind:close-on-content-click="false" v-bind:nudge-width="200" v-model="menu">
        <v-btn icon slot="activator">
          <v-icon>more_vert</v-icon>
        </v-btn>


        <v-card>
          <v-list>
            <v-list-tile>
              <v-list-tile-content>
                <v-list-tile-title>{{ did }}</v-list-tile-title>
                <v-list-tile-sub-title>{{ location }}</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
          <v-divider></v-divider>
          <v-list>
            <v-list-tile @click="showEditor">
              <v-list-tile-title>Edit</v-list-tile-title>
            </v-list-tile>
            <v-list-tile>
              <v-list-tile-action>
                <v-switch v-model="deletable" color="red"></v-switch>
              </v-list-tile-action>
              <v-list-tile-title>Enable deletion</v-list-tile-title>
            </v-list-tile>
            <v-list-tile color="red" :disabled="!deletable" @click="deleteDevice">
              <v-list-tile-title>Delete D3VICE</v-list-tile-title>
            </v-list-tile>
          </v-list>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn flat @click="menu = false">Cancel</v-btn>
          </v-card-actions>

        </v-card>
      </v-menu>


    </v-card-actions>

  </v-card>
</v-flex>
</template>

<script>
import di from '../assets/futuristic_ammo_box_01.png'
import {
  mapState,
  mapActions
} from 'vuex'

import store from '@/store'


export default {
  name: 'device',
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
    _id: String,
    createdAt: Number,
    patchDevice: {
      type: Function,
      required: true
    },
    removeDevice: {
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
      console.log('setting blu ' + this._id)
      this.patchDevice([
        this._id, {
          bluProgress: 100,
          redProgress: 0
        }, {}
      ]);
      //store.dispatch('changeControllingTeamBlue')
      //this.patchDevice([this._id, {bluProgress: 100, redProgress: 0}, undefined])
    },
    changeControllingTeamRed: function() {
      console.log('setting red ' + this._id)
      this.patchDevice([
        this._id, {
          bluProgress: 0,
          redProgress: 100
        }, {}
      ]);
      //this.patchDevice([this._id, {redProgress: 100, bluProgress: 0}, undefined])
    },
    changeControllingTeamUnc: function() {
      console.log('setting unc ' + this._id)
      this.patchDevice([
        this._id, {
          bluProgress: 0,
          redProgress: 0
        }, {}
      ]);
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
    takeDown: true
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
</style>
