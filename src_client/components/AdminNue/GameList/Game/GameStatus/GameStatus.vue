<template>
<v-card class="mt-3 mx-auto" max-width="500">
  <v-card-title primary-title>
    <div>
      <h3 class="headline">Game Status</h3>
      <p class="text-xs-center digital">{{ remainingGameTime || '00:00:00' }}</p>
      <v-btn color="success" @click="createStartEvent">
        <v-icon>play_arrow</v-icon>
      </v-btn>
      <v-btn color="warning" @click="createPauseEvent">
        <v-icon>pause</v-icon>
      </v-btn>
      <v-btn color="error" @click="createStopEvent">
        <v-icon>stop</v-icon>
      </v-btn>
      <v-btn color="grey" @click="deleteGame">
        <v-icon>delete_forever</v-icon>
      </v-btn>
    </div>
  </v-card-title>
</v-card>
</template>

<script>
import {
  mapActions
} from 'vuex'


export default {
  name: 'GameStatus',
  components: {

  },
  props: {
    removeGame: {
      type: Function,
      required: true
    },
    _id: {
      type: String,
      required: true
    },
    remainingGameTime: {
      required: true
    }
  },
  computed: {

  },
  methods: {
    ...mapActions('timeline', {
      createTimelineEvent: 'create',
    }),
    createStartEvent() {
      this.createTimelineEvent({
        type: "timeline",
        action: "start",
        source: "admin",
        target: "game"
      }, {});
    },
    createStopEvent() {
      console.log('DEPRECATED');
      // this.createTimelineEvent({
      //     type: "timeline",
      //     action: "stop",
      //     source: "admin",
      //     target: "game"
      //   }, {});
    },
    createPauseEvent() {
      this.createTimelineEvent({
        type: "timeline",
        action: "pause",
        source: "admin",
        target: "game"
      }, {});
    },
    deleteGame() {
      if (this.deletable) {
        this.removeGame(this._id)
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

.digital {
  font-size: 8vh;
  color: cyan;
  background-color: black;
  margin: 5vh 0 5vh 0;
  padding: 0;
  font-family: 'DSEG7-Modern';
}

.invis {
  display: none;
}
</style>
