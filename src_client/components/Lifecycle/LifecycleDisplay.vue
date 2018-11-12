<template>
  <v-flex>
    <div class="text-xs-center">
      <p>Remaining Game Time</p>
      <span class="display-2 font-weight-black">{{ remainingGameTime }}</span>
    </div>
  </v-flex>
</template>

<script>
import {
  mapState,
  mapActions,
  mapGetters
} from 'vuex'

import store from '@/store'


export default {
  name: 'LifecycleDisplay',
  props: {

  },
  computed: {
    ...mapState('game',
      'game'
    ),
    ...mapGetters('game', {
      findGame: 'find'
    }),
    remainingGameTime () {
      var res = this.findGame().data[0]
      if (typeof res === 'undefined')
        res = '4:44'
      return res
    }
  },
  methods: {
  }
}
</script>

<style scoped>
  .bigchip {
    font-size: 50px;
  }
</style>
