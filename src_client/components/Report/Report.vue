<template>
<v-container>
  <v-layout row>
    <h2>Game Report</h2>
  </v-layout>
  <v-layout column align-space-around>
    <v-card>
      <v-container>
        <div class="diagram"></div>
      </v-container>
    </v-card>
  </v-layout>

</v-container>
</template>

<script>
import {
  mapState,
  mapActions,
  mapGetters
} from 'vuex'

import moment from 'moment';
import { timelines } from 'd3-timelines';
import * as d3 from 'd3';


export default {
  name: 'Report',
  data() {
    return {
      tick: 0,
      rt: 777,
      timelineData: [{
          label: "person a",
          times: [{
              "starting_time": 1355752800000,
              "ending_time": 1355759900000
            },
            {
              "starting_time": 1355767900000,
              "ending_time": 1355774400000
            }
          ]
        },
        {
          label: "person b",
          times: [{
            "starting_time": 1355759910000,
            "ending_time": 1355761900000
          }]
        },
        {
          label: "person c",
          times: [{
            "starting_time": 1355761910000,
            "ending_time": 1355763910000
          }]
        }
      ],
    }
  },
  props: {

  },
  computed: {

  },
  methods: {
    calculatePath() {
      const chart = timelines();
      const svg = d3.select('.diagram')
        .append('svg')
        .datum(this.timelineData)
        .call(chart);
    },
    ...mapActions('game', {
      findGame: 'find',
      createGame: 'create'
    }),
    ...mapActions('timeline', {
      findTimeline: 'find',
      createTimeline: 'create'
    }),
    updateRemainingTime() {
      this.tick++
      this.rt = moment()
      setTimeout(() => this.updateRemainingTime(), 1000)
    }
  },
  created() {
    this.findTimeline();
    this.findGame();
    this.updateRemainingTime();
  },
  mounted() {
    this.calculatePath();
  },
  components: {}
}
</script>

<style scoped>
.invis {
  display: none;
}
</style>
