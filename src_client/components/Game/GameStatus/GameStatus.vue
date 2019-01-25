this.latestMetadata<template>
<v-card class="mt-3 mx-auto" max-width="500">
  <v-card-title primary-title>
    <h3 class="headline">Game Status</h3>
    {{ latestMetadata }}
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

export default {
  name: 'GameStatus',
  components: {
    Clock,
  },
  props: {
    gameId: {
      type: String,
      required: true
    }
  },
  computed: {
    ...mapGetters([
      'devmode'
    ]),
    ...mapGetters('metadata', {
      findMetadataInStore: 'find'
    }),
    ...mapGetters('timeline', {
      findTimelineInStore: 'find'
    }),
    ...mapGetters('game', {
      findGameInStore: 'find'
    }),
    clockDuration() {
      const rgt = this.latestMetadata.remainingGameTime;
      const gl = this.latestMetadata.gameLength;
      if (rgt === null && gl === null) return 0;
      if (rgt === null) return gl;
      return rgt;
    },
    latestMetadata() {
      const mdis = this.findMetadataInStore({
        query: {
          $sort: {
            createdAt: -1
          },
          $limit: 1,
          gameId: this.gameId
        }
      });
      if (typeof mdis === 'undefined') return {};
      if (typeof mdis.data === 'undefined') return {};
      if (mdis.data.length < 1) return {};
      if (typeof mdis.data[0].metadata === 'undefined') return {};
      return mdis.data[0].metadata;
    },
  },
  methods: {
    ...mapActions('timeline', {
      createTimelineEvent: 'create',
      findTimeline: 'find'
    }),
    ...mapActions('metadata', {
      findMetadata: 'find',
    }),
    ...mapActions('game', {
      findGame: 'find',
      removeGame: 'remove'
    }),
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
    this.findTimeline();
    this.findGame();
    this.findMetadata();
    this.interval = setInterval(this.tick, 1000)
  },
  beforeDestroy () {
    clearInterval(this.interval);
  },
  data: () => ({
    deletable: 1,
  })
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
