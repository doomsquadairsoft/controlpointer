<template>
    <v-map
        id="map"
        :zoom="zoom"
        :center="center"
        :maxZoom="maxZoom"
        v-on:l-click="updatePOI($event)"
    >
        <v-tilelayer
            :url="url"
        ></v-tilelayer>
        <v-marker
            v-for="d in devices"
            :title="d.did"
            :data-index="d._id"
            :lat-lng="d.latLng"
            :devices="devices.data"
        ></v-marker>

        <v-marker
            id="point-of-interest"
            :lat-lng="poi"
            :icon="targetIcon"
        ></v-marker>

    </v-map>
</template>


<script>

    import { mapState, mapGetters, mapActions } from 'vuex'
    import Vue2Leaflet from 'vue2-leaflet';
    import _ from 'lodash';





    export default {
        name: 'GameMap',
        components: {
            'v-map': Vue2Leaflet.Map,
            'v-tilelayer': Vue2Leaflet.TileLayer,
            'v-marker': Vue2Leaflet.Marker
        },
        props: {
            devices: {
                type: Array,
                required: true
            },
            patchDevice: Function
        },
        computed: {
            ...mapGetters([
                'center',
                'poi',
                'zoom',
                'maxZoom',
                'attribution',
                'url',
                'targetIcon'
            ])
            //center () {
            //    return this.$store.getters.center
            //},
            //poi () {
            //    return this.$store.getters.poi
            //}
        },
        methods: {
            updatePOI (event) {
                this.$store.commit('updatePOI', event.latlng)
            }
        }
    }
</script>

<style scoped >
    @import "~leaflet/dist/leaflet.css";
    #map {
        height: 500px;
        z-index: 5;
    }
</style>
