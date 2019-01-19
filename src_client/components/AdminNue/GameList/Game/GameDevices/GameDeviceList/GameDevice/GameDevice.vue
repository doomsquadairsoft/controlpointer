<template>
  <v-list-tile-action>
    <v-icon v-for="d in iDevs" color="purple">star</v-icon>
  </v-list-tile-action>
</template>

<script>
  export default {
    name: 'GameDevice',
    components: {

    },
    props: {
      iDevs: {
        type: Array,
        required: true
      }
    }
  }
</script>

<style>
</style>
