<template>
<v-layout column align-space-around>
  <v-card>
    <v-container>
      <div>
        <h2>PAmmy</h2>
        <div>Use Public Address system to announce game events</div>
        <v-checkbox :label="`PAmmy Enabled: ${isPammyEnabled.toString()}`" v-model="isPammyEnabled"></v-checkbox>
        <div>
          <v-btn color="success" :disabled="!isPammyEnabled" @click="testVoice">Test TTS</v-btn>
        </div>
      </div>
    </v-container>
  </v-card>
</v-layout>
</template>

<script>
var synth = window.speechSynthesis;

export default {
  name: 'Pammy',
  components: {},
  data: () => ({
    isPammyEnabled: false
  }),
  methods: {
    testVoice() {
      var utterThis = new SpeechSynthesisUtterance('testing 1 2 3');
      synth.speak(utterThis)
    }
  },
  created() {

  }
}
</script>

<style>
</style>
