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


        <v-layout column wrap>
          <v-flex>
            <h2>Map Coordinates</h2>
          </v-flex>
          <v-flex>
            <v-btn color="info" @click="doUseDefaultLatLng">
              <v-icon>timer</v-icon> Use default Lat, Lng
            </v-btn>
          </v-flex>
          <v-flex>
            <v-btn color="green" @click="doChooseCoords">
              <v-icon>edit_location</v-icon> Pick Coords on Map
            </v-btn>
          </v-flex>
          <v-flex>
            <v-text-field @focusout="dirtyLat" v-model.trim="latInput" :error-messages="latErrors" label="D3VICE Latitude (nnn.nnnnn)">
            </v-text-field>
          </v-flex>
          <v-flex>
            <v-text-field @focusout="dirtyLng" :error-messages="lngErrors" v-model.trim="lngInput" label="D3VICE longitude (nnn.nnnnn)">
            </v-text-field>
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
      nameInput: '',
      didInput: '',
      latInput: '',
      lngInput: '',
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
    this.nameInput = this.$route.query.name;
    this.didInput = this.$route.query.did;
    this.latInput = this.$route.query.lat;
    this.lngInput = this.$route.query.lng;
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
    doUseDefaultLatLng() {
      this.latInput = this.defaultLat;
      this.lngInput = this.defaultLng;
    },
    doChooseCoords() {
      const address = `/map/chooser`;
      const q = {
        name: this.nameInput,
        did: this.didInput
      };
      this.$router.push({
        path: address,
        query: q
      });
    }
  }
}
</script>

<style scoped>
.invis {
  display: none;
}
</style>
