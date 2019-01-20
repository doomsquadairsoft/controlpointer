<template>
  <div class="doom-alert">
    <v-alert :outline="theme === 'dark' ? true : false" :value="true" :type="level">
      <slot></slot>
    </v-alert>
  </div>
</template>

<script>
 //$store.commit('setThemeDark')
 import {
   mapGetters
 } from 'vuex'

  export default {
    name: 'DoomAlert',
    props: {
      level: {
        type: String,
        required: true
      }
    },
    computed: {
      ...mapGetters([
        'theme'
      ])
    },
  }
</script>

<style>
</style>
