<template>
  <div class="new-device">
    <v-subheader>Create New Device</v-subheader>
    <v-container grid-list-lg>
        <v-layout row wrap>
            <v-text-field
                label="D3VICE ID"
                v-model="deviceID"
                required
            ></v-text-field>
        </v-layout>
        <v-layout row wrap>
            <v-text-field
                label="D3VICE latitude, longitude"
                v-model="latLng"
                required
            ></v-text-field>
        </v-layout>
        <v-layout row wrap>
            <v-btn
                @click="addDevice"
                v-bind:disabled="!isNameValid || !isLatLngValid"
            >
            submit
            </v-btn>
        </v-layout>
    </v-container>
  </div>
</template>

<script>
    import { mapState, mapGetters, mapActions } from 'vuex'


    export default {
      created () {
        //console.log(this.$store)
      },
      name: 'NewDevice',
      data: () => ({
          deviceID: '',
          errors: []
      }),
      props: {},
      computed: {
        isNameValid() {
            // device ID must be at least 3 characters
            return /.{3,}/.test(this.deviceName)
        },
        isLatLngValid() {
            // latLng must be in format <Number> latitude, <Number> longitude
            const rParse = /^-?(\d+\.\d+),\s?-?(\d+\.\d+)/.test(this.latLng)
            if (typeof rParse === 'undefined') {
                this.errors.push('Latitude and longitude must be in decimal format. Example: 47.62463825220757, -117.17959284771496')
                return false
            }
            return true
        },
        latLng() {
            return this.$store.getters.poi
        }
      },
      methods: {
        addDevice () {
            // create a new D3VICE then clear the input field
            //const rParse = /^-?(\d+\.\d+),\s?-?(\d+\.\d+)/.exec(this.latLng)

            //const lat = rParse[1];
            //const lng = rParse[2];



            this.createDevice({
                did: this.deviceID,
                latLng: this.latLng,
                controllingTeam: 0,
                redProgress: 0,
                bluProgress: 0
            }).then(this.clearInput)
        },
        clearInput () {
            this.deviceID = ''
        },
        ...mapActions('devices', {
            createDevice: 'create'
        })
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
