<template>
<v-flex>
  <div :class="{ 'invis': isGame }">
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
  </div>
  <div :class="{ 'invis': !isGame }">
    <v-btn color="success" @click="createStartEvent">
      <v-icon>play_arrow</v-icon>
    </v-btn>
    <v-btn color="warning" @click="createPauseEvent">
      <v-icon>pause</v-icon>
    </v-btn>
    <v-btn color="error" @click="createStopEvent">
      <v-icon>stop</v-icon>
    </v-btn>
  </div>
</v-flex>
</template>

<script>
import {
  mapState,
  mapActions,
  mapGetters
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
    isGame () {
      return this.findGameInStore().data.length < 1 ? false : true
    },
    ...mapGetters('game', {
      findGameInStore: 'find'
    })
  },
  methods: {
    ...mapState('game', 'game'),
    ...mapActions('timeline', {
      createTimelineEvent: 'create',
      removeDevice: 'remove'
    }),
    ...mapActions('game', {
      findGame: 'find'
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
  }
}
</script>

<style scoped>
  .invis {
    display: none;
  }
</style>
