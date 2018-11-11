<template>
    <game-map
        :devices="devices.data"
        :patchDevice="patchDevice"
    ></game-map>
</template>


<script>

    import GameMap from './GameMap.vue';
    import { mapState, mapGetters, mapActions } from 'vuex'
    import NewDevice from '../NewDevice';



    export default {
        name: 'MapPage',
        components: {
            GameMap,
            NewDevice
        },
        data () {
            return {
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
        methods: {
            ...mapActions('devices', {
                findDevices: 'find',
                patchDevice: 'patch'
            }),
        },
        computed: {
            ...mapState('devices',
                'devices'
            ),
            ...mapGetters('devices', {
                findDevicesInStore: 'find'
            }),
            devices () {
                return this.findDevicesInStore({
                    query: {
                        $sort: {
                            createdAt: 1
                        }
                    }
                })
            }
        },
        created () {
            this.findDevices()
        }
    }
</script>

<style scoped >
</style>
