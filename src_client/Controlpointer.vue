<template>
<v-app :dark="useDarkTheme">

  <div>
    <v-toolbar color="rgba(33, 33, 33, 1)" fixed app tabs>
      <v-toolbar-side-icon @click.stop="drawer = !drawer">
      </v-toolbar-side-icon>
      <v-toolbar-title>DooM D3vices</v-toolbar-title>
    </v-toolbar>




    <v-navigation-drawer v-model="drawer" app>
      <v-list class="pa-1">

        <v-list-tile>
          <v-list-tile-action>
            <v-btn flat icon @click.stop="drawer = !drawer">
              <v-icon>menu</v-icon>
            </v-btn>
          </v-list-tile-action>
          <v-list-tile-title class="title">
            DooM Squad Airsoft
          </v-list-tile-title>
        </v-list-tile>

        <v-list-tile avatar>
          <v-list-tile-avatar>
            <img src="https://randomuser.me/api/portraits/men/85.jpg">
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title>Test User</v-list-tile-title>
          </v-list-tile-content>
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
      <router-view :devices="devices.data" :timeline="timeline.data" :game="game.data" :useDarkTheme="useDarkTheme"></router-view>
    </v-content>
    <!-- <v-footer app></v-footer> -->
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
  },
  created() {
    this.findDevices();
    this.findTimeline();
    this.findGame();
  },
  data: () => ({
    items: ['tiesto', 'aphex twin', 'kaskade'],
    tab: null,
    drawer: true,
    menuItems: [{
        icon: 'home',
        text: 'Home',
        path: '/'
      },
      {
        icon: 'subject',
        text: 'About',
        path: '/about'
      },
      {
        icon: 'announcement',
        text: 'Operation: Green Fox III',
        path: '/green-fox-iii'
      },
      {
        icon: 'games',
        text: 'Games',
        path: '/game'
      },
      {
        icon: 'card_travel',
        text: 'D3VICES',
        path: '/devices'
      },
      {
        icon: 'all_out',
        text: 'Virtual Controlpoint',
        path: '/controlpoint'
      },
      {
        icon: 'build',
        text: 'Utilities',
        path: '/utilities'
      },
      {
        icon: 'attach_money',
        text: 'Shop',
        path: '/shop'
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
