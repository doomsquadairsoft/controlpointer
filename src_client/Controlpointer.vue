<template>
    <v-app>


        <v-toolbar flat fixed app>
            <v-toolbar-side-icon @click.stop="drawer = !drawer">
            </v-toolbar-side-icon>
            <v-toolbar-title>DooM Squad Airsoft</v-toolbar-title>
        </v-toolbar>

        <v-navigation-drawer
            v-model="drawer"
            app
        >
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
            <router-view></router-view>
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
      { icon: 'build', text: 'Utilities', path: '/utilities'},
      { icon: 'code', text: 'Technical Info', path: '/technical-info'},
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
