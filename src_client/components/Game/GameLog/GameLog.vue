<template>
<v-card class="mt-3 mx-auto" max-width="500">
  <v-card-title primary-title>
    <div>
      <h3 class="headline">Game Log</h3>
    </div>
  </v-card-title>
  <game-log-entry-list :myTimeline="myTimeline"></game-log-entry-list>
</v-card>
</template>

<script>
  import GameLogEntryList from './GameLogEntryList/GameLogEntryList';
  export default {
    name: 'GameLog',
    components: {
      GameLogEntryList
    },
    props: {
      myTimeline: {
        type: Array,
        required: true
      }
    }
  }
</script>

<style>
</style>
