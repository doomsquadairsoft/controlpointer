<template>
  <v-list-tile-action>
    <p>gameDevice {{ dev.did }}</p>
  </v-list-tile-action>
</template>

<script>
  export default {
    name: 'GameDevice',
    components: {

    },
    props: {
      dev: {
        type: Object,
        required: true
      }
    }
  }
</script>

<style>
</style>
