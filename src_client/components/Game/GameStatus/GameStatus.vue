<template>
<v-card class="mt-3 mx-auto" max-width="500">
  <v-card-title primary-title>
    <h3 class="headline">Game Status</h3>
    <v-chip class="ml-3">{{ gameStatusChipText }}</v-chip>
  </v-card-title>
  <div>
    <v-container justify-center class="pt-0 pl-3 pr-3">
      <v-layout row>
        <v-flex xs12>
          <clock :duration="clockDuration"></clock>
        </v-flex>
      </v-layout>
      <v-layout class="mt-2" align-center justify-space-around row fill-height>
        <v-flex shrink>
          <v-btn icon color="success" @click="createStartEvent">
            <v-icon>play_arrow</v-icon>
          </v-btn>
        </v-flex>
        <v-flex shrink>
          <v-btn icon color="warning" @click="createPauseEvent">
            <v-icon>pause</v-icon>
          </v-btn>
        </v-flex>
        <v-flex shrink>
          <v-btn icon color="error" @click="createStopEvent">
            <v-icon>stop</v-icon>
          </v-btn>
        </v-flex>
        <v-flex shrink>
          <v-btn icon color="grey" @click="deleteGame">
            <v-icon>delete_forever</v-icon>
          </v-btn>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</v-card>
</template>

<script>
import {
  mapActions,
  mapGetters,
} from 'vuex'
import Clock from '@/components/Clock/Clock';
import moment from 'moment';
import { ifElse, lt, always, identity, __, isEmpty, last } from 'ramda';
import gameStats from '@/../src_shared/gameStats';

export default {
  name: 'GameStatus',
  components: {
    Clock,
  },
  data: () => ({
    deletable: 1,
    clientSideClockDuration: 0,
    clientSideGamePausedDuration: 0,
    clientSideGameEndTime: 0,
    clientSideRemainingGameTime: 0,
    lastPausedTime: 0,
  }),
  props: {
    gameId: {
      type: String,
      required: true
    },
    timeline: {
      type: Array,
      required: true
    },
    game: {
      type: Array,
      required: true
    },
    myGame: {
      type: Object,
      required: true
    },
    myMetadata: {
      type: Array,
      required: true
    }
  },
  computed: {
    ...mapGetters([
      'devmode'
    ]),
    // ...mapGetters('metadata', {
    //   findMetadataInStore: 'find'
    // }),
    // ...mapGetters('timeline', {
    //   findTimelineInStore: 'find'
    // }),
    // ...mapGetters('game', {
    //   findGameInStore: 'find'
    // }),
    gameStatusChipText() {
      if (isEmpty(this.latestMetadata)) return 'Ready to begin';
      return this.latestMetadata.gameStatus.msg;
    },
    rgtNice() {
      return moment.duration(this.latestMetadata.remainingGameTime).format()
    },
    clockDuration() {
      const gl = this.latestMetadata.gameLength;
      if (this.clientSideRemainingGameTime === null) return gl;
      else return this.clientSideRemainingGameTime;
    },
    latestMetadata() {
      const mdis = last(this.myMetadata);
      if (typeof mdis === 'undefined') return {};
      if (typeof mdis.metadata === 'undefined') return {};
      return mdis.metadata;
    }
  },
  methods: {
    ...mapActions('timeline', {
      createTimelineEvent: 'create',
      // findTimeline: 'find'
    }),
    ...mapActions('metadata', {
      findMetadata: 'find',
    }),
    ...mapActions('game', {
      // findGame: 'find',
      removeGame: 'remove'
    }),
    tick() {
      // since the metadata only updates after a new timeline event is created,
      // we don't want to stress the system by creating unecessary timeline events just so we can see the remainingGameTime.
      // so we work around this by updating the remainingGameTime on the client side
      // we can derive the remainingGameTime using the gameStats library.
      // when the gameStatus is running, we update our client-side remainingGameTime every second.
      // when the gameStatus changes, we can stop updating every second.
      this.calculateClientSideRemainingGameTime();
    },
    calculateClientSideRemainingGameTime() {
      if (isEmpty(this.latestMetadata)) return this.clientSideRemainingGameTime = this.myGame.gameLength;
      const gameStatus = this.latestMetadata.gameStatus.msg;
      const gst = this.latestMetadata.gameStartTime;
      const rgt = this.latestMetadata.remainingGameTime;
      const cap = ifElse(lt(__, 1), always(0), identity());
      const mt = this.latestMetadata.metadataTimestamp;

      const delta = moment().diff(mt) // time since last server update

      if (gameStatus === 'running') {
        this.clientSideRemainingGameTime = cap(rgt - delta);
      }

      if (gameStatus === 'paused' || gameStatus === 'stopped') {
        this.clientSideRemainingGameTime = rgt;
      }
      // console.log(`mt:${mt}, delta:${delta.valueOf()}, cscd:${this.clientSideClockDuration} csrgt:${this.clientSideRemainingGameTime}`);
    },
    createStartEvent() {
      this.createTimelineEvent({
        type: "timeline",
        action: "start",
        source: "admin",
        target: "game",
        gameId: this.gameId,
      }, {});
    },
    createStopEvent() {
      this.createTimelineEvent({
        type: "timeline",
        action: "stop",
        source: "admin",
        target: "game",
        gameId: this.gameId,
      }, {});
    },
    createPauseEvent() {
      this.createTimelineEvent({
        type: "timeline",
        action: "pause",
        source: "admin",
        target: "game",
        gameId: this.gameId,
      }, {});
    },
    deleteGame() {
      if (this.deletable) {
        this.removeGame(this.gameId)
        this.$router.push({
          path: '/game'
        })
      }
    },
  },
  created() {
    this.tickInterval = setInterval(this.tick, 1000);
  },
  beforeDestroy() {
    clearInterval(this.tickInterval);
  }
}
</script>

<style>
.bigchip {
  font-size: 50px;
}

.invis {
  display: none;
}
</style>
