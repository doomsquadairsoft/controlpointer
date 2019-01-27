<template>
  <v-layout row>
    <div>

      <v-flex> <!-- timeline flex -->
        <h5>Stats</h5>
        <ul>
          <li>Name: {{ name }}</li>
          <li>DID: {{ did }}</li>
          <li>createdAt: {{ createdAt | formatDate }}</li>
          <li>Latitude: {{ lat }}</li>
          <li>Longitude: {{ lng }}</li>
          <li>Associated Games: <template v-for="g in myDevice.associatedGames"><router-link :to="gameLink(g)">{{ g }}</router-link> ({{ myDevice.associatedGames.length }}) ({{ associatedGames.length }}), </template>({{ myDevice.associatedGames.length }}) ({{ associatedGames.length }})</li>
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
    name() { return this.myDevice.name },
    associatedGames() { return this.myDevice.associatedGames }
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
