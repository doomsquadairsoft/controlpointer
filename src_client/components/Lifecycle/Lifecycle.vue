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
            <p>remainingGameTime={{ remainingGameTime }}</p>
            <p>gamePausedDuration={{ gamePausedDuration }}</p>
            <p>gameEndTime={{ gameEndTime }}</p>
            <p>gameEndTimeHumanized={{ gameEndTimeHumanized }}</p>
            <p>gameStartTime={{ gameStartTime }}</p>
            <p>gameStartTimeHumanized={{ gameStartTimeHumanized }}</p>
            <p>gameDuration={{ gameDuration }}</p>
            <p>lastLifecycleEvent={{ lastLifecycleEvent }}</p>
            <p>elapsedGameTime={{ elapsedGameTime }}</p>
            <p>remainingGameTimeDigital={{ remainingGameTimeDigital }}</p>
            <p>gameState={{ gameState }}</p>
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

export default {
  name: 'Lifecycle',
  data() {
    return {
      tick: 0,
      rt: 777
    }
  },
  props: {

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
    gameState() {
      var lle = this.lastLifecycleEvent;
      var res = 'Unknown';
      if (typeof lle === 'undefined') return res
      if (lle.action === 'start') res = 'Started'
      if (lle.action === 'stop') res = 'Stopped'
      if (lle.action === 'pause') res = 'Paused'
      return res
    },
    activeTimeline() {
      // activeTimeline is an array of cleansed timeline events
      // following the latest stop event
      // if there is no stop event, it is the entire cleansed timeline.
      var cleansedTimeline = this.cleansedTimeline;
      if (cleansedTimeline.length < 1) return [];

      var lastStopEventIndex = _.findLastIndex(cleansedTimeline, {
        action: 'stop'
      })
      if (lastStopEventIndex === -1)
        return this.cleansedTimeline

      return this.cleansedTimeline.slice(
        lastStopEventIndex + 1,
        this.cleansedTimeline.length
      )

    },
    cleansedTimeline() {
      // cleansedTimeline is the timeline without duplicate events (see below)
      var gis = this.findTimelineInStore({
        query: {
          $sort: {
            createdAt: 1
          }
        }
      }).data;

      // remove any duplicate pause or start timeline events
      // example: start, pause, pause, start, start =>
      //          start, pause, start
      // (source and target must also be a match to get rejected)
      var filtered = _.filter(gis, (g, index, collection) => {
        // if we aren't iterating on the last array element,
        // inspect the next element and see if that element's action is a duplicate of this element's action
        if (index !== collection.length - 1) {
          if (
            g.action === collection[index + 1].action &&
            g.source === collection[index + 1].source &&
            g.target === collection[index + 1].target
          ) {
            collection[index + 1].invalid = true;
          }
        }
        return g.invalid === true ? false : true
      });

      return filtered;
    },
    gamePausedDuration() {
      // Gets the total amount of milliseconds that the active game
      // has spent in the paused state.
      // Used to determine remaining time in current game
      var activeTimeline = this.activeTimeline;
      var reduced = _.reduce(activeTimeline, (accumulator, g, i, coll) => {
        var res = moment.duration(accumulator);
        if (i !== coll.length - 1) {
          if (g.action === 'pause' && coll[i + 1].action === 'start') {
            var pausedMoment = moment(g.createdAt);
            var resumedMoment = moment(coll[i + 1].createdAt);
            var diff = moment.duration(resumedMoment.diff(pausedMoment));
            //console.log(`rMoment=${moment(coll[i+1].createdAt)}  pMoment=${moment(g.createdAt)}  chrisDiff=${resumedMoment.valueOf()-pausedMoment.valueOf()}  momentDiff=${diff}  acc=${accumulator}`)
            return moment.duration(accumulator).add(diff); //moment.duration(accumulator).add(diff);
          }
        }
        return accumulator;
      }, 0);
      return reduced;
    },
    gameEndTime() {
      if (this.activeTimeline.length < 1) return moment(0);
      return moment(this.gameStartTime).add(this.gameDuration).add(this.gamePausedDuration);
    },
    gameEndTimeHumanized() {
      var gameEndTime = this.gameEndTime
      if (gameEndTime === 'n/a') return gameEndTime
      return moment(gameEndTime).format("dddd, MMMM Do YYYY, h:mm:ss a")
    },
    gameStartTime() {
      var activeTimeline = this.activeTimeline
      if (activeTimeline.length < 1)
        return 'n/a';
      return moment(activeTimeline[0].createdAt);
    },
    gameStartTimeHumanized() {
      var gameStartTime = this.gameStartTime
      if (gameStartTime === 'n/a') return gameStartTime
      return moment(gameStartTime).format("dddd, MMMM Do YYYY, h:mm:ss a");
    },
    gameDuration() {
      var gis = this.findGameInStore({
        query: {
          $limit: 1,
          $sort: {
            createdAt: -1 // most recently created game
          }
        }
      }).data;

      // if there are no games, set to default game length of 22 seconds
      if (typeof gis.length < 1)
        return moment.duration({
          'seconds': 22
        });

      // If there is a duration object,
      // set the defined duration
      if (typeof gis[0] !== 'undefined') {
        return moment.duration({
          'milliseconds': gis[0].duration
        });

        // else there is not a duration object
        // set a default duration
      } else {
        return moment.duration({
          'milliseconds': 3000
        });
      }
    },
    lastLifecycleEvent() {
      var timeline = this.cleansedTimeline;
      if (timeline.length < 1) return [];
      return _.findLast(timeline, (evt) => {
        return evt.action === 'pause' || evt.action === 'start' || evt.action === 'stop'
      })
    },
    elapsedGameTime() {
      var now = this.rt
      var activeTimeline = this.activeTimeline
      if (activeTimeline.length < 1) return moment(0)
      var lastEvent = this.lastLifecycleEvent;
      var gameState = this.gameState;
      var lastEventMoment = moment(lastEvent.createdAt)
      var gamePausedDuration = this.gamePausedDuration;
      var gameStartTime = this.gameStartTime;
      var timeBetweenLastEventAndGameStart = lastEventMoment.diff(gameStartTime)
      if (gameState === 'Paused') {
        return moment.duration(timeBetweenLastEventAndGameStart).subtract(gamePausedDuration);
      } else if (gameState === 'Started') {
        return moment.duration(timeBetweenLastEventAndGameStart).subtract(gamePausedDuration).add(now.diff(lastEventMoment));
      }
    },
    remainingGameTime() {
      var endTime = this.gameEndTime;
      var lastEvent = this.lastLifecycleEvent;
      var lastEventMoment = moment(lastEvent.createdAt);
      var remaining = endTime.diff(lastEventMoment);
      var gameState = this.gameState;
      var now = this.rt;
      if (gameState === 'Paused') {
        return moment.duration(remaining);
      } else if (gameState === 'Started') {
        var r = moment.duration(remaining).subtract(now.diff(lastEventMoment));
        if (r.asMilliseconds() < 0) r = moment.duration(0);
        return r;
      }
    },
    remainingGameTimeDigital() {
      var rgt = this.remainingGameTime;
      if (moment.isDuration(rgt)) {
        var h = rgt.hours();
        var m = rgt.minutes();
        var s = rgt.seconds();
        var _hh = h < 10 ? '0' + h : h;
        var _mm = m < 10 ? '0' + m : m;
        var _ss = s < 10 ? '0' + s : s;
        var hh = _hh === 0 ? '00' : _hh;
        var mm = _mm === 0 ? '00' : _mm;
        var ss = _ss === 0 ? '00' : _ss;

        return `${hh}:${mm}:${ss}`;
      } else {
        return '00:00:00';
      }
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
