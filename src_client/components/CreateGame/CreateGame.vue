<template>
<v-card class="mt-3 mx-auto" max-width="500">
  <div>
  <v-card-title primary-title>
      <v-layout row>
        <v-flex xs12>
          <span class="headline">Create Game
            <v-btn icon @click="show = !show">
              <v-icon>{{ show ? 'keyboard_arrow_down' : 'keyboard_arrow_up' }}</v-icon>
            </v-btn>
          </span>
        </v-flex>
        <v-flex xs3>
          <v-btn icon>
          </v-btn>
        </v-flex>
      </v-layout>
  </v-card-title>

  <div v-show="show">
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
            <v-text-field @focusout="dirtyGl" v-model.trim="gameLengthInput" :error-messages="glErrors" label="Game Length (hh:mm:ss)" type="time-with-seconds">
            </v-text-field>
          </v-flex>
          <v-flex>
            <v-btn color="info" @click="doUseDefaultGameLength">
              <v-icon>timer</v-icon> Use default (15 minutes)
            </v-btn>
          </v-flex>
        </v-layout>

        <v-layout row wrap class="mt-5">
          <v-flex>
            <v-text-field required @focusout="dirtyCr" :error-messages="crErrors" v-model.trim="captureRateInput" label="Capture Rate (hh:mm:ss)" type="time-with-seconds">
            </v-text-field>
          </v-flex>
          <v-flex>
            <v-btn color="info" @click="doUseDefaultCaptureRate">
              <v-icon>timer</v-icon> Use default (5 seconds)
            </v-btn>
          </v-flex>
        </v-layout>
      </v-container>
    </v-form>


    <v-layout row>
      <v-flex>
        <v-list>
          <v-subheader>Choose the D3VICES this game will use</v-subheader>
          <v-list-tile v-for="d in devices" :key="d._id" avatar @click="">

            <v-list-tile-avatar>
              <img :src="deviceImage"></img>
            </v-list-tile-avatar>

            <v-list-tile-action>
              <v-checkbox v-model="includedDevices" :value="d._id"></v-checkbox>
            </v-list-tile-action>

            <v-list-tile-content>
              <v-list-tile-title>{{ d.did }}</v-list-tile-title>
              <v-list-tile-sub-title>D3VICE {{d._id}}</v-list-tile-sub-title>
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
        <v-alert :value="isValidationError" type="error">Invalid Input. Fix errors above then try again.</v-alert>
      </v-flex>
    </v-layout>
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
} from 'vuelidate/lib/validators'
const timeRegex = helpers.regex('time', /^\d\d:\d\d:\d\d$/);
import di from '@/assets/futuristic_ammo_box_01.png';
import baseball from '@/assets/baseball-marker.png';


export default {
  name: 'CreateGame',
  components: {

  },
  data() {
    return {
      gameLengthInput: '',
      captureRateInput: '',
      gameNameInput: '',
      defaultGameLength: '00:15:00',
      defaultCaptureRate: '00:00:05',
      gameId: null,
      isValidationError: false,
      show: true,
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
    game() {
      return this.findGame({
        query: {
          $sort: {
            createdAt: 1
          }
        }
      })
    },
    crErrors() {
      if (
        this.$v.captureRateInput.$dirty &&
        this.$v.captureRateInput.$invalid
      ) return 'Must be in the format hh:mm:ss';
    },
    glErrors() {
      if (
        this.$v.gameLengthInput.$dirty &&
        this.$v.gameLengthInput.$invalid
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
    dirtyCr() {
      this.$v.captureRateInput.$touch();
    },
    dirtyGl() {
      this.$v.gameLengthInput.$touch();
    },
    doCreateGame() {
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.isValidationError = true;
      } else {
        this.show = false;
        this.isValidationError = false;
        this.createGame({
          gameLength: this.gameLength,
          captureRate: this.captureRate,
          gameName: this.gameNameInput,
          includedDevices: this.includedDevices
        }, {});
      }
    },
    doUseDefaultGameLength() {
      this.gameLengthInput = this.defaultGameLength;
    },
    doUseDefaultCaptureRate() {
      this.captureRateInput = this.defaultCaptureRate;
    },
    createStartEvent() {
      console.log('Creating game start timeline event ' + this._id)
      this.createTimelineEvent({
        type: "timeline",
        action: "start",
        source: "admin",
        target: "game"
      }, {});
    },
    createPauseEvent() {
      console.log('creating pause event')
      this.createTimelineEvent({
        type: "timeline",
        action: "pause",
        source: "admin",
        target: "game"
      }, {});
    },
    createStopEvent() {
      console.log('creating stop event')
      this.createTimelineEvent({
        type: "timeline",
        action: "stop",
        source: "admin",
        target: "game"
      }, {});
    }
  }
}
</script>

<style scoped>
.invis {
  display: none;
}
</style>
