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
              label="D3VICE Type"
              target="#dropdown-example"
            ></v-select>
          </v-flex>
        </v-layout>

        <v-layout v-if="selectedType" row wrap>
          <v-flex xs12>
            <v-text-field required v-model.trim="didInput" label="Device ID">
            </v-text-field>
          </v-flex>
        </v-layout>

        <v-layout v-if="is2bDevice" row wrap>
          <v-flex xs12>
            <v-text-field required v-model.trim="address64Input" label="Address64">
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

import { test } from 'ramda';
import store from '@/store';
import moment from 'moment';
import 'moment-duration-format';
import {
  helpers,
  required
} from 'vuelidate/lib/validators'
import { last } from 'ramda';
// greetz https://stackoverflow.com/a/18690202/1004931
const latRegex = helpers.regex('latitude', /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$/);
const lngRegex = helpers.regex('longitute', /^[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/);
const didRegex = /^\d-\w+/;
const address64Regex = /^[0-9a-fA-F]{16}$/;
const deviceType2BRegex = /^8-\w+/;
const deviceTypeVirtualRegex = /^9-\w+/;
const deviceTypeZeroRegex = /^0-\w+/;
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
      selectedType: ''
    }
  },
  validations: {
    address64Input: {
      required,
      address64Regex
    },
    didInput: {
      required,
      didRegex
    },
    latInput: {
      required,
      latRegex
    },
    lngInput: {
      required,
      lngRegex
    },
    type2b: ['didInput', 'latInput', 'lngInput', 'address64Input'],
    typeVirtual: ['didInput', 'latInput', 'lngInput'],
    typePa: ['didInput']
  },
  created() {
    this.findDevices();
    this.descriptionInput = this.$route.query.description;
    this.didInput = this.$route.query.did;
    this.latInput = this.$route.query.lat;
    this.lngInput = this.$route.query.lng;
  },
  computed: {
    ...mapGetters('devices', {
      findDevicesInStore: 'find'
    }),
    deviceImage: () => di,
    is2bDevice() {
      return (this.selectedType === '2b') ? true : false;
    },
    isVirtual2bDevice() {
      return (this.selectedType === 'virt2b') ? true : false;
    },
    isPaDevice() {
      return (this.selectedType === 'pa') ? true : false;
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
    doSelectType(selection) {
      console.log(`selection:${selection}`);
      this.selectedType = selection;
    },
    doCreateDevice() {
      if (this.$v.$invalid) {
        this.$v.$touch();
        this.isValidationError = true;
      } else {
        this.isValidationError = false;
        this.createDevice({
          did: this.didInput,
          description: this.descriptionInput,
          address64: this.address64Input,
          latLng: { lat: this.latInput, lng: this.lngInput },
        }, {});
        this.$refs.form.reset();
        this.isDeviceCreated = true;

        // clear the query params which may fill in the fields if left alone
        this.$router.replace({
          path: '/device',
          query: {}
        });
      }
      this.$vuetify.goTo('#create-device-header');
    },
    doUseDefaultLatLng() {
      this.latInput = this.defaultLat;
      this.lngInput = this.defaultLng;
    },
    doChooseCoords() {
      const address = `/map/chooser`;
      const q = {
        description: this.descriptionInput,
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
