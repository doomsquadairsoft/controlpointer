<template>
<div v-if="game">
  <v-container  class="pa-0 pt-3">
    <v-card>
      <v-card-title>
        <h3 class="headline mb-0">Existing Games</h3>
      </v-card-title>
      <doom-alert v-if="game.length < 1" level="warning">
        There are no games. Please ceate a game below.
      </doom-alert>
      <v-list>
        <v-list-tile v-for="g in game" :key="g._id" avatar>

          <v-list-tile-avatar>
            <v-badge right>
              <v-icon large color="grey">
                flag
              </v-icon>
            </v-badge>
          </v-list-tile-avatar>

          <v-list-tile-content>
            <v-list-tile-title>{{ g.gameName }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ gameModeDisplay(g) }}</v-list-tile-sub-title>
          </v-list-tile-content>

          <v-list-tile-action>
            <v-layout row>
              <v-btn color="info" :to="linkToGame(g)">
                <v-icon>send</v-icon>Select
              </v-btn>
            </v-layout>
          </v-list-tile-action>

        </v-list-tile>
      </v-list>
    </v-card>
  </v-container>
  <v-container class="pa-0">
    <create-game :devices="devices"></create-game>
  </v-container>

</div>
</template>

<script>
import * as R from 'ramda';
import CreateGame from '@/components/CreateGame/CreateGame';
import DoomAlert from '@/components/DoomAlert/DoomAlert';

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
    CreateGame,
    DoomAlert
  },
  computed: {

    // includedDevices() {
    //   return this.game.includedDevices;
    // },
  },
  methods: {
    ...mapActions('game', {
      removeGame: 'remove'
    }),
    gameModeDisplay: function (game) {
      return R.cond([
        [R.equals('sectorControl'), R.always('Sector Control')],
        [R.equals('domination'), R.always('Domination')],
        [R.equals('cs'), R.always('Counter-Strike')],
        [R.either(R.isEmpty(), R.isNil()), R.always('Sector Control')],
      ])(game.gameMode);
    },
    linkToGame: function (g) {
      return `/game/${g._id}`
    },
  }
}
</script>

<style></style>
