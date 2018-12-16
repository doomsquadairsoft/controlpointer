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

import moment from 'moment'


export default {
  name: 'Report',
  data() {
    return {
      tick: 0,
      rt: 777
    }
  },
  props: {

  },
  computed: {

  },
  methods: {
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
  mounted () {
    const data = [99, 71, 78, 25, 36, 92];
    const svg = this.$d3.select('.diagram')
      .style('border', '3px solid red')
      .append('svg')
      .attr('width', 500)
      .attr('height', 270)
      .append('g')
      .attr('transform', 'translate(0, 10)')
    const x = this.$d3.scaleLinear().range([0, 430]);
    const y = this.$d3.scaleLinear().range([210, 0]);
    this.$d3.axisLeft().scale(x);
    this.$d3.axisTop().scale(y);
    x.domain(this.$d3.extent(data, (d, i) => i));
    y.domain([0, this.$d3.max(data, d => d)]);
    const createPath = this.$d3.line()
      .x((d, i) => x(i))
      .y(d => y(d));
    svg.append('path').attr('d', createPath(data));
  },
  components: {
  }
}
</script>

<style scoped>
  .invis {
    display: none;
  }
</style>
