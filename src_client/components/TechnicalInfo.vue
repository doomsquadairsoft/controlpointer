<template>
  <v-container id="technical-info">
    <v-layout>
    <v-flex md9>
    <img src="../assets/logo.png">
    <router-view></router-view>
    <h1>Controlpointer</h1>
    <h3>Airsoft Field Control Point Manager</h3>
    <p>So you have an airsoft field, and you want to play a game using control points just like [INSERT_VIDEOGAME_NAME_HERE]. You can set up flags at each of your control points, but there lies a problem, especially for large fields. When your players are "dead" and want to go to a control point to respawn, how do they know which control point is available for their team to respawn at?</p>
    <p>This app solves the above problem by providing each player with a live map of the game field. The map is optimized for mobile and can be advertised on your field using printed QR codes.</p>
    </p>Controlpointer is part of a networked system consisting of a game server, and one or more wireless push button devices placed at each controlpoint on the field. The Controlpoint game server knows which team controls what points, and renders that information onto a live map which the player can view on their phone after they are hit.</p>
    <p>
      Controlpointer is <a href="https://unlicense.org" target="_blank">Unlicense</a> software by <a href="https://grimtech.net/about" target="_blank">Chris Grimmett</a> of <a href="http://doomsquadairsoft.com" target="_blank">DooM Squad Airsoft</a>
      <a href="https://github.com/doomsquadairsoft/controlpointer" target="_blank">Controlpointer Code Repository</a>
    </p>
    </p>
      Controlpointer uses DooM Devices
      <a href="https://github.com/doomsquadairsoft/d3vice-controlpoint-xbee" target="_blank">DooM D3VICE Code Repository</a>
    </p>
    <counter></counter>

  </v-flex>
</v-layout>
  </v-container>
</template>

<script>
    import Counter from './Counter.vue'

    export default {
      name: 'TechnicalInfo',
      components: {
          Counter
      }
    }
</script>
