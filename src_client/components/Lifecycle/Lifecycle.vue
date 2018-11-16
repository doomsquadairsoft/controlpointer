<template>
<v-container>
  <v-layout row>
    <h2>Game Lifecycle</h2>
  </v-layout>
  <v-layout column align-space-around>

    <v-card>
      <v-container>
        <v-layout align-center justify-center column>
          <lifecycle-display></lifecycle-display>
          <lifecycle-controls></lifecycle-controls>
        </v-layout>
      </v-container>
    </v-card>
  </v-layout>

</v-container>
</template>

<script>
import {
  mapState,
  mapActions
} from 'vuex'

import LifecycleDisplay from './LifecycleDisplay'
import LifecycleControls from './LifecycleControls'

export default {
  name: 'Lifecycle',
  props: {

  },
  computed: {

  },
  methods: {},
  components: {
    LifecycleControls,
    LifecycleDisplay
  }
}
</script>

<style scoped>
</style>
