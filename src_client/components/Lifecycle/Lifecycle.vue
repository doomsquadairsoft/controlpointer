<template>
<v-container>
  <v-layout row>
    <h2>Game Lifecycle</h2>
  </v-layout>
  <v-layout column align-space-around>
    <v-card>
      <v-container>
        <v-layout align-center justify-center column>
          <div class="scrollArea" :class="{ 'invis': !devmode }">
            <p>timePointer={{ timePointer }}</p>
            <p>remainingGameTime={{ remainingGameTime }}</p>
            <p>gamePausedDuration={{ gamePausedDuration }}</p>
            <p>gameEndTime={{ gameEndTime }}</p>
            <p>gameEndTimeHumanized={{ gameEndTimeHumanized }}</p>
            <p>gameStartTime={{ gameStartTime }}</p>
            <p>gameStartTimeHumanized={{ gameStartTimeHumanized }}</p>
            <p>gameLength={{ gameLength }}</p>
            <p>lastLifecycleEvent={{ lastLifecycleEvent }}</p>
            <p>gameElapsedDuration={{ gameElapsedDuration }}</p>
            <p>remainingGameTimeDigital={{ remainingGameTimeDigital }}</p>
            <p>gameStatus={{ gameStatus }}</p>
            <p>gameTest={{ gameTest }}</p>
            <p>activeTimeline={{ activeTimeline }}</p>
            <p>activeTimelineVs={{ activeTimelineVs }}</p>
            <!-- <p>cleansedTimeline={{ cleansedTimeline }}</p> -->
          </div>
          <lifecycle-display
          :remainingGameTimeDigital="this.remainingGameTimeDigital"
          ></lifecycle-display>
          <lifecycle-controls></lifecycle-controls>
          <lifecycle-log
          :activeTimeline="this.activeTimeline"
          ></lifecycle-log>
          <report
            :timelineData="this.activeTimelineVs"
          ></report>
        </v-layout>
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
import LifecycleDisplay from './LifecycleDisplay'
import LifecycleControls from './LifecycleControls'
import LifecycleLog from './LifecycleLog'
import Report from '@/components/Report/Report'
//import GameStats from '@/../src_shared/gameStats.js'


export default {
  name: 'Lifecycle',
  data() {
    return {
      tickCount: 0,
      //rt: 777,
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
    }),
    gameTest() {
      return this.$gameStats.gt(
        this.findTimelineInStore,
        this.findGameInStore
      );
    },
    cleansedTimeline() {
      return this.$gameStats.cleansedTimeline(
        this.findTimelineInStore,
        this.findGameInStore
      )
    },
    gameStatus() {
      return this.$gameStats.gameStatus(
        this.findTimelineInStore,
        this.findGameInStore,
        this.timePointer
      )
    },
    activeTimeline() {
      return this.$gameStats.activeTimeline(
        this.findTimelineInStore,
        this.findGameInStore,
        this.timePointer
      )
    },
    activeTimelineVs() {
      return this.$gameStats.activeTimelineVs(
        this.findTimelineInStore,
        this.findGameInStore,
        this.timePointer
      )
    },
    gamePausedDuration() {
      return this.$gameStats.gamePausedDuration(
        this.findTimelineInStore,
        this.findGameInStore,
        this.timePointer
      )
    },
    gameEndTime() {
      return this.$gameStats.gameEndTime(
        this.findTimelineInStore,
        this.findGameInStore,
        this.timePointer
      )
    },
    gameEndTimeHumanized() {
      var gameEndTime = this.gameEndTime
      if (gameEndTime === 'n/a') return gameEndTime
      return moment(gameEndTime).format("dddd, MMMM Do YYYY, h:mm:ss a")
    },
    gameStartTime() {
      return this.$gameStats.gameStartTime(
        this.findTimelineInStore,
        this.findGameInStore
      )
    },
    gameStartTimeHumanized() {
      var gameStartTime = this.gameStartTime
      if (gameStartTime === 'n/a') return gameStartTime
      return moment(gameStartTime).format("dddd, MMMM Do YYYY, h:mm:ss a");
    },
    gameLength() {
      return this.$gameStats.gameLength(
        this.findTimelineInStore,
        this.findGameInStore
      )
    },
    lastLifecycleEvent() {
      var timeline = this.cleansedTimeline;
      if (timeline.length < 1) return [];
      return 'pause'
      return _.findLast(timeline, (evt) => {
        return evt.action === 'pause' || evt.action === 'start' || evt.action === 'stop'
      })
    },
    gameElapsedDuration() {
      return this.$gameStats.gameElapsedDuration(
        this.findTimelineInStore,
        this.findGameInStore,
        this.timePointer
      )
    },
    remainingGameTime() {
      return this.$gameStats.remainingGameTime(
        this.findTimelineInStore,
        this.findGameInStore,
        this.timePointer
      )
    },
    remainingGameTimeDigital() {
      return this.$gameStats.remainingGameTimeDigital(
        this.findTimelineInStore,
        this.findGameInStore,
        this.timePointer
      )
    }
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
      this.rt = moment()
      //setTimeout(() => this.updateRemainingTime(), 1000)
    },
    tick () {
      this.tickCount++;
      this.timePointer = moment().valueOf();
      this.updateRemainingTime();
    }
  },
  created() {
    this.findTimeline();
    this.findGame();
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
