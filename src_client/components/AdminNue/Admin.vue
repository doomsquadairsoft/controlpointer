<template>
<v-container class="admin">
  <create-game></create-game>
  <game-list
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
    }
  },
  methods: {
    ...mapActions('game', {
      createGame: 'create'
    })
  },
  created() {
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style></style>
