<template>

  <v-layout column align-space-around>
    <v-layout row>
      <h2>Game Lifecycle</h2>
    </v-layout>
    <v-card>
      <v-container>
        <v-layout align-center justify-center column>
          <div class="scrollArea" :class="{ 'invis': !devmode }">
            <v-alert :value="true" type="info" v-if="devmode">
              Development mode is ON. To change, visit the <router-link class="whitelink" to="utilities">Utilities</router-link> page.
            </v-alert>
          </div>
          <lifecycle-display
          ></lifecycle-display>
          <lifecycle-controls></lifecycle-controls>
        </v-layout>
      </v-container>
    </v-card>
  </v-layout>

</template>

<script>
import {
  mapState,
  mapActions,
  mapGetters
} from 'vuex'

import moment from 'moment'
import LifecycleDisplay from './LifecycleDisplay'
import LifecycleControls from './LifecycleControls'
import LifecycleLog from './LifecycleLog'
import Report from '@/components/Report/Report'


export default {
  name: 'Lifecycle',
  data() {
    return {
      tickCount: 0,
      timePointer: moment().valueOf(),
      timelineData: [{
        at: new Date('2018-12-26 01:00:00'),
        title: 'Game start',
        group: 'Admin',
        className: 'grnBar',
        symbol: 'symbolDiamond'
      }, {
          from: new Date('2018-12-26 01:01:00'),
          to: new Date('2018-12-26 01:03:00'),
          title: 'BLU controlled the TOWER',
          group: 'TOWER',
          className: 'bluBar',
        },
        {
          from: new Date('2018-12-26 01:03:01'),
          to: new Date('2018-12-26 01:14:00'),
          title: 'RED controlled the TOWER',
          group: 'TOWER',
          className: 'redBar',
        },
        {
          from: new Date('2018-12-26 01:08:00'),
          to: new Date('2018-12-26 01:20:00'),
          title: 'RED controlled the BUNKER',
          group: 'SANDBAG BUNKER',
          className: 'redBar',
        },
        {
          from: new Date('2018-12-26 01:00:00'),
          to: new Date('2018-12-26 01:20:00'),
          title: 'BLU controlled the GOBLIN FORTRESS',
          group: 'GOBLIN FORTRESS',
          className: 'gryBar',
        },
        {
          from: new Date('2018-12-26 01:04:00'),
          to: new Date('2018-12-26 01:06:00'),
          title: 'RED controlled the BRIDGE',
          group: 'BRIDGE',
          className: 'redBar',
        }, {
          from: new Date('2018-12-26 01:06:01'),
          to: new Date('2018-12-26 01:18:00'),
          title: 'BLU controlled the BRIDGE',
          group: 'BRIDGE',
          className: 'bluBar',
        }, {
          from: new Date('2018-12-26 01:18:01'),
          to: new Date('2018-12-26 01:20:00'),
          title: 'RED controlled the BRIDGE',
          group: 'BRIDGE',
          className: 'redBar',
        }
      ]
    }
  },
  watch: {

  },
  computed: {
    devmode() {
      return this.$store.getters.devmode
    },
    ...mapState('game', 'game'),
    ...mapState('timeline', 'timeline'),
    ...mapGetters('timeline', {
      createTimelineEvent: 'create',
      findTimelineInStore: 'find'
    }),
    ...mapGetters('game', {
      findGameInStore: 'find'
    })
  },
  methods: {
    ...mapActions('timeline', {
      findTimeline: 'find',
      createTimeline: 'create'
    })
  },
  created() {
    this.findTimeline();
    this.$options.interval = setInterval(this.tick, 250)
  },
  beforeDestroy () {
    clearInterval(this.$options.timePointerInterval);
  },
  components: {
    LifecycleControls,
    LifecycleDisplay,
    LifecycleLog,
    Report
  }
}
</script>

<style scoped>
  .invis {
    display: none;
  }
  .scrollArea {
    height: 500px;
    overflow-y: scroll;
  }
</style>
