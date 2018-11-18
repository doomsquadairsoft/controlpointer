<template>
<v-layout>
  <v-flex>
    <v-data-table
      :headers="headers"
      :items="activeTimeline"
      :must-sort="true"
      class="elevation-1"
      :pagination.sync="sortSync"
      >
      <template slot="items" slot-scope="props">
          <td>{{ props.item.action }}</td>
          <td class="text-xs-right">{{ props.item.source }}</td>
          <td class="text-xs-right">{{ props.item.target }}</td>
          <td class="text-xs-right">{{ props.item.createdAt }}</td>
      </template>
    </v-data-table>
  </v-flex>
</v-layout>
</template>

<script>
import {
  mapState,
  mapActions,
  mapGetters
} from 'vuex'

import _ from 'lodash'
import moment from 'moment'
import 'dseg/css/dseg.css'

export default {
  name: 'LifecycleLog',
  data() {
    return {
      sortSync: { descending: true, sortBy: "createdAt" },
      headers: [
        { text: 'Action', value: 'action', sortable: false },
        { text: 'Source', value: 'source', sortable: false },
        { text: 'Target', value: 'target', sortable: false },
        { text: 'Timestamp', value: 'createdAt', sortable: false },
      ]
    }
  },
  props: {
    activeTimeline: {
      type: Array,
      required: true
    }
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
