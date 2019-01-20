<template>
  <v-container>
    <v-layout>
      <v-flex xs12 sm12 md8 lg5 xl2 v-if="myGame">

        <game-status
        :myGame="myGame"
        :timeline="timeline"
        :remainingGameTime="remainingGameTime"></game-status>

        <game-devices :iDevs="iDevs"></game-devices>
        <game-log :timeline="timeline"></game-log>

      </v-flex>
    </v-layout>
  </v-container>
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
    game: {
      type: Array,
      required: true
    },
    devices: {
      type: Array,
      required: true
    },
    timeline: {
      type: Array,
      required: true
    }
  },
  computed: {
    gameName() {
      return this.myGame.gameName;
    },
    iDevs() {
      // const
      const isIncludedDevice = R.find(R.propEq(this.includedDevices));
      const includedDevices = this.includedDevices;
      const devices = this.devices;

      // I want DEVICE OBJECTS derived from {Array} this.includedDevices
      const getDeviceObject = (deviceId) => {
        return R.find(R.propEq('_id', deviceId), devices);
      }

      const result = R.map(getDeviceObject, includedDevices);
      return result;
    },
    metadata() {
      if (R.isNil(this.myGame)) return {};
      return this.$gameStats.calculateMetadata(this.timeline, this.myGame);
    },
    remainingGameTime() {
      return this.metadata.remainingGameTime;
    },
    myGame() {
      const gameIdViaRoute = this.$route.params.gameId;
      const mg = R.find(R.propEq('_id', gameIdViaRoute))(this.game);
      return mg;
    },
    includedDevices() {
      return this.myGame.includedDevices;
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
