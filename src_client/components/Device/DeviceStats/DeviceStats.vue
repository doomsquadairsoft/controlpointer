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
          <li>Associated Game: <router-link :to="gameLink">{{ associatedGame }}</router-link></li>
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

export default {
  name: 'DeviceStats',
  components: {
  },
  props: {
    myDevice: {
      type: Object,
      required: true,
    }
  },
  computed: {
    did() { return this.myDevice.did },
    createdAt() { return this.myDevice.createdAt },
    lat() { return this.myDevice.latLng.lat },
    lng() { return this.myDevice.latLng.lng },
    _id() { return this.myDevice._id },
    name() { return this.myDevice.name },
    associatedGame() { return this.myDevice.associatedGame },
    gameLink() {
        return `/game/${this.associatedGame}`;
    },
  }
}
</script>

<style></style>
