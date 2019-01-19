<template>
<v-flex xs12 sm12 md8 lg5 xl2>
  <span>
    <v-chip label outline color="green">
      <v-icon left>gamepad</v-icon>{{ this.game.gameName }}
    </v-chip>
  </span>

  <game-status
  :removeGame="removeGame"
  :_id="_id"
  :remainingGameTime="remainingGameTime"></game-status>

  <game-log :timeline="timeline"></game-log>
  <game-devices :iDevs="iDevs"></game-devices>
</v-flex>
</template>

<script>
import {
  mapState,
  mapActions
} from 'vuex';
import GameLog from './GameLog/GameLog';
import GameStatus from './GameStatus/GameStatus';
import GameDevices from './GameDevices/GameDevices';
import * as R from 'ramda';

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
    game: {
      type: Object,
      required: true
    },
    devices: {
      type: Array,
      required: true
    },
    includedDevices: {
      type: Array,
      required: true
    }
  },
  computed: {
    iDevs() {
      const isIncludedDevice = R.compose(R.includes(R.__, this.includedDevices), R.prop('_id'));
      return R.filter(isIncludedDevice, this.devices);
    },
    metadata() {
      return this.$gameStats.calculateMetadata(this.timeline, this.game);
    },
    remainingGameTime() {
      return this.metadata.remainingGameTime;
    }
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
