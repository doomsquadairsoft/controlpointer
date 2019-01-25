<template>
<v-card class="mt-3 mx-auto" max-width="500">
  <v-card-title primary-title>
    <h3 class="headline">Game Status</h3>
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

export default {
  name: 'GameStatus',
  components: {
    Clock,
  },
  props: {
    myGame: {
      type: Object,
      required: true
    },
    myTimeline: {
      type: Array,
      required: true
    },
    metadata: {
      type: Object,
      required: true
    }
  },
  computed: {
    ...mapGetters([
      'devmode'
    ]),
    clockDuration() {
      const rgt = this.metadata.remainingGameTime;
      const gl = this.metadata.gameLength;
      if (rgt === null) return gl;
      return rgt;
    }
  },
  methods: {
    ...mapActions('timeline', {
      createTimelineEvent: 'create',
    }),
    ...mapActions('game', {
      removeGame: 'remove'
    }),
    createStartEvent() {
      this.createTimelineEvent({
        type: "timeline",
        action: "start",
        source: "admin",
        target: "game",
        gameId: this.myGame._id,
      }, {});
    },
    createStopEvent() {
      this.createTimelineEvent({
        type: "timeline",
        action: "stop",
        source: "admin",
        target: "game",
        gameId: this.myGame._id,
      }, {});
    },
    createPauseEvent() {
      this.createTimelineEvent({
        type: "timeline",
        action: "pause",
        source: "admin",
        target: "game",
        gameId: this.myGame._id,
      }, {});
    },
    deleteGame() {
      if (this.deletable) {
        this.removeGame(this.myGame._id)
        this.$router.push({
          path: '/game'
        })
      }
    }
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
