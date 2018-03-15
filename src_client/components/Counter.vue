<template>
  <div class="counter">
    <h1>COUNTER COUNT: {{ count }}</h1>
    <p>
        <button @click="$store.commit('increment')">+</button>
        <button @click="$store.commit('decrement')">-</button>
    </p>
  </div>
</template>

<script>
    export default {
        name: 'Counter',
        computed: {
            count () {
                return this.$store.getters.count
            }
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1 {
  color: red;
}

</style>
