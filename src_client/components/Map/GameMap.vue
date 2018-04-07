<template>
    <v-map
        id="map"
        :zoom="zoom"
        :center="center"
        :maxZoom="maxZoom"
        v-on:l-click="$store.commit('updatePOI', $event.latlng)"
    >
        <v-tilelayer
            :url="url"
        ></v-tilelayer>
        <v-marker
            v-for="d in devices"
            :title="d.did"
            :data-index="d._id"
            :draggable=true
            :lat-lng="d.latLng"
            :patchDevice="patchDevice"
            :devices="devices.data"
            v-on:l-drag="changeDeviceLocation(d)"
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
    import target from '../../assets/baseball-marker.png'





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
        data () {
            return {
                targetIcon: L.icon({
                    iconUrl: target,
                    iconSize: [32, 37],
                    iconAnchor: [16, 37],
                    popupAnchor: [0, -28]
                }),
                markerCenter: L.latLng(47.62463825220757, -117.17959284771496),
                url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
                zoom: 18,
                id: 'mapbox.streets',
                minZoom: 20,
                maxZoom: 18,
                title: 'test marker',
                draggable: true,
                opacity: 0.5
            }
        },
        computed: {
            center () {
                return this.$store.getters.center
            },
            poi () {
                return this.$store.getters.poi
            }
        },
        methods: {
            changeDeviceLocation: _.debounce(
                    function (d) {
                        console.log(d)
                        this.patchDevice([d._id, {latLng: d.latLng}, undefined])
                    }, 500),

            displayLatLng: function (e) {
                console.log('clicked ')
                console.log(e);
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
