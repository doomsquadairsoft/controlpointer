<template>
<div>
  <v-container class="pa-3">
    <v-layout row>

      <v-flex xs4 mdAndUp class="image">
        <v-avatar size="100">
          <img :src="deviceImage" >
        </v-avatar>
      </v-flex>
      <v-flex xs8 class="stats">
        <v-container pa-0 ma-0>
          <v-layout column align-center justify-start fill-height>
            <v-flex><h6>Description</h6></v-flex>
            <v-flex mb-4>{{ desc }}</v-flex>
            <v-flex><h6>Associated Games</h6></v-flex>
            <v-flex>
              <v-chip v-for="(g, idx) in myDevice.associatedGames" :key="idx">{{ gameIdToTitle(g) }}</v-chip>
            </v-flex>
          </v-layout>
        </v-container>
      </v-flex>


    </v-layout>
  </v-container>
  <device-game-controls :myDevice="myDevice" :gameId="myGame._id"></device-game-controls>
</div>
</template>

<script>
import signal5 from '@/assets/signal_5.svg';
import signal4 from '@/assets/signal_4.svg';
import signal3 from '@/assets/signal_3.svg';
import signal2 from '@/assets/signal_2.svg';
import signal1 from '@/assets/signal_1.svg';
import signal0 from '@/assets/signal_0.svg';
import signalE from '@/assets/signal_e.svg';
import di from '@/assets/futuristic_ammo_box_01.png';
import device2bImage from '@/assets/device-2b.jpg';
import devicePaImage from '@/assets/megaphone_loud_hailer_loud.jpg';
import DeviceGameControls from '@/components/Device/DeviceControls/DeviceGameControls';
import {
  mapGetters,
} from 'vuex'

export default {
  name: 'GameDevice',
  components: {
    DeviceGameControls
  },
  props: {
    myDevice: {
      type: Object,
      required: true
    },
    myGame: {
      type: Object,
      required: true
    }
  },
  methods: {
    gameIdToTitle(id) {
      return this.getGameInStore(id).gameName;
    }
  },
  computed: {
    ...mapGetters('game', {
      getGameInStore: 'get'
    }),
    desc() {
      const description = this.myDevice.description;
      const type = this.myDevice.type;
      if (!description) {
        if (type === '2b') return 'A 2 Button D3VICE';
        if (type === 'pa') return 'A Public Address D3VICE';
        if (type === 'virt2b') return 'A virtual 2 Button D3VICE';
        return 'A D3VICE of unknown type'
      }
      return description;
    },
    signal5Image: () => signal5,
    signal4Image: () => signal4,
    signal3Image: () => signal3,
    signal2Image: () => signal2,
    signal1Image: () => signal1,
    signal0Image: () => signal0,
    signalEImage: () => signalE,
    deviceImage() {
      const type = this.myDevice.type;
      if (type === '2b') return device2bImage;
      if (type === 'virt2b') return di;
      if (type === 'pa') return devicePaImage;
      return di;
    },
    wifiColor() {
      const rssi = this.myDevice.rssi;
      if (!rssi) return 'grey'
      if (rssi < -50) return 'red';
      if (rssi < -40) return 'orange';
      if (rssi < -30) return 'yellow';
      if (rssi < -20) return 'green';
      if (rssi < -10) return 'lime';
      return 'blue'
    },
    batteryIcon() {
      const batt = this.myDevice.batt;
      if (!batt) return 'battery_unknown';
      if (batt < 10) return 'battery_alert';
      return 'battery_std';
    },
    wifiIcon() {
      const rssi = this.myDevice.rssi;
      if (!rssi) return 'signal_wifi_off'
      return 'wifi'
    },
    batteryColor() {
      const batt = this.myDevice.batt;
      if (!batt) return 'grey'
      if (batt < 10) return 'red';
      if (batt < 33) return 'orange';
      if (batt < 66) return 'yellow';
      return 'green';
    },
    signalIcon(rssi) {
      console.log(`rssi:${rssi} ${typeof rssi}`)
      if (!rssi) return this.signal0Image;
      if (rssi < -50) return this.signal0Image;
      if (rssi < -40) return this.signal1Image;
      if (rssi < -30) return this.signal5Image;
      if (rssi < -20) return this.signal3Image;
      if (rssi < -10) return this.signal4Image;
      return this.signal5Image;
    }
  },
}
</script>

<style>
</style>
