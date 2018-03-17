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
            <v-btn
                @click="addDevice"
                v-bind:disabled="!isNameValid"
            >
            submit
            </v-btn>
        </v-layout>
    </v-container>
  </div>
</template>

<script>


    export default {
      name: 'NewDevice',
      data: () => ({
          deviceID: ''
      }),
      props: {
        createDevice: Function
      },
      computed: {
        isNameValid() {
            return /.{3,}/.test(this.deviceName)
        }
      },
      methods: {
        addDevice () {
            // create a new D3VICE then clear the input field
            this.createDevice({did: this.deviceID}).then(this.clearInput)
        },
        clearInput () {
            this.deviceID = ''
        }
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
