<template>
    <div>
        <p>Device: {{ myDevice }}</p>
        <p>Game: {{ myGame }}</p>
        <v-map
            id="map"
            :zoom="zoom"
            :center="myDevice.latLng"
            :maxZoom="maxZoom"
            v-on:l-click="updatePOI($event)"
            ref="map"
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
    </div>
</template>


<script>

    import { mapState, mapGetters, mapActions } from 'vuex'
    import Vue2Leaflet from 'vue2-leaflet';
    import _ from 'lodash';
    import { propEq, find } from 'ramda';


    import tIcon from '@/assets/target-marker.png'
    import uIcon from '@/assets/marker_UNK_s.png'
    import rIcon from '@/assets/marker_RED_s.png'
    import bIcon from '@/assets/marker_BLU_s.png'
    import sIcon from '@/assets/marker_shadow.png'






    export default {
        name: 'Map',
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
        },
        computed: {
            ...mapGetters([
                'poi',
                'zoom',
                'maxZoom',
                'attribution',
                'url'
            ]),
            myGame() {
                const gameIdViaRoute = this.$route.params.gameId;
                const mg = this.findGame({ query: { _id: gameIdViaRoute } });
                return mg;
            },
            myDevice() {
                const deviceIdViaRoute = this.$route.query.deviceId;
                return this.findDevices({ query: { _id: deviceIdViaRoute } });
            }
        },
        mounted: function () {
            window.addEventListener('resize', this.handleResize);
            this.handleResize();
        },
        beforeDestroy: function () {
            window.removeEventListener('resize', this.handleResize);
        },
        methods: {
            ...mapActions('devices', {
                findDevices: 'find'
            }),
            ...mapActions('game', {
                findGame: 'find'
            }),
            handleResize(evt) {
                //$("#map").height($(window).height());
                // console.log(window.innerHeight)
                this.$refs.map.$el.style.height = `${window.innerHeight-48}px`;
                this.$refs.map.mapObject.invalidateSize();
            },
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
            },
        }
    }
</script>

<style scoped >
    @import "~leaflet/dist/leaflet.css";
    #map {
        height: 90vh;
        width: 100%;
        z-index: 5;
    }
</style>
