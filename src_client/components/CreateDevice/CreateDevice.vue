<template>
<v-card class="mt-3 mx-auto" max-width="500">
  <div>
  <v-card-title primary-title>
      <v-layout row>
        <v-flex xs12>
          <span class="headline">Create D3VICE</span>
        </v-flex>
      </v-layout>
  </v-card-title>

  <div>
    <v-form ref="form">
      <v-container>
        <v-layout row wrap>
          <v-flex xs12>
            <v-text-field v-model.trim="nameInput" label="Name your D3VICE">
            </v-text-field>
          </v-flex>
        </v-layout>

        <v-layout row wrap>
          <v-flex xs12>
            <v-text-field required v-model.trim="didInput" label="Enter your Device ID">
            </v-text-field>
          </v-flex>
        </v-layout>

        <v-layout row wrap>
          <v-flex>
            <v-text-field @focusout="dirtyLat" v-model.trim="latInput" :error-messages="latErrors" label="D3VICE Latitude (nnn.nnnnn)">
            </v-text-field>
          </v-flex>
          <v-flex>
            <v-btn color="info" @click="doUseDefaultLat">
              <v-icon>timer</v-icon> Use default (47.658779)
            </v-btn>
          </v-flex>
        </v-layout>

        <v-layout row wrap class="mt-5">
          <v-flex>
            <v-text-field @focusout="dirtyLng" :error-messages="lngErrors" v-model.trim="lngInput" label="D3VICE longitude (nnn.nnnnn)">
            </v-text-field>
          </v-flex>
          <v-flex>
            <v-btn color="info" @click="doUseDefaultLng">
              <v-icon>timer</v-icon> Use default (-117.426048)
            </v-btn>
          </v-flex>
        </v-layout>
      </v-container>
    </v-form>


    <v-layout row>
      <v-flex>
        <v-btn color="primary" @click="doCreateDevice">
          Create D3VICE
        </v-btn>
        <doom-alert v-if="isValidationError" level="error">Invalid Input. Fix errors above then try again.</doom-alert>
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
// greetz https://stackoverflow.com/a/18690202/1004931
const latRegex = helpers.regex('latitude', /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$/);
const lngRegex = helpers.regex('longitute', /^[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/);
import di from '@/assets/futuristic_ammo_box_01.png';
import baseball from '@/assets/baseball-marker.png';
import DoomAlert from '@/components/DoomAlert/DoomAlert';

export default {
  name: 'CreateDevice',
  components: {
    DoomAlert
  },
  data() {
    return {
      didInput: '',
      latInput: '',
      lngInput: '',
      nameInput: '',
      gameId: null,
      isValidationError: false,
      defaultLat: 47.658779,
      defaultLng: -117.426048,
    }
  },
  validations: {
    latInput: {
      latRegex
    },
    lngInput: {
      lngRegex
    }
  },
  created() {
    this.findDevices();
  },
  computed: {
    ...mapGetters('devices', {
      findDevicesInStore: 'find'
    }),
    deviceImage: () => di,
    devices() {
      return this.findDevicesInStore({
        query: {
          $sort: {
            createdAt: 1
          }
        }
      })
    },
    latErrors() {
      if (
        this.$v.latInput.$dirty &&
        this.$v.latInput.$invalid
      ) return 'Must be in the format nnn.nnnnn';
    },
    lngErrors() {
      if (
        this.$v.lngInput.$dirty &&
        this.$v.lngInput.$invalid
      ) return 'Must be in the format nnn.nnnnn';
    },
    isValid() {
      return !this.$v.$invalid;
    }
  },
  methods: {
    ...mapActions('timeline', {
      createTimelineEvent: 'create',
      removeDevice: 'remove'
    }),
    ...mapActions('devices', {
      createDevice: 'create',
      findDevices: 'find',
    }),
    dirtyLat() {
      this.$v.latInput.$touch();
    },
    dirtyLng() {
      this.$v.lngInput.$touch();
    },
    doCreateDevice() {
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.isValidationError = true;
      } else {
        this.$vuetify.goTo('head');
        this.isValidationError = false;
        this.createDevice({
          name: this.nameInput,
          did: this.didInput,
          latLng: { lat: this.latInput, lng: this.lngInput },
        }, {});
      }
    },
    doUseDefaultLat() {
      this.latInput = this.defaultLat;
    },
    doUseDefaultLng() {
      this.lngInput = this.defaultLng;
    },
  }
}
</script>

<style scoped>
.invis {
  display: none;
}
</style>
