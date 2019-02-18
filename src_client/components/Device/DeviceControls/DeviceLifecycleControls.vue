<template>
  <div class="DeviceLifecycleControls">
    <v-flex shrink>
      <doom-alert v-if="!isDeletable" level="info">Disassociate this device from all games to enable deletion.</doom-alert>
      <v-btn :disabled="!isDeletable" color="grey" @click="deleteDevice">
        <v-icon>delete_forever</v-icon>
      </v-btn>
    </v-flex>
  </div>
</template>

<script>
import {
  mapActions,
} from 'vuex';
import DoomAlert from '@/components/DoomAlert/DoomAlert';

export default {
  name: 'DeviceLifecycleControls',
  components: {
    DoomAlert
  },
  props: {
    myDevice: {
      type: Object,
      required: true,
    }
  },
  computed: {
    _id() {
      return this.myDevice._id
    },
    isDeletable() {
      return (this.myDevice.associatedGames.length < 1);
    },
  },
  methods: {
    ...mapActions('devices', {
      removeDevice: 'remove'
    }),
    deleteDevice() {
      this.removeDevice(this._id);
      this.$router.push({
        path: '/device',
        query: {}
      });
    }
  }
}
</script>

<style>
</style>
