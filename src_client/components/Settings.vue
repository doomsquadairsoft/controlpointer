<template>
<v-container class="pa-0 pt-3">
  <v-card class="e4">
    <v-img height="200px" :src="settingsImage">
      <v-container fill-height fluid>
        <v-layout fill-height>
          <v-flex xs12 align-end flexbox>
            <span class="headline white--text">Settings</span>
          </v-flex>
        </v-layout>
      </v-container>
    </v-img>
    <v-card-text>
      <v-container fluid grid-list-lg>
        <v-layout row wrap>
          <v-card-title>
            <div>
              <span class="grey--text">Theme</span><br>
            </div>
          </v-card-title>
          </v-flex>
        </v-layout>
        <v-layout row wrap>
          <v-flex xs12 sm4 text-xs-center>
            <div>
              <v-btn @click="$store.commit('setThemeDark')" depressed large color="primary">Dark</v-btn>
            </div>
            <div>
              <v-btn @click="$store.commit('setThemeLight')" depressed large color="primary">Light</v-btn>
            </div>
          </v-flex>
        </v-layout>
      </v-container>
    </v-card-text>


    <v-container>
      <v-layout>
        <v-flex>
          Controlpointer Version {{ version }}
        </v-flex>
      </v-layout>
    </v-container>
  </v-card>
</v-container>
</template>

<script>
import gearImage from '@/assets/settings.png'
import {
  mapActions,
  mapGetters
} from 'vuex'


export default {
  name: 'Settings',
  data() {
    return {
      placeholder: 'PLACEHOLDER'
    }
  },
  props: {
    settingsImage: {
      type: String,
      default: gearImage
    },
  },
  computed: {
    isDarkTheme() {
      return this.theme === 'dark'
    },
    version() {
      return __CONTROLPOINTER_VERSION__;
    }
  }
}
</script>

<style></style>
