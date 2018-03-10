<template>
  <div id="controlpointer">
    <img src="./assets/logo.png">
    <Welcome msg="Welcome to Controlpointer App"/>
    <Welcome msg="Takko boii"/>
  </div>
</template>

<script>
import Welcome from './components/Welcome.vue'

export default {
  name: 'Controlpointer',
  components: {
    Welcome
  }
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
