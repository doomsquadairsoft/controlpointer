<template>
<div v-if="myGame">
  <l-map id="map" :zoom="zoom" :center="myDevice.latLng" :options="mapOptions" :maxZoom="maxZoom" @click="updatePOI($event)" ref="map">
    <l-tilelayer :url="url"></l-tilelayer>
    <l-marker v-for="d in myDevices" :key="d.key" :title="d.did" :data-index="d._id" :lat-lng="d.latLng" :icon="controlpointIcon(d.bluProgress, d.redProgress)" :draggable="true" @dragend="dragDevice(d, $event)">
      <l-popup :ref="d._id">
        <h3>{{ d.name }} ({{ d.did }})</h3>
      </l-popup>
    </l-marker>
    <!-- <l-control v-if="isMenuVisible" class="custom-control" position="topright">
      <v-btn icon color="green" @click="createDevice()"><v-icon>add_location</v-icon></v-btn>
    </l-control> -->
    <!-- <l-marker id="point-of-interest" :lat-lng="poi" :icon="targetIcon">
    </l-marker> -->
  </l-map>
</div>
</template>


<script>

import {
  mapState,
  mapGetters,
  mapActions
} from 'vuex'
import {
  propEq,
  find,
  ifElse,
  isNil,
  always,
  identity,
  clone
} from 'ramda';

import tIcon from '@/assets/target-marker.png'
import uIcon from '@/assets/marker_UNK_s.png'
import rIcon from '@/assets/marker_RED_s.png'
import bIcon from '@/assets/marker_BLU_s.png'
import sIcon from '@/assets/marker_shadow.png'

export default {
  name: 'Map',
  data() {
    return {
      isMenuVisible: false,
      isDragAdviceVisible: false,
      mapOptions: {
        attributionControl: false,
      },
      isDevicesDraggable: false,
      targetIcon: L.icon({
        iconUrl: tIcon,
        iconSize: [32, 37],
        iconAnchor: [16, 37],
        popupAnchor: [0, -28]
      }),
      redIcon: L.icon({
        iconUrl: rIcon,
        iconSize: [60, 61],
        iconAnchor: [32, 32],
        popupAnchor: [0, 32]
      }),
      unkIcon: L.icon({
        iconUrl: uIcon,
        iconSize: [60, 61],
        iconAnchor: [32, 32],
        popupAnchor: [0, 32]
      }),
      bluIcon: L.icon({
        iconUrl: bIcon,
        iconSize: [60, 61],
        iconAnchor: [32, 32],
        popupAnchor: [0, 32]
      }),
      shadowIcon: L.icon({
        iconUrl: sIcon,
        iconSize: [60, 61],
        iconAnchor: [32, 32],
        popupAnchor: [0, 32]
      }),
    }
  },
  props: {
    devices: {
      type: Array,
      required: true
    },
  },
  computed: {
    ...mapGetters([
      'poi',
      'zoom',
      'maxZoom',
      'url',
      'devmode'
    ]),
    ...mapGetters('devices', {
      findDevicesInStore: 'find'
    }),
    ...mapGetters('game', {
      findGameInStore: 'find'
    }),
    myGame() {
      const gameIdViaRoute = this.$route.params.gameId;
      const mg = this.findGameInStore({
        query: {
          _id: gameIdViaRoute
        }
      });
      return mg.data[0];
    },
    myDevices() {
      // return the devices included in this game.
      const deviceIds = clone(this.myGame.includedDevices);
      return this.findDevicesInStore({
        query: {
          _id: { $in: deviceIds }
        }
      }).data;
    },
    myDevice() {
      // return the device passed as a query string, OR the first created device in this game
      const deviceIdViaRoute = this.$route.query.deviceId;
      const firstIncludedDevice = this.myGame.includedDevices[0];
      const chosenDeviceId = ifElse(isNil(), always(firstIncludedDevice), identity())(deviceIdViaRoute);
      return this.findDevicesInStore({
        query: {
          _id: chosenDeviceId
        }
      }).data[0];
    }
  },
  mounted: function() {
    window.addEventListener('resize', this.handleResize);
    if (this.myGame) this.handleResize();
  },
  beforeDestroy: function() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    ...mapActions('devices', {
      findDevices: 'find',
      patchDevice: 'patch'
    }),
    ...mapActions('game', {
      findGame: 'find'
    }),
    // createDevice() {
    //   console.log('creating');
    //   console.log(this.poi);
    //   this.createDevice();
    // },
    dragDevice(d, evt) {
      const updatedLatLng = evt.target._latlng;
      const updatedLat = updatedLatLng.lat;
      const updatedLng = updatedLatLng.lng;
      this.patchDevice([d._id, { "latLng": { "lat": updatedLat, "lng": updatedLng } }]);
    },
    displayMenu(device, evt) {
      this.isMenuVisible = true;
    },
    handleResize(evt) {
      //$("#map").height($(window).height());
      // console.log(window.innerHeight)
      this.$refs.map.$el.style.height = `${window.innerHeight-48}px`;
      this.$refs.map.mapObject.invalidateSize();
    },
    updatePOI(event) {
      this.$store.commit('updatePOI', event.latlng);
      this.isMenuVisible = true;
    },
    controlpointIcon(bluProgress, redProgress) {
      if (redProgress >= 100) {
        return this.redIcon; // @TODO this should not mutate state outside of mutation handler
      } else if (bluProgress >= 100) {
        return this.bluIcon;
      } else {
        return this.unkIcon;
      }
    },
  },
  created() {
    this.findDevices();
    this.findGame();
  }
}
</script>

<style scoped >

#map {
  height: 90vh;
  width: 100%;
  z-index: 5;
}

.yolo {
    color: black;
    background: #fff;
}

.custom-control {
  color: darkgreen;
  background-color: white;
  border-radius: 2px;
}

.custom-control p {
  margin: 1em 1em;
  animation: blinker 1s linear infinite;
  font-weight: bold;
}

@keyframes blinker {
  50% {
    opacity: 0;
  }
}
</style>
