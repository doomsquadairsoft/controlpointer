<template>
<v-flex>
  <div class="text-xs-center">
    <!-- <p class="digital">{{ remainingGameTime }}</p> -->
    <p>Lifecycle Display</p>
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
import 'dseg/css/dseg.css'

export default {
  name: 'LifecycleDisplay',
  data() {
    return {
      tick: 0,
      rt: 777
    }
  },
  props: {
    // remainingGameTime: {
    //   type: Number,
    //   required: true
    // }
  },
  methods: {

  },
  computed: {

  },
  created() {

  }
}
</script>

<style scoped>
.bigchip {
  font-size: 50px;
}
.digital {
  font-size: 10vh;
  color: cyan;
  background-color: black;
  margin: 5vh 0 5vh 0;
  padding: 0;
  font-family: 'DSEG7-Modern';
}
.invis {
  display: none;
}
</style>
