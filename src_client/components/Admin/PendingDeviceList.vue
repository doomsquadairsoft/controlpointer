<template>
    <v-container grid-list-lg>
        <v-layout row>
            <h2>Inactive Devices</h2>
        </v-layout>
        <v-layout row wrap>
            <pending-device
                v-for="pd in pendingDevices"
                v-bind:key="pd._id"
                v-bind:_id="pd._id"
                v-bind:did="pd.did"
                v-bind:latLng="pd.latLng"
                v-bind:createdAt="pd.createdAt"
                v-bind:image="pd.image"
                v-bind:patchPendingDevice="patchPendingDevice"
                v-bind:removePendingDevice="removePendingDevice"
                v-bind:createDevice="createDevice"
            ></pending-device>
        </v-layout>
    </v-container>
</template>

<script>
    import PendingDevice from './PendingDevice.vue'
    import { mapActions } from 'vuex'


    export default {
        name: 'PendingDeviceList',
        data () {
            return {
                placeholder: 'PLACEHOLDER',
                test: 'hi'
            }
        },
        props: {
            pendingDevices: {
                type: Array,
                required: true
            },
            findPendingDevices: Function
        },
        components: {
            PendingDevice
        },
        methods: {
            ...mapActions('pdevices', {
                patchPendingDevice: 'patch',
                removePendingDevice: 'remove'
            }),
            ...mapActions('devices', {
                removeDevice: 'remove',
                createDevice: 'create'
            })
        }
    }
</script>

<style></style>
