<template>
  <v-layout row>
    <div>

      <v-flex> <!-- timeline flex -->
        <h3>Stats</h3>
        <ul>
          <li>DID: {{ did }}</li>
          <li>Description: {{ description }}</li>
          <li>createdAt: {{ createdAt | formatDate }}</li>
          <li>Latitude: {{ lat }}</li>
          <li>Longitude: {{ lng }}</li>
          <li>Address64: {{ address64 }}</li>
          <li>RSSI: {{ rssi }}</li>
          <li>Battery: {{ batt }}</li>
          <li>Associated Games: <template v-for="g in myDevice.associatedGames"><router-link :to="gameLink(g)">{{ g }}</router-link>, </template></li>
          <li>{{ associatedGames }}</li>
          <li>_id: {{ _id }}</li>
        </ul>
      </v-flex>

      <v-progress-circular :size="100" :width="15" :rotate="0" :value="myDevice.bluProgress" color="blue">
        {{ myDevice.bluProgress }}
      </v-progress-circular>
      <v-progress-circular :size="100" :width="15" :rotate="0" :value="myDevice.redProgress" color="red">
        {{ myDevice.redProgress }}
      </v-progress-circular>

    </div>
  </v-layout>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'DeviceStats',
  components: {
  },
  props: {
    deviceId: {
      type: String,
      required: true,
    }
  },
  computed: {
    ...mapGetters('devices', {
      findDevicesInStore: 'find'
    }),
    myDevice() {
      return this.findDevicesInStore({
        query: {
          _id: this.deviceId
        }
      }).data[0]
    },
    did() { return this.myDevice.did },
    createdAt() { return this.myDevice.createdAt },
    lat() { return this.myDevice.latLng.lat },
    lng() { return this.myDevice.latLng.lng },
    _id() { return this.myDevice._id },
    description() { return this.myDevice.description },
    associatedGames() { return this.myDevice.associatedGames },
    rssi() { return this.myDevice.rssi },
    batt() { return this.myDevice.batt },
    address64() { return this.myDevice.address64 },
  },
  methods: {
    ...mapActions('devices', {
      findDevices: 'find'
    }),
    gameLink(gameId) {
        return `/game/${gameId}`;
    },
  },
  created() {
    this.findDevices();
  }
}
</script>

<style></style>
