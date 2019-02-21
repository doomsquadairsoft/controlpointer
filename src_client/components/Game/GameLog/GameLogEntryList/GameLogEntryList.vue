<template>
<div>
  <v-container class="pa-0 pb-2">
    <v-layout>
      <v-flex>
        <v-btn color="info" small @click="scrollToBottom">
          <v-icon>arrow_downward</v-icon>Scroll to bottom
        </v-btn>
        <v-btn color="purple" small :to="postgameRoute">
          <v-icon>assignment</v-icon>Postgame Report
        </v-btn>
        <v-btn color="green" small @click="goToMap">
          <v-icon>satellite</v-icon>Map
        </v-btn>
      </v-flex>
    </v-layout>
  </v-container>

  <div style="max-height: 400px" class="scroll-y" id="scroll-target">
    <v-list v-scroll:#scroll-target="onScroll">
      <v-list-tile v-for="t in myTimeline" :key="t._id" avatar>

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
          <v-badge v-if="t.action === 'cap_red'" right>
            <v-icon large color="red">
              check
            </v-icon>
          </v-badge>
          <v-badge v-if="t.action === 'cap_unc'" right>
            <v-icon large color="grey">
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
    <div>

    </div>
  </div>
</div>
</template>

<script>
import GameLogEntry from './GameLogEntry/GameLogEntry';
import di from '@/assets/futuristic_ammo_box_01.png';
import moment from 'moment';
import { mapGetters } from 'vuex';
import VueScrollTo from 'vue-scrollto';

export default {
  name: 'GameLogEntryList',
  data() {
    return {
    }
  },
  components: {
    GameLogEntry
  },
  props: {
    myTimeline: {
      type: Array,
      required: true
    }
  },
  computed: {
    deviceImage: () => di,
    gameId () { return this.$route.params.gameId },
    postgameRoute () { return `/postgame/${this.gameId}` },
  },
  methods: {
    timestamp(t) {
      return moment(t.createdAt).format('HH:mm');
    },
    scrollToBottom() {
      const t = this.$el.querySelector('#scroll-target');
      t.scrollTop = t.scrollHeight; // scroll the log box
      VueScrollTo.scrollTo('#bottom'); // scroll the page
    },
    onScroll(e) {
      if (e.target.scrollTop - (e.target.scrollHeight - e.target.offsetHeight) === 0)
        this.$store.commit('setScrolledToBottom');
      else this.$store.commit('unsetScrolledToBottom');
    },
    goToMap() {
      this.$router.push({
        path: `/map/${this.gameId}`
      });
    },
  },
  mounted() {
  }
}
</script>

<style>
.loglist {
  max-height: 500px;
  overflow-y: scroll;
}
.hoveraction {
  z-index: 500;
  background-color: black;
}
</style>
