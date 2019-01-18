<template>
<v-flex xs12 sm12 md8 lg5 xl2>
  <p>createdAt:{{ this.createdAt }}</p>
  <v-btn color="success" @click="createStartEvent">
    <v-icon>play_arrow</v-icon>
  </v-btn>
  <v-btn color="warning" @click="createPauseEvent">
    <v-icon>pause</v-icon>
  </v-btn>
  <v-btn color="error" @click="createStopEvent">
    <v-icon>stop</v-icon>
  </v-btn>
  <v-btn color="darkgrey" @click="deleteGame">
    <v-icon>delete_forever</v-icon>
  </v-btn>
</v-flex>
</template>

<script>
import {
  mapState,
  mapActions
} from 'vuex'


export default {
  name: 'game',
  props: {
    _id: String,
    createdAt: {
      type: Number,
      required: true
    },
    gameLength: {
      type: Number,
      required: true
    },
    captureRate: {
      type: Number,
      required: true
    },
    removeGame: {
      type: Function,
      required: true
    }
  },
  computed: {
    // metadata() {
    //   return this.$gameStats.calculateMetadata(this.findTimelineInStore, this.findGameInStore)
    // },
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
    deleteGame: function() {
      if (this.deletable) {
        this.removeDevice(this._id)
      }
    }
  },
  data: () => ({
    deletable: 0,
  })
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
