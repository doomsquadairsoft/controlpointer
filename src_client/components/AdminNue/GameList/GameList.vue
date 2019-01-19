<template>
<div>
  <game
  v-for="g in game"
  :devices="devices"
  :game="g"
  :key="g._id"
  :_id="g._id"
  :removeGame="removeGame"
  :includedDevices="g.includedDevices"
  :findTimeline="findTimeline"></game>
</div>
</template>

<script>
import Game from './Game/Game.vue'
import {
  mapActions,
  mapGetters
} from 'vuex'


export default {
  name: 'GameList',
  data() {
    return {
      placeholder: 'PLACEHOLDER',
      test: 'hi'
    }
  },
  props: {
    game: {
      type: Array,
      required: true
    },
    devices: {
      type: Array,
      required: true
    }
  },
  components: {
    Game
  },
  computed: {
    ...mapGetters('timeline', {
      findTimeline: 'find'
    }),
    includedDevices() {
      return this.game.includedDevices;
    },
  },
  methods: {
    ...mapActions('game', {
      removeGame: 'remove'
    })
  }
}
</script>

<style></style>
