<template>
  <v-flex>
    <div class="text-xs-center">
      <p>Remaining Game Time</p>
      <span class="display-2 font-weight-black">{{ remainingGameTime }}</span>

      <p>Game Duration</p>
      <span class="font-weight-black">{{ gameDuration }}</span>
    </div>
  </v-flex>
</template>

<script>
import {
  mapState,
  mapActions,
  mapGetters
} from 'vuex'

import _ from 'lodash'
import store from '@/store'
import moment from 'moment'

export default {
  name: 'LifecycleDisplay',
  props: {

  },
  computed: {
    ...mapState('game', 'game'),
    ...mapState('timeline', 'timeline'),
    ...mapGetters('timeline', {
      findTimeline: 'find',
      createTimelineEvent: 'create',
    }),
    ...mapGetters('game', {
      findGame: 'find',
      gameDuration: 'find'
    }),
    gameTimeEnd () {
      moment(this.gameStartTime).add(this.gameDuration)
    },
    gameDuration () {
      return this.findGame({ $limit: 1, $sort: -1 })
    },
    remainingGameTime () {

      var res = this.findTimeline().data
      var createdAts = _.map(res, (r) => {
        return moment(r.createdAt).format()
      });
      return _.reduce(createdAts, (r, a) => {
        return moment(r).subtract(a)
      })
      console.log(createdAts)
      return 5
      // return _.reduce(res, function (r, n) {
      //   console.log(`r=${r.createdAt} and n=${n.createdAt}`)
      //   console.log(n)
      //   return r.createdAt
      // }, 1)
    }
  },
  created() {
    this.findTimeline();
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
