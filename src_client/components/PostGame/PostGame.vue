
<template>
<div>
  <v-container class="mb-0 pb-0">
    <v-layout row wrap>
      <v-flex class="mb-3">
        <h1>Postgame Report</h1>
        <h3>GameID <router-link :to="gameLink">{{ this.gameId }}</router-link></h3>
      </v-flex>
      <v-flex>
        <qrcode :value="thisPageUrl" tag="img"></qrcode>
      </v-flex>
    </v-layout>
  </v-container>
  <v-container class="ma-0">
    <v-layout column>
      <template v-for="(t, i) in myTimeline">

        <v-card class="mb-3">
          <v-container>
            <v-layout column>
              <v-flex class="mb-3"> <!-- card title flex -->
                <h4>Step {{ i }}</h4>
                <hr>
              </v-flex>

              <v-flex> <!-- content flex -->
                <v-layout row>
                  <v-flex> <!-- timeline flex -->
                    <h5>Event</h5>
                    <ul>
                      <li>type: {{ t.type }}</li>
                      <li>action: {{ t.action }}</li>
                      <li>source: {{ t.source }}</li>
                      <li>target: {{ t.target }}</li>
                      <li>targetId: {{ t.targetId }}</li>
                      <li>createdAt: {{ t.createdAt }}</li>
                      <li>gameId: {{ t.gameId }}</li>
                      <li>_id: {{ t._id }}</li>
                    </ul>
                  </v-flex>

                  <v-flex> <!-- metadata flex -->
                    <h5>Metadata</h5>
                    {{ myMetadata[i] ? myMetadata[i] : 'metadata missing' }}
                    <ul>
                    </ul>
                  </v-flex>

                </v-layout>
              </v-flex>
            </v-layout>
        </v-container>
        </v-card>


      </template>

    </v-layout>
  </v-container>
</div>
</template>

<script>
import { addIndex } from 'ramda';
import moment from 'moment';
import {
  mapGetters,
  mapActions
} from 'vuex';

module.exports = {
  name: 'PostGame',
  components: {
  },
  props: {

  },
  data: () => ({

  }),
  created() {
    this.findMetadata();
    this.findTimeline();
  },
  destroyed() {},
  computed: {
    ...mapGetters('timeline', {
      findTimelineInStore: 'find'
    }),
    ...mapGetters('metadata', {
      findMetadataInStore: 'find'
    }),
    myMetadata() {
      return this.findMetadataInStore({
        query: {
          $sort: {
            createdAt: 1
          },
          gameId: this.gameId
        }
      }).data
    },
    gameId() {
      return this.$route.params.gameId;
    },
    myTimeline() {
      return this.findTimelineInStore({
        query: {
          $sort: {
            createdAt: 1
          },
          gameId: this.gameId

        }
      }).data
    },
    gameLink() {
        return `/game/${this.gameId}`;
    },
    thisPageUrl() {
      return window.location.href
    }
  },
  methods: {
    ...mapActions('timeline', {
      findTimeline: 'find'
    }),
    ...mapActions('metadata', {
      findMetadata: 'find'
    }),
  }
};
</script>


<style>

</style>
