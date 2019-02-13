<template>
<v-app :dark="useDarkTheme">

  <div>
    <v-toolbar color="rgba(33, 33, 33, 1)" fixed app tabs>
      <v-toolbar-side-icon @click.stop="drawer = !drawer">
      </v-toolbar-side-icon>
      <v-toolbar-title>DooM HQ</v-toolbar-title>
    </v-toolbar>




    <v-navigation-drawer touchless v-model="drawer" app>
      <v-list class="pa-1">

        <v-list-tile>
          <v-list-tile-action>
            <v-btn flat icon @click.stop="drawer = !drawer">
              <v-icon>menu</v-icon>
            </v-btn>
          </v-list-tile-action>
          <v-list-tile-title class="title">
            DooM HQ
          </v-list-tile-title>
        </v-list-tile>


      </v-list>

      <v-list class="pt-0" dense>
        <v-divider></v-divider>
        <v-list-tile v-for="item in menuItems" :key="item.title" :to="item.path" @click="">
          <v-list-tile-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>
              {{ item.text }}
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
      </v-toolbar>
      <v-divider></v-divider>
    </v-navigation-drawer>

    <v-content>
      <router-view :devices="devices.data" :timeline="timeline.data" :game="game.data" :metadata="metadata.data" :useDarkTheme="useDarkTheme"></router-view>
    </v-content>
    <!-- <v-footer app></v-footer> -->
    <div id="bottom"></div>
  </div>
</v-app>
</template>

<script>
import {
  mapState,
  mapGetters,
  mapActions
} from 'vuex'


export default {

  name: 'Controlpointer',
  computed: {
    useDarkTheme() {
      return this.$store.getters.theme === 'dark'
    },
    ...mapGetters('devices', {
      findDevicesInStore: 'find'
    }),
    ...mapGetters('timeline', {
      findTimelineInStore: 'find'
    }),
    ...mapGetters('game', {
      findGameInStore: 'find'
    }),
    ...mapGetters('metadata', {
      findMetadataInStore: 'find'
    }),
    game() {
      return this.findGameInStore({
        query: {
          $sort: {
            createdAt: 1
          }
        }
      })
    },
    devices() {
      return this.findDevicesInStore({
        query: {
          $sort: {
            createdAt: 1
          }
        }
      })
    },
    timeline() {
      return this.findTimelineInStore({
        query: {
          $sort: {
            createdAt: 1
          },
          $filter: {
            gameId: this._id
          }
        }
      })
    },
    metadata() {
      return this.findMetadataInStore({
        query: {
          $sort: {
            createdAt: 1
          }
        }
      })
    },
  },
  methods: {
    ...mapActions('devices', {
      findDevices: 'find'
    }),
    ...mapActions('timeline', {
      findTimeline: 'find'
    }),
    ...mapActions('game', {
      findGame: 'find'
    }),
    ...mapActions('metadata', {
      findMetadata: 'find'
    }),
  },
  created() {
    this.findDevices();
    this.findTimeline();
    this.findGame();
    this.findMetadata();
  },
  data: () => ({
    items: ['tiesto', 'aphex twin', 'kaskade'],
    tab: null,
    drawer: true,
    menuItems: [
      {
        icon: 'live_help',
        text: 'About',
        path: '/'
      },
      {
        icon: 'card_travel',
        text: 'D3VICES',
        path: '/device'
      },
      {
        icon: 'games',
        text: 'Games',
        path: '/game'
      },
      {
        icon: 'settings',
        text: 'Settings',
        path: '/settings'
      },
    ]
  })


}
</script>


<style>
#controlpointer {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
