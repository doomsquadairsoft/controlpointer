<template>
<v-flex xs12 sm12 md8 lg5 xl2>
  <p>Game _id:{{ this._id }}</p>
  <game-status
  :removeGame="removeGame"
  :_id="_id"
  :remainingGameTime="remainingGameTime"></game-status>
</v-flex>
</template>

<script>
import {
  mapState,
  mapActions
} from 'vuex'
import GameLog from './GameLog/GameLog'
import GameStatus from './GameStatus/GameStatus'
import GameDevices from './GameDevices/GameDevices'

export default {
  name: 'Game',
  components: {
    GameLog,
    GameDevices,
    GameStatus
  },
  props: {
    _id: {
      type: String,
      required: true
    },
    removeGame: {
      type: Function,
      required: true
    },
    findTimeline: {
      type: Function,
      required: true
    },
    game: {
      type: Object,
      required: true
    }
  },
  computed: {
    timeline() {
        return this.findTimeline({
            query: {
                $filter: {
                    gameId: this._id
                }
            }
        })
    },
    metadata() {
      return this.$gameStats.calculateMetadata(this.timeline, this.game);
    },
    remainingGameTime() {
      return this.metadata.remainingGameTime;
    },
    // gameStatus() {
    //   return this.metadata.gameStatus;
    // },
    // gamePausedDuration() {
    //   return this.metadata.gamePausedDuration;
    // },
    // gameEndTime() {
    //   return this.metadata.gameEndTime;
    // },
    // gameEndTimeHumanized() {
    //   var gameEndTime = this.gameEndTime
    //   if (gameEndTime === 'n/a') return gameEndTime
    //   return moment(gameEndTime).format("dddd, MMMM Do YYYY, h:mm:ss a")
    // },
    // gameStartTime() {
    //   return this.metadata.gameStartTime;
    // },
    // gameStartTimeHumanized() {
    //   var gameStartTime = this.gameStartTime
    //   if (gameStartTime === 'n/a') return gameStartTime
    //   return moment(gameStartTime).format("dddd, MMMM Do YYYY, h:mm:ss a");
    // },
    // gameLength() {
    //   return this.metadata.gameLength;
    // },
    // gameElapsedDuration() {
    //   return this.metadata.gameElapsedDuration;
    // },
    // remainingGameTime() {
    //   return this.metadata.remainingGameTime;
    // }
  },
  methods: {

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
