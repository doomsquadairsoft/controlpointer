<template>
<v-layout row align-center justify-start fill-height>
    <v-flex grow style="overflow:hidden;">
    <v-list-tile-title>
      {{ myDevice.did }}
    </v-list-tile-title>
  </v-flex>
  <v-flex pa-1 shrink>
    <v-progress-circular :value="myDevice.bluProgress" color="blue">{{ myDevice.bluProgress }}</v-progress-circular>
  </v-flex>
  <v-flex pa-1 shrink>
    <v-progress-circular :value="myDevice.redProgress" color="red">{{ myDevice.redProgress }}</v-progress-circular>
  </v-flex>
  <v-flex pa-1 shrink>
    <v-badge right>
      <v-icon :color="wifiColor">
        {{ wifiIcon }}
      </v-icon>
    </v-badge>
  </v-flex>
  <v-flex pa-1 shrink>
    <v-badge right>
      <v-icon :color="batteryColor">
        {{ batteryIcon }}
      </v-icon>
    </v-badge>
  </v-flex>
</v-layout>
</template>

<script>
import signal5 from '@/assets/signal_5.svg';
import signal4 from '@/assets/signal_4.svg';
import signal3 from '@/assets/signal_3.svg';
import signal2 from '@/assets/signal_2.svg';
import signal1 from '@/assets/signal_1.svg';
import signal0 from '@/assets/signal_0.svg';
import signalE from '@/assets/signal_e.svg';
export default {
  name: 'GameDeviceHeader',
  components: {

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
  computed: {
    signal5Image: () => signal5,
    signal4Image: () => signal4,
    signal3Image: () => signal3,
    signal2Image: () => signal2,
    signal1Image: () => signal1,
    signal0Image: () => signal0,
    signalEImage: () => signalE,
    wifiColor() {
      const rssi = this.myDevice.rssi;
      if (!rssi) return 'grey'
      if (rssi < -70) return 'red';
      if (rssi < -60) return 'orange';
      if (rssi < -50) return 'yellow';
      return 'green';
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
      return 'wifi';
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
