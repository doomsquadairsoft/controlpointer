<template>
    <v-container grid-list-lg>
        <v-layout row wrap>
            <p>Games</p>
            <game
                v-for="g in game"
                v-bind:key="g._id"
                v-bind:_id="g._id"
                v-bind:captureRate="g.captureRate"
                v-bind:createdAt="g.createdAt"
                v-bind:gameLength="g.gameLength"
                v-bind:removeGame="removeGame"
            ></game>
        </v-layout>
    </v-container>
</template>

<script>
    import Game from './Game.vue'
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
