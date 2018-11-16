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
            :key="d.key"
            :title="d.did"
            :data-index="d._id"
            :lat-lng="d.latLng"
            :icon="controlpointIcon(d.bluProgress, d.redProgress)"
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


    import tIcon from '@/assets/target-marker.png'
    import uIcon from '@/assets/marker_UNK_s.png'
    import rIcon from '@/assets/marker_RED_s.png'
    import bIcon from '@/assets/marker_BLU_s.png'
    import sIcon from '@/assets/marker_shadow.png'






    export default {
        name: 'GameMap',
        components: {
            'v-map': Vue2Leaflet.Map,
            'v-tilelayer': Vue2Leaflet.TileLayer,
            'v-marker': Vue2Leaflet.Marker,
        },
        data () {
            return {
                targetIcon: L.icon({
                    iconUrl: tIcon,
                    iconSize: [32, 37],
                    iconAnchor: [16, 37],
                    popupAnchor: [0, -28]
                }),
                redIcon: L.icon({
                    iconUrl: rIcon,
                    iconSize: [60, 61],
                    iconAnchor: [32, 32],
                    popupAnchor: [0, 32]
                }),
                unkIcon: L.icon({
                    iconUrl: uIcon,
                    iconSize: [60, 61],
                    iconAnchor: [32, 32],
                    popupAnchor: [0, 32]
                }),
                bluIcon: L.icon({
                    iconUrl: bIcon,
                    iconSize: [60, 61],
                    iconAnchor: [32, 32],
                    popupAnchor: [0, 32]
                }),
                shadowIcon: L.icon({
                    iconUrl: sIcon,
                    iconSize: [60, 61],
                    iconAnchor: [32, 32],
                    popupAnchor: [0, 32]
                }),
            }
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
                'url'
            ]),


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
            },
            controlpointIcon (bluProgress, redProgress) {

                if (redProgress >= 100) {
                    return this.redIcon; // @TODO this should not mutate state outside of mutation handler
                } else if (bluProgress >= 100) {
                    return this.bluIcon;
                } else {
                    return this.unkIcon;
                }
            }
        }
    }
</script>

<style scoped >
    @import "~leaflet/dist/leaflet.css";
    #map {
        min-height: 500px;
        height: 100%;
        width: 100%;
        z-index: 5;
    }
</style>
