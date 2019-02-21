<template>
<v-card class="mt-3 mx-auto" max-width="500">
  <div>
  <v-card-title primary-title id="create-device-header">
      <v-layout column>
        <v-flex xs12>
          <span class="headline">Create D3VICE</span>
        </v-flex>
        <v-flex xs12>
          <doom-alert v-if="isValidationError" level="error">Invalid Input. Fix errors below then try again.</doom-alert>
          <doom-alert v-if="isDeviceCreated" level="info">D3VICE created. <router-link :to="this.latestDevice.link">{{ this.latestDevice.did }}</router-link></doom-alert>
        </v-flex>
      </v-layout>
  </v-card-title>

  <div>
    <v-form ref="form">
      <v-container>

        <v-layout row wrap>
          <v-flex xs12>
            <v-select
              @change="doSelectType"
              :items="deviceTypes"
              :value="typeInput"
              label="D3VICE Type"
              target="#dropdown-example"
            ></v-select>
          </v-flex>
        </v-layout>

        <v-layout v-if="typeInput" row wrap>
          <v-flex xs12>
            <v-text-field @focusout="dirtyDid" required v-model.trim="didInput" :error-messages="didErrors"  label="Device ID">
            </v-text-field>
          </v-flex>
        </v-layout>

        <v-layout v-if="is2bDevice" row wrap>
          <v-flex xs12>
            <v-text-field @focusout="dirtyAddress64" required v-model.trim="address64Input" :error-messages="address64Errors" label="Address64">
            </v-text-field>
          </v-flex>
        </v-layout>

        <v-layout v-if="isDescribableDevice" row wrap>
          <v-flex xs12>
            <v-text-field v-model.trim="descriptionInput" label="D3VICE Description">
            </v-text-field>
          </v-flex>
        </v-layout>



        <v-layout v-if="isMappableDevice" column wrap>
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

import { test, find, propEq } from 'ramda';
import store from '@/store';
import moment from 'moment';
import 'moment-duration-format';
import {
  helpers,
  required,
  alphaNum,
  minLength
} from 'vuelidate/lib/validators'
import { last } from 'ramda';
// greetz https://stackoverflow.com/a/18690202/1004931
const latRegex = helpers.regex('latitude', /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$/);
const lngRegex = helpers.regex('longitute', /^[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/);
const address64Regex = helpers.regex('address64', /^[0-9a-fA-F]{16}$/);
const deviceType2BRegex = helpers.regex('type2b', /^8-\w+/);
const deviceTypeVirtualRegex = helpers.regex('typeVirtual', /^9-\w+/);
const deviceTypeZeroRegex = helpers.regex('typeZero', /^0-\w+/);
import di from '@/assets/futuristic_ammo_box_01.png';
import baseball from '@/assets/baseball-marker.png';
import DoomAlert from '@/components/DoomAlert/DoomAlert';
import VueScrollTo from 'vue-scrollto';

export default {
  name: 'CreateDevice',
  components: {
    DoomAlert
  },
  data() {
    return {
      deviceTypes: [
        { value: '2b', text: 'Two Button (Physical)'},
        { value: 'virt2b', text: 'Two Button (Virtual)'},
        { value: 'pa', text: 'Public Address'},
      ],
      descriptionInput: '',
      didInput: '',
      latInput: '',
      lngInput: '',
      address64Input: '',
      gameId: null,
      isValidationError: false,
      isDeviceCreated: false,
      defaultLat: 47.658779,
      defaultLng: -117.426048,
      typeInput: ''
    }
  },
  validations: {
    address64Input: {
      required,
      address64Regex
    },
    didInput: {
      required,
      minLength: minLength(1)
    },
    latInput: {
      required,
      latRegex
    },
    lngInput: {
      required,
      lngRegex
    },
    typeInput: {
      required,
    },
    type2b: ['didInput', 'latInput', 'lngInput', 'address64Input'],
    typeVirtual: ['didInput', 'latInput', 'lngInput'],
    typePa: ['didInput']
  },
  created() {
    this.findDevices();
    this.descriptionInput = this.$route.query.description;
    this.address64Input = this.$route.query.address64;
    this.didInput = this.$route.query.did;
    this.latInput = this.$route.query.lat;
    this.lngInput = this.$route.query.lng;
    this.typeInput = this.$route.query.type;
  },
  computed: {
    ...mapGetters('devices', {
      findDevicesInStore: 'find'
    }),
    deviceImage: () => di,
    is2bDevice() {
      return (this.typeInput === '2b') ? true : false;
    },
    isVirtual2bDevice() {
      return (this.typeInput === 'virt2b') ? true : false;
    },
    isPaDevice() {
      return (this.typeInput === 'pa') ? true : false;
    },
    isDescribableDevice() {
      return (this.is2bDevice || this.isVirtual2bDevice) ? true : false;
    },
    isMappableDevice() {
      return (this.is2bDevice || this.isVirtual2bDevice || this.isPaDevice) ? true : false;
    },
    devices() {
      return this.findDevicesInStore({
        query: {
          $sort: {
            createdAt: 1
          }
        }
      })
    },
    latestDevice() {
      const d = last(this.devices.data);
      if (typeof d === 'undefined') return {};
      return {
        link: `/device/${d._id}`,
        did: d.did || 'link'
      };
    },
    didErrors() {
      if (
        this.$v.didInput.$dirty &&
        this.$v.didInput.$invalid
      ) return 'Must be 1 or more characters'
    },
    latErrors() {
      if (
        this.$v.latInput.$dirty &&
        this.$v.latInput.$invalid
      ) return 'Must be in the format nnn.nnnnn';
    },
    address64Errors() {
      if (
        this.$v.address64Input.$dirty &&
        this.$v.address64Input.$invalid
      ) return 'Must use a mix of characters A-F and 0-9 and be 16 characters total';
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
    dirtyDid() {
      this.$v.didInput.$touch();
    },
    dirtyLat() {
      this.$v.latInput.$touch();
    },
    dirtyLng() {
      this.$v.lngInput.$touch();
    },
    dirtyAddress64() {
      this.$v.address64Input.$touch();
    },
    doSelectType(selection) {
      this.typeInput = selection;
    },
    doSubmitDevice() {
      this.isValidationError = false;

      this.createDevice({
        type: this.typeInput,
        did: this.didInput,
        address64: this.address64Input,
        description: this.descriptionInput,
        latLng: { lat: this.latInput, lng: this.lngInput },
      }, {});


      // clear the query params by sneakily navigating to /device
      // The query params may fill in the fields if left alone
      this.$router.replace({
        path: '/device',
        query: {}
      });

      this.$v.$reset();
      this.$refs.form.reset();
    },
    doCreateDevice() {
      VueScrollTo.scrollTo('#create-device-header');

      if (this.typeInput === '2b') {
        if (this.$v.type2b.$invalid) {
          this.$v.type2b.$touch();
          this.isValidationError = true;
        } else {
          this.doSubmitDevice();
        }
      }
      else if (this.typeInput === 'virt2b') {
        if (this.$v.typeVirtual.$invalid) {
          this.$v.typeVirtual.$touch();
          this.isValidationError = true;
        } else {
          this.doSubmitDevice();
        }
      }
      else if (this.typeInput === 'pa') {
        if (this.$v.typePa.$invalid) {
          this.$v.typePa.$touch();
          this.isValidationError = true;
        } else {
          this.doSubmitDevice();
        }
      }
    },
    doUseDefaultLatLng() {
      this.latInput = this.defaultLat;
      this.lngInput = this.defaultLng;
    },
    doChooseCoords() {
      const address = `/map/chooser`;
      const q = {
        description: this.descriptionInput,
        did: this.didInput,
        type: this.typeInput,
        address64: this.address64Input
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
