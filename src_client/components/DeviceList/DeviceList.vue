<template>
    <v-container grid-list-lg>
        <v-layout row wrap>
            <p>DeviceList</p>
            <game
                v-for="d in devices"
                v-bind:key="d._id"
                v-bind:_id="d._id"
                v-bind:captureRate="d.captureRate"
                v-bind:createdAt="d.createdAt"
                v-bind:gameLength="d.gameLength"
                v-bind:removeGame="removeGame"
            ></game>
        </v-layout>
    </v-container>
</template>

<script>
    import Devices from './Devices/Devices.vue'
    import { mapActions } from 'vuex'


    export default {
        name: 'GameList',
        data () {
            return {
                placeholder: 'PLACEHOLDER',
                test: 'hi'
            }
        },
        props: {
            game: {
                type: Array,
                required: true
            }
        },
        components: {
            Game
        },
        methods: {
            ...mapActions('game', {
                removeGame: 'remove'
            })
        }
    }
</script>

<style></style>
