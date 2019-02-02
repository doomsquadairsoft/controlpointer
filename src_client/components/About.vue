<template>
<div>
  <v-container class="pa-1 ma-1">
    <v-layout>
      <v-flex row>
        <v-card>


          <v-container fluid grid-list-md>
            <v-layout row wrap>
              <v-flex d-flex xs12 sm6 md4>
                <v-card color="purple" dark>
                  <v-card-title primary class="title">DooM HQ</v-card-title>
                  <v-card-text><i>You're looking at it!</i><br><br>DooM HQ makes the airsoft field admin's life easier. Game timers, capture states, point tracking, pyrotechnics triggers, and more.</v-card-text>
                </v-card>
              </v-flex>
              <v-flex d-flex xs12 sm6 md3>
                <v-layout row wrap>
                  <v-flex d-flex>
                    <v-card color="blue darken-2" dark>
                      <v-card-title class="title">DooM D3VICES</v-card-title>
                      <v-card-text>Hardware placed on the field which interacts with DooM HQ.</v-card-text>
                    </v-card>
                  </v-flex>
                  <v-flex d-flex>
                    <v-layout row wrap>
                      <v-flex d-flex xs12>
                        <v-card color="blue darken-4" dark>
                          <v-card-title class="title">2 Button DooM D3VICE</v-card-title>
                          <v-card-text><img class="thumbnail" :src="device2bImg" /> A D3VICE which players can interact with to capture a controlpoint for their team.</v-card-text>
                        </v-card>
                      </v-flex>
                    </v-layout>
                  </v-flex>
                </v-layout>
              </v-flex>
              <v-flex d-flex xs12 sm6 md5>
                <v-card color="green darken-1" dark>
                  <v-card-title primary class="title">Get Started</v-card-title>
                  <v-card-text><ol><li>Add your <router-link to="/device">D3VICES</router-link> to DooM HQ.</li><li>Create a <router-link to="/game">game</router-link> with your D3VICES.</li></ol></v-card-text>
                </v-card>
              </v-flex>
            </v-layout>
          </v-container>

        </v-card>

      </v-flex>
    </v-layout>
  </v-container>
</div>
</template>

<script>
import doomsquadPeople from '@/assets/doomsquad_0.jpg';
import controlpointerExample from '@/assets/controlpointer_example.png';
import device2bImage from '@/assets/device-2b.jpg';

export default {
  name: 'About',
  data: () => ({
    lorem: `Lorem ipsum dolor sit amet, mel at clita quando. Te sit oratio vituperatoribus, nam ad ipsum posidonium mediocritatem, explicari dissentiunt cu mea. Repudiare disputationi vim in, mollis iriure nec cu, alienum argumentum ius ad. Pri eu justo aeque torquatos.`
  }),
  computed: {
    device2bImg: () => device2bImage,
  }
}
</script>


<style>
.thumbnail {
  max-width: 100%;
}

.cRed {
  color: red;
}

.superscript {
  position: relative;
  top: -0.5em;
  font-size: 80%;
}

.footnote {
  color: DarkGray;
  margin-top: 1em;
}

li {
  margin-left: 2em;
}
</style>
