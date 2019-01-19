<template>
<v-list>
  <v-list>
    <v-list-tile v-for="t in timeline" :key="d._id" avatar>

      <v-list-tile-avatar>
        <img :src="deviceImage"></img>
      </v-list-tile-avatar>

      <v-list-tile-content>
        <v-list-tile-title>{{ t.target }}</v-list-tile-title>
      </v-list-tile-content>

      <v-list-tile-action>
        <v-icon color="blue">star</v-icon>
        <v-layout row>
          <v-badge right>
            <v-icon large color="grey lighten-1">
              edit
            </v-icon>
          </v-badge>
        </v-layout>
      </v-list-tile-action>

    </v-list-tile>
  </v-list>
</v-list>
</template>

<script>
import GameLogEntry from './GameLogEntry/GameLogEntry';
import di from '@/assets/futuristic_ammo_box_01.png'


export default {
  name: 'GameLogEntryList',
  components: {
    GameLogEntry
  },
  props: {
    timeline: {
      type: Array,
      required: true
    }
  },
  computed: {
    deviceImage: () => di,
  },
}
</script>

<style>
</style>
