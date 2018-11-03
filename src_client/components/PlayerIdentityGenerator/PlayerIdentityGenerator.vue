<template>
<v-container fluid grid-list-lg>

  <v-card class="e4">
    <v-card-media height="200px" :src="smileys">
      <v-container fill-height fluid>
        <v-layout fill-height>
          <v-flex xs12 align-end flexbox>
            <span class="headline white--text">Player Identity Generator</span>
          </v-flex>
        </v-layout>
      </v-container>
    </v-card-media>
    <v-card-text>
      <v-container fluid grid-list-lg>
        <v-layout row wrap>
          <v-card-title>
            <div>
              <span class="grey--text">Enter the number of players</span><br>
            </div>
          </v-card-title>
          </v-flex>
        </v-layout>
        <v-layout row wrap>
          <v-flex md9>
            <v-slider v-model="playercount" :max="255" label="Players">
            </v-slider>
          </v-flex>
          <v-flex xs3>
            <v-text-field v-model="playercount" class="mt-0" type="number">
            </v-text-field>
          </v-flex>
          <v-flex xs12 sm4 text-xs-center>
            <div>
              <v-btn depressed large color="primary">Generate</v-btn>
            </div>
          </v-flex>
        </v-layout>
      </v-container>
    </v-card-text>
  </v-card>
</v-container>
</template>

<script>
import smileysImage from '../../assets/smileys.png'
import Face from './Face.vue'
import {
  mapActions
} from 'vuex'


export default {
  name: 'PlayerIdentityGenerator',
  data() {
    return {
      placeholder: 'PLACEHOLDER',
      test: 'hi',
      playercount: 5
    }
  },
  props: {
    smileys: {
      type: String,
      default: smileysImage
    },
  },
  components: {
    Face
  }
}

console.log(smileysImage)
</script>

<style></style>
