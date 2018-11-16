<template>
<v-flex>
  <div class="text-xs-center">
    <p>Remaining Game Time: {{ remainingGameTime }}</p>

    <p>Game Duration: {{ gameDuration }}</p>

    <p>Game Start Time: {{ gameStartTime }}</p>

    <p>Game End Time: {{ gameEndTime }}</p>

    <p>Game Paused Duration: {{ gamePausedDuration }}</p>

    <p>Game State: {{ gameState }}</p>

    <p>Cleansed Timeline: {{ cleansedTimeline }}</p>

    <p>Active Timeline: {{ activeTimeline }}</p>
  </div>
</v-flex>
</template>

<script>
import {
  mapState,
  mapActions,
  mapGetters
} from 'vuex'

import _ from 'lodash'
import moment from 'moment'

export default {
  name: 'LifecycleDisplay',
  props: {

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
  },
  computed: {
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
      var gis = this.findTimelineInStore({
        query: {
          $sort: {
            createdAt: -1
          }
        }
      }).data;
      var res = 'Unknown'
      if (typeof _.head(gis) === 'undefined') return res
      if (_.head(gis).action === 'start') res = 'Started'
      if (_.head(gis).action === 'stop') res = 'Stopped'
      if (_.head(gis).action === 'pause') res = 'Paused'
      return res
    },
    activeTimeline() {
      // activeTimeline is an array of cleansed timeline events
      // following the latest stop event
      // if there is no stop event, it is the entire cleansed timeline.

      var lastStopEventIndex = _.findLastIndex(this.cleansedTimeline, {
        action: 'stop'
      })
      if (lastStopEventIndex === -1)
        return this.cleansedTimeline

      return this.cleansedTimeline.slice(
        lastStopEventIndex+1,
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
      var filtered = _.filter(gis, (g, index, collection) => {
        // if we aren't iterating on the last array element,
        // inspect the next element and see if that element's action is a duplicate of this element's action
        if (index !== collection.length - 1) {
          if (g.action === collection[index + 1].action) {
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
            console.log(`rMoment=${moment(coll[i+1].createdAt)}  pMoment=${moment(g.createdAt)}  chrisDiff=${resumedMoment.valueOf()-pausedMoment.valueOf()}  momentDiff=${diff}  acc=${accumulator}`)
            return moment.duration(accumulator).add(diff); //moment.duration(accumulator).add(diff);
          }
        }
        return accumulator;
      }, 0);
      return `${reduced} (${moment.duration(reduced).humanize()})`;
    },
    gameEndTime() {
      return moment(this.gameStartTime).add(this.gameDuration);
    },
    gameStartTime() {
      var gis = this.findTimelineInStore({
        query: {
          $limit: 1,
          $sort: {
            createdAt: 1
          }
        }
      }).data;
      if (gis.length < 1)
        return moment();
      return moment(gis[0].createdAt);
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
    remainingGameTime() {
      return '@TODO'
      //return this.findTimelineInStore().data[0].createdAt;
    }
  },
  created() {
    console.log('creating LifeCycleDisplay')
    this.findTimeline();
    this.findGame();
  }
}
</script>

<style scoped>
.bigchip {
  font-size: 50px;
}
</style>
