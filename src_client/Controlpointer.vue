<template>
    <v-app>


        <v-toolbar flat fixed app>
            <v-toolbar-side-icon @click.stop="drawer = !drawer">
            </v-toolbar-side-icon>
            <v-toolbar-title>DooM Squad Airsoft</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items class="hidden-sm-and-down">
                <v-btn flat>Link One</v-btn>
                <v-btn flat>Link Two</v-btn>
                <v-btn flat>Link Three</v-btn>
            </v-toolbar-items>
        </v-toolbar>

        <v-navigation-drawer
            fixed
            v-model="drawer"
            absolute
            app
        >
            <v-list class="pa-1">

                <v-list-tile>
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
            <v-container>
                <router-view></router-view>
            </v-container>
        </v-content>
        <v-footer app></v-footer>
    </v-app>
</template>

<script>

export default {
  name: 'Controlpointer',
  data: () => ({
    drawer: true,
    menuItems: [
      { icon: 'home', text: 'Home', path: '/'},
      { icon: 'subject', text: 'About', path: '/about'},
      { icon: 'announcement', text: 'Operation: Green Fox II', path: '/green-fox-ii'},
      { icon: 'map', text: 'Map', path: '/map'},
      { icon: 'lock', text: 'Administration', path: '/admin'},
      { icon: 'code', text: 'Technical Info', path: '/technical-info' },
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
