


export default {
    state: {
        center: [47.62463825220757, -117.17959284771496],
        url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        zoom: 18,
        maxZoom: 18,
        poi: [47.62473825220757, -117.17969284771496]
    },
    getters: {
        center: state => {
            return state.center;
        },
        url: state => {
            return state.url;
        },
        attribution: state => {
            return state.attribution;
        },
        zoom: state => {
            return state.zoom;
        },
        maxZoom: state => {
            return state.maxZoom;
        },
        poi: state => {
            return state.poi
        },
    },
    mutations: {
        increment (state) {
            state.count++;
        },
        decrement (state) {
            state.count--;
        },
        updatePOI (state, latLng) {
            state.poi = latLng;
        }
    }
}
