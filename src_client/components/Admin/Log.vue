<template>
  <div class="activity-log">
    <v-container grid-list-lg>
        <v-layout row wrap>
            <v-flex xs12>
            <v-card>
                <v-toolbar color="cyan" dark>
                  <v-toolbar-side-icon></v-toolbar-side-icon>
                  <v-toolbar-title>Activity Log</v-toolbar-title>
                  <v-spacer></v-spacer>
                </v-toolbar>
                <v-list two-line>
                  <template v-for="(item, index) in items">
                    <v-subheader v-if="item.header" :key="item.header">{{ item.header }}</v-subheader>
                    <v-divider v-else-if="item.divider" :inset="item.inset" :key="index"></v-divider>
                    <v-list-tile avatar v-else :key="item.title" @click="">
                      <v-list-tile-avatar>
                        <img :src="item.avatar">
                      </v-list-tile-avatar>
                      <v-list-tile-content>
                        <v-list-tile-title v-html="item.title"></v-list-tile-title>
                        <v-list-tile-sub-title v-html="item.subtitle"></v-list-tile-sub-title>
                      </v-list-tile-content>
                    </v-list-tile>
                  </template>
                </v-list>
              </v-card>
            </v-flex>
        </v-layout>
    </v-container>
  </div>
</template>

<script>
    export default {
        name: 'Log',
        data: () => ({
            items: [
                {
                    header: 'Today',
                    avatar: 'derp.jpg',
                    title: 'yolo 420 blazeit'
                },
            ]
        })
    }
</script>

<style scoped>
</style>
