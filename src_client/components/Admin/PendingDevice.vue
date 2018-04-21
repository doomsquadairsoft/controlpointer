<template>
        <v-flex xs12 sm6 md6 lg3>


            <v-card

            >
                <v-card-media
                    height="200px"
                    :src="image"
                >
                    <v-container fill-height fluid>
                        <v-layout fill-height>
                          <v-flex xs12 align-end flexbox>
                            <span class="headline white--text">PENDING D3VICE</span>
                          </v-flex>
                        </v-layout>
                    </v-container>
                </v-card-media>

                <v-card-text v-show="editMode">
                    <v-form :value="editMode">
                        <v-text-field
                            label="Location"
                            v-model="location"
                            :counter="40"
                            required
                        ></v-text-field>
                        <v-text-field
                            label="Device ID"
                            v-model="did"
                            :counter="16"
                            required
                        ></v-text-field>
                        <v-btn color="info" @click="">
                            Set position on map
                        <v-text-field>
                    </v-form>
                </v-card-text>


                <v-card-text
                    v-show="!editMode"
                >
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
                                </v-flex>
                            </v-layout>
                        </div>
                    </v-container>
                </v-card-text>




                <v-card-actions>
                    <v-spacer></v-spacer>

                    <v-menu
                      offset-x
                      v-bind:close-on-content-click="false"
                      v-bind:nudge-width="200"
                      v-model="menu"
                    >
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
                            <v-list-tile @click="transferToDevices">
                              <v-list-tile-title>Activate</v-list-tile-title>
                            </v-list-tile>
                          <v-list-tile>
                            <v-list-tile-action>
                              <v-switch v-model="deletable" color="red"></v-switch>
                            </v-list-tile-action>
                            <v-list-tile-title>Enable deletion</v-list-tile-title>
                          </v-list-tile>
                          <v-list-tile color="red" :disabled="!deletable" @click="deletePendingDevice">
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
import di from '../../assets/futuristic_ammo_box_01.png'
import { mapState } from 'vuex'


export default {
    name: 'pendingDevice',
    props: {
        did: String,
        image: {
            type: String,
            default: di
        },
        latLng: {
            type: Object
        },
        _id: String,
        createdAt: Number,
        patchPendingDevice: Function,
        removePendingDevice: Function,
        createDevice: Function
    },
    computed: {
    },
    methods: {
        deletePendingDevice: function() {
            if (this.deletable) {
                this.removePendingDevice(this._id)
            }
        },
        transferToDevices: function() {
            this.createDevice({
                did: this.did,
                latLng: this.latLng,
                controllingTeam: 0,
                redProgress: 0,
                bluProgress: 0
            });
            this.removePendingDevice(this._id);
        },
    },
    data: () => ({
        menu: 0,
        deletable: 0
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
