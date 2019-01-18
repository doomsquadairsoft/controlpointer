<template>
<v-flex>
    <v-layout row>
      <v-flex xs6>
        <v-text-field v-model="gameLengthInput" class="mt-0" label="Game Length (hh:mm:ss)" type="time-with-seconds">
        </v-text-field>
      </v-flex>
      <v-flex xs3>
        <v-btn color="grey" @click="doUseDefaultGameLength">
          <v-icon>timer</v-icon> Use default (15 minutes)
        </v-btn>
      </v-flex>
    </v-layout>

    <v-layout row>
      <v-flex xs6>
        <v-text-field v-model="captureRateInput" class="mt-0" label="Capture Rate (hh:mm:ss)" type="time-with-seconds">
        </v-text-field>
      </v-flex>
      <v-flex xs3>
        <v-btn color="grey" @click="doUseDefaultCaptureRate">
          <v-icon>timer</v-icon> Use default (5 seconds)
        </v-btn>
      </v-flex>
    </v-layout>

    <v-layout row>
      <v-flex xs3>
        <v-btn color="primary" @click="doCreateGame">
          Create game
        </v-btn>
      </v-flex>
    </v-layout>

    <gameList
    :game="game.data"
    ></gameList>

  </v-flex>
</template>

<script>
import {
  mapState,
  mapActions,
  mapGetters
} from 'vuex'

import store from '@/store';
import moment from 'moment';
import 'moment-duration-format';
import GameList from '@/components/Admin/GameList'


export default {
  name: 'LifecycleControls',
  components: {
    GameList,
  },
  data () {
    return {
      gameLengthInput: '00:00:00',
      captureRateInput: '00:00:00',
      defaultGameLength: '00:15:00',
      defaultCaptureRate: '00:00:05',
      gameId: null
    }
  },
  created () {
    this.findGame();
  },
  props: {

  },
  computed: {
    ...mapGetters('game', {
      findGame: 'find'
    }),
    game() {
      return this.findGame({
        query: {
          $sort: {
            createdAt: 1
          }
        }
      })
    },
    gameLength() {
      return moment.duration(this.gameLengthInput);
    },
    captureRate() {
      return moment.duration(this.captureRateInput);
    },
    captureRateLabel() {
      return `Capture Rate (${this.captureRate})`;
    },
  },
  methods: {
    ...mapState('game', 'game'),
    ...mapActions('timeline', {
      createTimelineEvent: 'create',
      removeDevice: 'remove'
    }),
    ...mapActions('game', {
      removeGame: 'remove',
      createGame: 'create'
    }),
    doCreateGame () {
      console.log(`doing create game with gameLength=${this.gameLength}`)
      const test = this.createGame({
        gameLength: this.gameLength,
        captureRate: this.captureRate,
      }, {});
      test.then((response) => {
        this.gameId = response._id;
      })
    },
    doUseDefaultGameLength () {
      this.gameLengthInput = this.defaultGameLength;
    },
    doUseDefaultCaptureRate () {
      this.captureRateInput = this.defaultCaptureRate;
    },
    createStartEvent () {
      console.log('Creating game start timeline event ' + this._id)
      this.createTimelineEvent({
          type: "timeline",
          action: "start",
          source: "admin",
          target: "game"
        }, {});
    },
    createPauseEvent () {
      console.log('creating pause event')
      this.createTimelineEvent({
          type: "timeline",
          action: "pause",
          source: "admin",
          target: "game"
        }, {});
    },
    createStopEvent () {
      console.log('creating stop event')
      this.createTimelineEvent({
          type: "timeline",
          action: "stop",
          source: "admin",
          target: "game"
        }, {});
    },
    deleteGame () {
      console.log('deleting game');
      this.removeGame(gameId, {});
    }
  }
}
</script>

<style scoped>
  .invis {
    display: none;
  }
</style>
