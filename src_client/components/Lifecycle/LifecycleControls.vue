<template>
  <v-flex>
      <v-btn color="success"><v-icon>play_arrow</v-icon></v-btn>
      <v-btn color="warning"><v-icon>pause</v-icon></v-btn>
      <v-btn color="error"><v-icon>stop</v-icon></v-btn>
  </v-flex>
</template>

<script>
import {
  mapState,
  mapActions
} from 'vuex'

import store from '@/store'


export default {
  name: 'LifecycleControls',
  props: {

  },
  computed: {

  },
  methods: {
  }
}
</script>

<style scoped>
</style>
