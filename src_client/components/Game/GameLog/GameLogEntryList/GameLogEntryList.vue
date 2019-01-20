<template>
<v-list>
  <v-list>
    <v-list-tile v-for="t in timeline" :key="t._id" avatar>

      <v-list-tile-avatar>
        <v-badge v-if="t.action === 'pause'" right>
          <v-icon large color="grey">
            pause
          </v-icon>
        </v-badge>
        <v-badge v-if="t.action === 'start'" right>
          <v-icon large color="grey">
            play_arrow
          </v-icon>
        </v-badge>
        <v-badge v-if="t.action === 'stop'" right>
          <v-icon large color="grey">
            stop
          </v-icon>
        </v-badge>
        <v-badge v-if="t.action === 'cap_blu'" right>
          <v-icon large color="blue">
            check
          </v-icon>
        </v-badge>
      </v-list-tile-avatar>

      <v-list-tile-content>
        <v-list-tile-title>[{{ timestamp(t) }}] {{ t.source }} {{ t.action }} {{ t.target }}</v-list-tile-title>
      </v-list-tile-content>

      <v-list-tile-action>
        <v-layout row>

        </v-layout>
      </v-list-tile-action>

    </v-list-tile>
  </v-list>
</v-list>
</template>

<script>
import GameLogEntry from './GameLogEntry/GameLogEntry';
import di from '@/assets/futuristic_ammo_box_01.png';
import moment from 'moment';

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
  methods: {
    timestamp: (t) => {
      return moment(t.createdAt).format('HH:mm');
    }
  }
}
</script>

<style>
</style>
