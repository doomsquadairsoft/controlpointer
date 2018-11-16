<template>
<v-flex>
  <v-layout row>
    <v-slider v-model="gameDuration" :max="255" label="Game Time (in minutes)">
    </v-slider>
    <v-flex xs3>
      <v-text-field v-model="gameDuration" class="mt-0" type="number">
      </v-text-field>
    </v-flex>
    <v-flex xs3>
      <v-btn color="primary" @click="doCreateGame">
        Create game
      </v-btn>
    </v-flex>
  </v-layout>
  <v-btn color="success" @click="createStartEvent">
    <v-icon>play_arrow</v-icon>
  </v-btn>
  <v-btn color="warning" @click="createPauseEvent">
    <v-icon>pause</v-icon>
  </v-btn>
  <v-btn color="error" @click="createStopEvent">
    <v-icon>stop</v-icon>
  </v-btn>
</v-flex>
</template>

<script>
import {
  mapState,
  mapActions
} from 'vuex'

import store from '@/store'


export default {
  name: 'LifecycleControls',
  data () {
    return {
      gameDuration: 5
    }
  },
  props: {

  },
  computed: {

  },
  methods: {
    ...mapState('game', 'game'),
    ...mapActions('timeline', {
      createTimelineEvent: 'create',
      removeDevice: 'remove'
    }),
    ...mapActions('game', {
      createGame: 'create'
    }),
    doCreateGame () {
      console.log(`doing create game with gameDuration=${this.gameDuration}`)
      this.createGame({
        duration: 1000*60*this.gameDuration
      }, {});
    },
    createStartEvent () {
      console.log('Creating game start timeline event ' + this._id)
      this.createTimelineEvent({
          type: "timeline",
          action: "start"
        }, {});
    },
    createPauseEvent () {
      console.log('creating pause event')
      this.createTimelineEvent({
          type: "timeline",
          action: "pause"
        }, {});
    },
    createStopEvent () {
      console.log('creating stop event')
      this.createTimelineEvent({
          type: "timeline",
          action: "stop"
        }, {});
    },
  }
}
</script>

<style scoped>
</style>
