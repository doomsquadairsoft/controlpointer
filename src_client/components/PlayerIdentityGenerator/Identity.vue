<template>
    <v-container grid-list-lg>
        <v-layout row>
            <h2>Identity</h2>
        </v-layout>
        <v-layout row wrap>
            <face></face>
        </v-layout>
    </v-container>
</template>

<script>
    import Face from './Face.vue'
    import defaultFace from '@/assets/placeholder-face.png'

    export default {
        name: 'Identity',
        props: {
            avatar: {
                type: String,
                default: defaultFace
            },
            class: {
                type: String,
                default: 'Rifleman'
            },
            _id: String,
            teamNumber: {
                type: Number,
                default: 0
            }
        },
        data () {
            return {
                placeholder: 'PLACEHOLDER',
                test: 'hi'
            }
        }
    }
</script>

<style></style>
