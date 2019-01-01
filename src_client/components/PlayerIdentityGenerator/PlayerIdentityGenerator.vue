<template>
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
              <h3>Identity</h3>
              <p>A custom in-game identity can be created for each of your players. This gives each player a unique persona to act by.</p>
              <h3>Role</h3>
              <p>Each player is given a specific role to perform on their team. Roles include <span class="cText cOrange">Captain</span>, <span class="cText cWhite">Medic</span>, <span class="cText cLime">Grenadier</span>, <span class="cText cYellow">Sapper</span>, and <span class="cText cCyan">Rifleman</span>.</p>
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
</template>

<script>
import smileysImage from '@/assets/smileys.png'
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

</script>

<style>
.cText {
  background-color: black;
  font-weight: bold;
}
.cOrange {
  color: orange;
}
.cCyan {
  color: cyan;
}
.cLime {
  color: lime;
}
.cYellow {
  color: yellow;
}
.cWhite {
  color: white;
}
</style>
