<template>
<div>
  <p>name:{{ deviceName }} did:{{ deviceDid }}</p>
  <l-map id="map" :zoom="zoom" :center="defaultLatLng" :options="mapOptions" :maxZoom="maxZoom" @click="updatePOI($event)" ref="chooserMap">
    <l-tilelayer :url="url"></l-tilelayer>
    <l-marker v-for="d in devices" :key="d.key" :title="d.did" :data-index="d._id" :lat-lng="d.latLng" :icon="controlpointIcon(d.bluProgress, d.redProgress)" :draggable="true" @dragend="dragDevice(d, $event)">
      <l-popup :ref="d._id">
        <h3>{{ d.name }} ({{ d.did }})</h3>
      </l-popup>
    </l-marker>
    <l-control ref="mapcontrol" class="custom-control" position="topright">
      <p v-if="!isClicked">Click the map to choose a coordinate</p>
      <v-btn v-if="isClicked" icon color="green" @click="saveCoordinates($event)"><v-icon>save</v-icon></v-btn>
    </l-control>
    <l-marker id="point-of-interest" :lat-lng="poi" :icon="targetIcon">
    </l-marker>
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
  identity
} from 'ramda';
import gameStats from '@/../src_shared/gameStats'
import {
  lat,
  lng,
  latLng,
  gameMode,
  unknown
} from '@/../src_shared/defaults'


import tIcon from '@/assets/target-marker.png'
import uIcon from '@/assets/marker_UNK_s.png'
import rIcon from '@/assets/marker_RED_s.png'
import bIcon from '@/assets/marker_BLU_s.png'
import sIcon from '@/assets/marker_shadow.png'

export default {
  name: 'ChooserMap',
  data() {
    return {
      isMenuVisible: false,
      isClicked: false,
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
    lat() {
      return this.poi.lat;
    },
    lng() {
      return this.poi.lng;
    },
    defaultLatLng() {
      return latLng;
    },
    myGame() {
      const gameIdViaRoute = this.$route.params.gameId;
      const mg = this.findGameInStore({
        query: {
          _id: gameIdViaRoute
        }
      });
      return mg.data[0];
    },
    deviceName() {
      return this.$route.query.name;
    },
    deviceDid() {
      return this.$route.query.did;
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
    process.nextTick(() => {
      const controlElement = this.$refs.mapcontrol.$el;
      L.DomEvent.disableClickPropagation(controlElement);
    });
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
    saveCoordinates(evt) {
      const address = `/device`;
      const q = {
        name: this.deviceName,
        did: this.deviceDid,
        lat: this.poi.lat,
        lng: this.poi.lng
      };
      this.$router.push({
        path: address,
        query: q
      });
    },
    displayMenu(device, evt) {
      this.isMenuVisible = true;
    },
    handleResize(evt) {
      //$("#map").height($(window).height());
      // console.log(window.innerHeight)
      this.$refs.chooserMap.$el.style.height = `${window.innerHeight-48}px`;
      this.$refs.chooserMap.mapObject.invalidateSize();
    },
    updatePOI(event) {
      this.$store.commit('updatePOI', event.latlng);
      this.isClicked = true;
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
