<template>
    <v-container grid-list-lg>
        <v-layout row wrap>
            <p>GameList</p>
            <game
                v-for="g in game"
                :game="g"
                :key="g._id"
                :_id="g._id"
                :removeGame="removeGame"
                :findTimeline="findTimeline"
            ></game>
        </v-layout>
    </v-container>
</template>

<script>
    import Game from './Game/Game.vue'
    import { mapActions, mapGetters } from 'vuex'


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
        computed: {
            ...mapGetters('timeline', {
                findTimeline: 'find'
            })
        },
        methods: {
            ...mapActions('game', {
                removeGame: 'remove'
            })
        }
    }
</script>

<style></style>
