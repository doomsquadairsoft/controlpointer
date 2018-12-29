<template>
<v-container>
  <v-layout row>
    <h2>Game Report</h2>
  </v-layout>
  <v-layout column align-space-around>
    <v-card>
      <v-container>
        <div id="timeline1"></div>
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
import {
  timelines
} from 'd3-timelines';
import * as d3 from 'd3';


export default {
  name: 'Report',
  data() {
    return {
      tick: 0,
      rt: 777,
      testData: [{
          times: [{
            "starting_time": 1355752800000,
            "ending_time": 1355759900000
          }, {
            "starting_time": 1355767900000,
            "ending_time": 1355774400000
          }]
        },
        {
          times: [{
            "starting_time": 1355759910000,
            "ending_time": 1355761900000
          }, ]
        },
        {
          times: [{
            "starting_time": 1355761910000,
            "ending_time": 1355763910000
          }]
        }
      ]
    }
  },
  props: {

  },
  computed: {

  },
  methods: {
    calculatePath() {
      var chart = timelines();
      var svg = d3.select("#timeline1")
        .append("svg")
        .attr("width", 500)
        .datum(this.testData)
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

.axis path,
.axis line {
  fill: none;
  stroke: black;
  shape-rendering: crispEdges;
}

.axis text {
  font-family: sans-serif;
  font-size: 10px;
}

.timeline-label {
  font-family: sans-serif;
  font-size: 12px;
}

#timeline2 .axis {
  transform: translate(0px, 40px);
  -ms-transform: translate(0px, 40px);
  /* IE 9 */
  -webkit-transform: translate(0px, 40px);
  /* Safari and Chrome */
  -o-transform: translate(0px, 40px);
  /* Opera */
  -moz-transform: translate(0px, 40px);
  /* Firefox */
}

.coloredDiv {
  height: 20px;
  width: 20px;
  float: left;
}
</style>
