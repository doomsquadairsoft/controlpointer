<template>
    <v-container grid-list-lg>
        <v-layout row>
            <h2>FACE</h2>
        </v-layout>
        <v-layout row wrap>
            <p>face</p>
        </v-layout>
    </v-container>
</template>

<script>
    import Face from './Face.vue'


    export default {
        name: 'Face',
        data () {
            return {
                placeholder: 'PLACEHOLDER',
                test: 'hi'
            }
        }
    }
</script>

<style></style>
