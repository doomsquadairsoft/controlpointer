<template>
<v-container grid-list-lg>
  <v-layout row wrap>
    <div id="utilities-page">
      <router-view></router-view>
      <h1>Utilities</h1>
      <h3>Tools to aid field administrators</h3>
      <player-identity-generator></player-identity-generator>
    </div>
  </v-layout>
  <v-layout row>
    <v-flex>
      <settings></settings>
    </v-flex>
  </v-layout>
</v-container>
</template>

<script>
import PlayerIdentityGenerator from './PlayerIdentityGenerator/PlayerIdentityGenerator'
import Settings from '@/components/Settings'

export default {
  name: 'Utilities',
  components: {
      PlayerIdentityGenerator,
      Settings
  }
}
</script>
