<template>
<div>
  <doom-alert level="error" v-if="!myGateway">
    No gateway exists with this ID. Return to the <router-link to="/gateway">Gateway List</router-link>
  </doom-alert>
  <v-container v-if="myGame">
    <v-layout>

      <v-flex xs12 sm12 md8 lg5 xl2>
        <h1>{{ myGame.gameName }}</h1>

        <game-status :timeline="timeline" :myMetadata="myMetadata" :game="game" :myGame="myGame" :gameId="myGame._id"></game-status>

        <game-devices :iDevs="iDevs" :myGame="myGame"></game-devices>
        <game-log :myTimeline="myTimeline"></game-log>

        <v-btn color="red" small fab fixed bottom right @click="VueScrollTo.scrollTo('head')">
          <v-icon>keyboard_arrow_up</v-icon>
        </v-btn>
      </v-flex>
    </v-layout>
  </v-container>
</div>
</template>

<script>
import {
  mapGetters,
  mapActions
} from 'vuex';
import GameLog from './GameLog/GameLog';
import GameStatus from './GameStatus/GameStatus';
import GameDevices from './GameDevices/GameDevices';
import DoomAlert from '@/components/DoomAlert/DoomAlert';
import {
  find,
  propEq,
  map,
  filter,
  last,
  isEmpty,
} from 'ramda';
import {
  throttle
} from 'lodash';
import VueScrollTo from 'vue-scrollto';

export default {
  name: 'Game',
  components: {
    GameLog,
    GameDevices,
    GameStatus,
    DoomAlert
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
    },
    metadata: {
      type: Array,
      required: true
    }
  },
  computed: {
    ...mapGetters([
      'theme',
      'devmode'
    ]),
    ...mapGetters('metadata', {
      findMetadataInStore: 'find'
    }),
    myMetadata() {
      if (isEmpty(this.metadata)) return [];
      const md = filter(propEq('gameId', this.gameIdViaRoute))(this.metadata);
      return md;
    },
    latestMetadata() {
      return last(this.myMetadata);
    },
    gameName() {
      return this.game.gameName;
    },
    iDevs() {
      // const
      const isIncludedDevice = find(propEq(this.includedDevices));
      const includedDevices = this.includedDevices;
      const devices = this.devices;

      // I want DEVICE OBJECTS derived from {Array} this.includedDevices
      const getDeviceObject = (deviceId) => {
        return find(propEq('_id', deviceId), devices);
      }

      const result = map(getDeviceObject, includedDevices);
      return result;
    },
    remainingGameTime() {
      return this.metadata.remainingGameTime;
    },
    myGame() {
      const mg = find(propEq('_id', this.gameIdViaRoute))(this.game);
      return mg;
    },
    gameIdViaRoute() {
      return this.$route.params.gameId;
    },
    myTimeline() {
      const mt = filter(propEq('gameId', this.gameIdViaRoute))(this.timeline);
      return mt;
    },
    includedDevices() {
      return this.myGame.includedDevices;
    }
  },
  methods: {
    ...mapActions('metadata', {
      findMetadata: 'find'
    }),
    // updateMetadata() {
    //   const doUpdateMetadata = () => {
    //     console.log('updating metadata right meow 🐈')
    //     const metadata = this.$gameStats.calculateMetadata(this.myTimeline, this.myGame);
    //     this.setMetadata(metadata); // send to vuex
    //   };
    //   throttle(doUpdateMetadata, 1000, {leading: true});
    // },
  },
  created() {
    this.findMetadata();
  }
  // watch: {
  //   myTimeline: 'updateMetadata',
  // }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
