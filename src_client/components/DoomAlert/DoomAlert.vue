<template>
  <v-container class="pb-0">
    <v-alert
    :outline="theme === 'dark' ? true : false"
    :value="true"
    :type="level"
    >
      <slot></slot>
    </v-alert>
  </v-container>
</template>

<script>
 import {
   mapGetters
 } from 'vuex'

  export default {
    name: 'DoomAlert',
    data() {
      return {
        bleh: true
      }
    },
    props: {
      level: {
        type: String,
        default: 'info'
      }
    },
    computed: {
      ...mapGetters([
        'theme'
      ])
    }
  }
</script>

<style>
  .sexy {
    color: red !important;
  }
  .light {
    color: green !important;
  }
</style>
