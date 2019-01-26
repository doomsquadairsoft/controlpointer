<template>
  <div class="DeviceLifecycleControls">
    <v-flex shrink>
      <v-btn icon color="grey" @click="removeDevice(_id)">
        <v-icon>delete_forever</v-icon>
      </v-btn>
    </v-flex>
  </div>
</template>

<script>
import {
  mapActions,
} from 'vuex';

export default {
  name: 'DeviceLifecycleControls',
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
  },
  methods: {
    ...mapActions('devices', {
      removeDevice: 'remove'
    })
  }
}
</script>

<style>
</style>
