<template>
<v-container>
  <v-layout row>
    <h2>Game Report</h2>
  </v-layout>
  <v-layout column align-space-around>
    <v-card>
      <v-container>
        @todo insert timeline when game is over
        <!-- <d3-timeline :data="timelineData" :options="timelineOptions" width="100%" height="300px">
        </d3-timeline> -->
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
  d3Timeline
} from 'd3-vs';

export default {
  name: 'Report',
  data() {
    return {
      timelineOptions: {
        intervalCornerRadius: 1,
        liveTimer: false
      },
      timelineMargin: {}
    }
  },
  props: {
    timelineData: {
      type: Array,
      required: true
    }
  },
  components: {
    d3Timeline
  }
}
</script>

<style>
.redBar {
  fill: rgb(244, 67, 54);
}
.bluBar {
  fill: rgb(33, 150, 243);
}
.gryBar {
  fill: rgb(158, 158, 158);
}
.grnBar {
  fill: rgb(76, 175, 80);
}
.ylwBar {
  fill: rgb(255, 193, 7);
}
</style>

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
