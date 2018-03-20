<template>
        <v-flex xs12 sm6 md6 lg3>
            <v-card
                :color="controllingTeam ? 'red' : 'green'"
            >
                <v-card-media
                    height="200px"
                    :src="image"
                >
                    <v-container fill-height fluid>
                        <v-layout fill-height>
                          <v-flex xs12 align-end flexbox>
                            <span class="headline white--text">D3VICE</span>
                          </v-flex>
                        </v-layout>
                    </v-container>
                </v-card-media>

                <v-card-title primary-title>
                    <v-container fluid>
                        <v-layout row>
                            <v-flex xs4>
                                <v-subheader>Location</v-subheader>
                            </v-flex>
                            <v-flex xs8>
                                <v-text-field
                                    name="input-3-4"
                                    label="Location of the D3VICE on the field"
                                    v-bind:value="location"
                                    single-line
                                ></v-text-field>
                            </v-flex>
                        </v-layout>
                        <div>
                            <span>ID: </span>
                            <span>{{ did }}</span><br>
                            <span>Location: </span>
                            <span>{{ location }}</span><br>
                            <span>CreatedAt: </span>
                            <span>{{ createdAt | formatDate }}</span>
                        </div>
                    </v-container>
                </v-card-title>



                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="green">
                        GRN
                    </v-btn>
                    <v-btn color="red">
                        RED
                    </v-btn>
                    <v-btn icon @click.native="show = !show">
                        <v-icon>more_vert</v-icon>
                    </v-btn>
                </v-card-actions>

            </v-card>
        </v-flex>
</template>

<script>
import di from '../assets/futuristic_ammo_box_01.png'

export default {
  name: 'device',
  props: {
    did: String,
    controllingTeam: {
        type: Boolean,
        default: false
    },
    location: {
        type: String,
        default: "Safe Zone"
    },
    image: {
        type: String,
        default: di
    },
    createdAt: Number
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
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
