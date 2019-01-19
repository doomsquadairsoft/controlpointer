<template>
<v-container class="admin pa-2">
  <create-game
    :devices="devices"
  ></create-game>
  <game-list
  :devices="devices"
  :game="game.data"
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
    ...mapGetters('game', {
      findGameInStore: 'find'
    }),
    game() {
      return this.findGameInStore({
        query: {
          $sort: {
            createdAt: 1
          }
        }
      })
    }
  },
  methods: {
    ...mapActions('game', {
      createGame: 'create',
      findGame: 'find'
    })
  },
  props: {
    devices: {
      type: Array,
      required: true
    }
  },
  created() {
    this.findGame();
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style></style>
