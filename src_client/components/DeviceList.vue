<template>
    <v-container grid-list-lg>
        <v-layout row>
            <h2>Active Devices</h2>
        </v-layout>
        <v-layout row wrap>
            <device
                v-for="d in devices"
                v-bind:key="d._id"
                v-bind:_id="d._id"
                v-bind:did="d.did"
                v-bind:location="d.location"
                v-bind:latLng="d.latLng"
                v-bind:createdAt="d.createdAt"
                v-bind:controllingTeam="d.controllingTeam"
                v-bind:bluProgress="d.bluProgress"
                v-bind:redProgress="d.redProgress"
                v-bind:image="d.image"
                v-bind:patchDevice="patchDevice"
                v-bind:removeDevice="removeDevice"
            ></device>
        </v-layout>
    </v-container>
</template>

<script>
    import Device from './Device.vue'
    import { mapActions } from 'vuex'


    export default {
        name: 'DeviceList',
        data () {
            return {
                placeholder: 'PLACEHOLDER',
                test: 'hi'
            }
        },
        props: {
            devices: {
                type: Array,
                required: true
            }
        },
        components: {
            Device
        },
        methods: {
            ...mapActions('devices', {
                patchDevice: 'patch',
                removeDevice: 'remove'
            })
        }
    }
</script>

<style></style>
