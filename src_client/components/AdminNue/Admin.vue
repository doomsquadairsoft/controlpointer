<template>
<v-container class="admin pa-2">
  <create-game
    :devices="devices"
  ></create-game>
  <game-list
  :devices="devices"
  :game="game"
  :timeline="timeline"
  ></game-list>
</v-container>
</template>



<script>
import {
  mapState,
  mapGetters,
  mapActions
} from 'vuex'
import GameList from './GameList/GameList'
import CreateGame from './CreateGame/CreateGame'

export default {
  name: 'Admin',
  components: {
    GameList,
    CreateGame
  },
  computed: {
  },
  methods: {
    ...mapActions('game', {
      createGame: 'create',
    })
  },
  props: {
    devices: {
      type: Array,
      required: true
    },
    timeline: {
      type: Array,
      required: true
    },
    game: {
      type: Array,
      required: true
    }
  },
  created() {
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style></style>
