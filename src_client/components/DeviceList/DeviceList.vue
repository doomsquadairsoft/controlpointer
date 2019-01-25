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
    import Device from '@/components/Device/Device.vue'
    import { mapActions, mapGetters } from 'vuex'


    export default {
        name: 'GameList',
        components: {
            Device
        },
        data () {
            return {
                placeholder: 'PLACEHOLDER',
                test: 'hi'
            }
        },
        props: {

        },
        computed: {
            ...mapGetters('device', {
                findDevicesInStore: 'find'
            }),
        },
        methods: {
            ...mapActions('device', {
                removeDevice: 'remove'
            }),
        }
    }
</script>

<style></style>
