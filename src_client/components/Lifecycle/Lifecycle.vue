<template>
<v-container>
  <v-layout row>
    <h2>Game Lifecycle</h2>
  </v-layout>
  <v-layout column align-space-around>
    <v-card>
      <v-container>
        <v-layout align-center justify-center column>
          <div :class="{ 'invis': !devmode }">
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
          </div>
          <lifecycle-display
          :remainingGameTimeDigital="this.remainingGameTimeDigital"
          ></lifecycle-display>
          <lifecycle-controls></lifecycle-controls>
          <lifecycle-log
          :activeTimeline="this.activeTimeline"
          ></lifecycle-log>
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
//import GameStats from '@/../src_shared/GameStats.js'


export default {
  name: 'Lifecycle',
  data() {
    return {
      tick: 0,
      rt: 777,
      timePointer: 0
    }
  },
  props: {

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
    //...mapGameStatsFunctions(),
    gameTest() {
      //console.log(this.$gameStats.gt)
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
      return '@TODO'
      // var endTime = this.gameEndTime;
      // var lastEvent = this.lastLifecycleEvent;
      // var lastEventMoment = moment(lastEvent.createdAt);
      // var remaining = endTime.diff(lastEventMoment);
      // var gameState = this.gameState;
      // var now = this.rt;
      // if (gameState === 'Paused') {
      //   return moment.duration(remaining);
      // } else if (gameState === 'Started') {
      //   var r = moment.duration(remaining).subtract(now.diff(lastEventMoment));
      //   if (r.asMilliseconds() < 0) r = moment.duration(0);
      //   return r;
      // }
    },
    remainingGameTimeDigital() {
      return '66:66:66'
      // var rgt = this.remainingGameTime;
      // if (moment.isDuration(rgt)) {
      //   var h = rgt.hours();
      //   var m = rgt.minutes();
      //   var s = rgt.seconds();
      //   var _hh = h < 10 ? '0' + h : h;
      //   var _mm = m < 10 ? '0' + m : m;
      //   var _ss = s < 10 ? '0' + s : s;
      //   var hh = _hh === 0 ? '00' : _hh;
      //   var mm = _mm === 0 ? '00' : _mm;
      //   var ss = _ss === 0 ? '00' : _ss;
      //
      //   return `${hh}:${mm}:${ss}`;
      // } else {
      //   return '00:00:00';
      // }
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
  components: {
    LifecycleControls,
    LifecycleDisplay,
    LifecycleLog,
  }
}
</script>

<style scoped>
  .invis {
    display: none;
  }
</style>
