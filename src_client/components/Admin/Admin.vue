<template>
    <div class="admin">
        <h1>Controlpointer Administration</h1>
        <device-list
            v-bind:devices="devices.data"
            v-bind:findDevices="findDevices"
        ></device-list>
        <new-device
            v-bind:createDevice="createDevice"
        ></new-device>
    </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import DeviceList from '../DeviceList.vue'
import NewDevice from './NewDevice.vue'
import di from '../../assets/futuristic_ammo_box_01.png'

export default {
  name: 'Admin',
  components: {
      DeviceList,
      NewDevice
  },
  computed: {
    ...mapState('devices',
      'devices'
    ),
    ...mapGetters('devices', {
      findDevicesInStore: 'find'
    }),
    devices () {
        return this.findDevicesInStore({ query: { $sort: { createdAt: 1 }}})
    }
  },
  methods: {
    ...mapActions('devices', {
      findDevices: 'find',
      createDevice: 'create'
    })
  },
  created () {
    this.findDevices()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
