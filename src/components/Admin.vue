<template>
  <div class="admin">
    <h1>Controlpointer Administration</h1>
    <v-container grid-list-lg>
        <v-layout row wrap>
            <device
                v-for="device in deviceList"
                v-bind:key="device.did"
                v-bind:did="device.did"
                v-bind:controlling-team="device.controllingTeam"
                v-bind:image="device.image"
            ></device>
        </v-layout>
    </v-container>
  </div>
</template>

<script>
import Device from './Device.vue'
import di from '../assets/futuristic_ammo_box_01.png'

export default {
  name: 'Admin',
  components: {
      Device
  },
  data: () => ({
      deviceList: [
        { did: 'impactful-badger', controllingTeam: true, image: di },
        { did: 'shameful-tortoise', controllingTeam: false, image: di },
        { did: 'vertical-ramrod', controllingTeam: true, image: di },
        { did: 'nonchalant-goose', controllingTeam: true, image: di },
        { did: 'mutinous-mouse', controllingTeam: true },
        { did: 'frightened-moat', controllingTeam: true },
      ]
  })
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
