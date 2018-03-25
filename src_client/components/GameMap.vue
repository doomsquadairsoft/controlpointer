<template>
    <v-container>
        <v-layout>
            <v-flex xs12>
                <v-map
                id="map"
                :zoom="zoom"
                :center="center">
                    <v-tilelayer
                        :url="url"
                    ></v-tilelayer>
                    <v-marker
                        :lat-lng="markerCenter"
                    ></v-marker>
                </v-map>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>

    import Vue2Leaflet from 'vue2-leaflet';

    export default {
        name: 'GameMap',
        components: {
            'v-map': Vue2Leaflet.Map,
            'v-tilelayer': Vue2Leaflet.TileLayer,
            'v-marker': Vue2Leaflet.Marker
        },
        data () {
            return {
                center: [47.62463825220757, -117.17959284771496],
                markerCenter: [47.63463825220757, -117.18959284771496],
                url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
                zoom: 18,
                id: 'mapbox.streets',
                minZoom: 20,
                maxZoom: 25,
                title: 'test marker',
                draggable: true,
                opacity: 0.5
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
