<template>
<v-card class="mt-3 mx-auto" max-width="500">
  <div>
  <v-card-title primary-title id="create-game-header">
      <v-layout column>
        <v-flex xs12>
          <span class="headline">Create Game</span>
        </v-flex>
        <v-flex xs12>
          <doom-alert v-if="isNotifyingInvalid" level="error">Invalid Input. Fix errors below then try again.</doom-alert>
          <doom-alert v-if="isGameCreated" level="info">Game created. <router-link :to="this.latestGame.link">{{ this.latestGame.name }}</router-link></doom-alert>
        </v-flex>
      </v-layout>
  </v-card-title>

  <div>
    <v-form ref="form">
      <v-container>
        <v-layout row wrap>
          <v-flex xs12>
            <v-text-field v-model="gameNameInput" label="Name your game" type="time-with-seconds">
            </v-text-field>
          </v-flex>
        </v-layout>

        <v-layout row wrap>
          <v-flex>
            <v-text-field v-model.trim="gameLengthInput" :error-messages="glErrors" label="Game Length (hh:mm:ss)" type="time-with-seconds">
            </v-text-field>
          </v-flex>
          <v-flex>
            <v-btn color="info" @click="doUseDefaultGameLength">
              <v-icon>timer</v-icon> Use default (15 minutes)
            </v-btn>
          </v-flex>
        </v-layout>

        <v-layout row wrap class="mt-3">
          <v-flex>
            <v-text-field required :error-messages="crErrors" v-model.trim="captureRateInput" label="Capture Rate (hh:mm:ss)" type="time-with-seconds">
            </v-text-field>
          </v-flex>
          <v-flex>
            <v-btn color="info" @click="doUseDefaultCaptureRate">
              <v-icon>timer</v-icon> Use default (5 seconds)
            </v-btn>
          </v-flex>
        </v-layout>



        <v-layout row>
          <v-flex>
            <v-subheader>Game Mode</v-subheader>
            <v-radio-group v-model="modeSelection" :mandatory="true">
              <v-radio default label="Sector Control" value="sectorControl"></v-radio>
              <v-radio disabled label="Domination (coming soon)" value="domination"></v-radio>
              <v-radio disabled label="Bomb Diffusal (coming soon)" value="bombDiffusal"></v-radio>
            </v-radio-group>
          </v-flex>
        </v-layout>


        <v-layout row>
          <v-flex>
            <v-list>
              <v-subheader>Choose the D3VICES this game will use</v-subheader>
              <doom-alert level="warning" v-if="devices.length < 1">
                No D3VICES have been added. Please add some on the <router-link to="/device">D3VICES Page</router-link>
              </doom-alert>
              <v-list-tile v-for="d in devices" :key="d._id" avatar @click="">

                <v-list-tile-avatar>
                  <img :src="deviceImage"></img>
                </v-list-tile-avatar>

                <v-list-tile-action>
                  <v-checkbox v-model="includedDevices" :value="d._id"></v-checkbox>
                </v-list-tile-action>

                <v-list-tile-content>
                  <v-list-tile-title>{{ d.did }}</v-list-tile-title>
                  <v-list-tile-sub-title>{{d.description ? d.description : d._id}}</v-list-tile-sub-title>
                </v-list-tile-content>

              </v-list-tile>
            </v-list>
          </v-flex>
        </v-layout>

        <v-layout row>
          <v-flex>
            <v-btn color="primary" @click="doCreateGame">
              Create game
            </v-btn>
          </v-flex>
        </v-layout>
      </v-container>
    </v-form>
  </div>


  </div>
</v-card>
</template>

<script>
import {
  mapState,
  mapActions,
  mapGetters
} from 'vuex'

import store from '@/store';
import moment from 'moment';
import 'moment-duration-format';
import {
  helpers,
  required
} from 'vuelidate/lib/validators';
import { last } from 'ramda';
const timeRegex = helpers.regex('time', /^\d\d:\d\d:\d\d$/);
import di from '@/assets/futuristic_ammo_box_01.png';
import baseball from '@/assets/baseball-marker.png';
import DoomAlert from '@/components/DoomAlert/DoomAlert';
import VueScrollTo from 'vue-scrollto';

export default {
  name: 'CreateGame',
  components: {
    DoomAlert
  },
  data() {
    return {
      modeSelection: 'sectorControl',
      gameLengthInput: '',
      captureRateInput: '',
      gameNameInput: '',
      defaultGameLength: '00:15:00',
      defaultCaptureRate: '00:00:05',
      gameId: null,
      isGameCreated: false,
      includedDevices: [],
    }
  },
  validations: {
    gameLengthInput: {
      required,
      timeRegex
    },
    captureRateInput: {
      required,
      timeRegex
    }
  },
  created() {
    this.findGame();
  },
  props: {
    devices: {
      type: Array,
      required: true
    }
  },
  computed: {
    ...mapGetters('game', {
      findGame: 'find'
    }),
    deviceImage: () => di,
    isNotifyingInvalid() {
      if (this.$v.$invalid && this.$v.$error) return true;
      return false;
    },
    game() {
      return this.findGame({
        query: {
          $sort: {
            createdAt: 1
          }
        }
      })
    },
    latestGame() {
      const g = last(this.game.data);
      if (typeof g === 'undefined') return {};
      return {
        link: `/game/${g._id}`,
        name: g.name || 'link'
      };
    },
    crErrors() {
      if (
        this.$v.captureRateInput.$error
      ) return 'Must be in the format hh:mm:ss';
    },
    glErrors() {
      if (
        this.$v.gameLengthInput.$error
      ) return 'Must be in the format hh:mm:ss';
    },
    gameLength() {
      return moment.duration(this.gameLengthInput).valueOf();
    },
    captureRate() {
      return moment.duration(this.captureRateInput).valueOf();
    },
    isValid() {
      return !this.$v.$invalid;
    }
  },
  methods: {
    ...mapState('game', 'game'),
    ...mapActions('timeline', {
      createTimelineEvent: 'create',
      removeDevice: 'remove'
    }),
    ...mapActions('game', {
      createGame: 'create'
    }),
    // dirtyCr() {
    //   this.$v.captureRateInput.$touch();
    // },
    // dirtyGl() {
    //   this.$v.gameLengthInput.$touch();
    // },
    doCreateGame() {
      VueScrollTo.scrollTo('#create-game-header');

      this.$v.$touch();
      if (this.$v.$invalid) {
        console.log('invalid')
        this.isGameCreated = false;
      } else {
        console.log('valid')
        this.isGameCreated = true;
        this.createGame({
          gameLength: this.gameLength,
          captureRate: this.captureRate,
          gameName: this.gameNameInput,
          includedDevices: this.includedDevices
        }, {});
        this.$refs.form.reset();
        this.$v.$reset();
      }
    },
    doUseDefaultGameLength() {
      this.gameLengthInput = this.defaultGameLength;
    },
    doUseDefaultCaptureRate() {
      this.captureRateInput = this.defaultCaptureRate;
    }
  }
}
</script>

<style scoped>
.invis {
  display: none;
}
</style>
