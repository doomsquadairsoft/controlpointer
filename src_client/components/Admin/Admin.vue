<template>
<v-container class="admin">
  <h1>Controlpointer Administration</h1>
  <lifecycle></lifecycle>
  <device-list v-bind:devices="devices.data" v-bind:findDevices="findDevices"></device-list>
  <new-device></new-device>
  <pending-device-list v-bind:pendingDevices="pendingDevices.data" v-bind:findPendingDevices="findPendingDevices"></pending-device-list>

</v-container>
</template>

<script>
import {
  mapState,
  mapGetters,
  mapActions
} from 'vuex'
import PendingDeviceList from './PendingDeviceList'
import DeviceList from '../DeviceList'
import NewDevice from '../NewDevice'
import Lifecycle from '@/components/Lifecycle/Lifecycle'
import Log from './Log.vue'
import di from '../../assets/futuristic_ammo_box_01.png'


export default {
  name: 'Admin',
  components: {
    DeviceList,
    PendingDeviceList,
    NewDevice,
    Log,
    Lifecycle,
  },
  computed: {
    ...mapState('devices',
      'devices'
    ),
    ...mapState('pendingDevices', 'pendingDevices'),
    ...mapState('logs',
      'logs'
    ),
    ...mapGetters('devices', {
      findDevicesInStore: 'find'
    }),
    ...mapGetters('pdevices', {
      findPendingDevicesInStore: 'find'
    }),
    devices() {
      return this.findDevicesInStore({
        query: {
          $sort: {
            createdAt: 1
          }
        }
      })
    },
    pendingDevices() {
      return this.findPendingDevicesInStore({
        query: {
          $sort: {
            createdAt: 1
          }
        }
      })
    }
  },
  methods: {
    ...mapActions('devices', {
      findDevices: 'find',
      createDevice: 'create'
    }),
    ...mapActions('pdevices', {
      findPendingDevices: 'find',
      createPendingDevice: 'create'
    })
  },
  created() {
    this.findDevices();
    this.findPendingDevices();
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
