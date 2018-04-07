export default {
    state: {
      center: [47.62463825220757, -117.17959284771496],
      poi: [47.62473825220757, -117.17969284771496]
    },
    getters: {
        center: state => {
            return state.center;
        },
        centerString: state => {
            return `${state.center[0]}, ${state.center[1]}`
        },
        poi: state => {
            return state.poi
        },
        poiString: state => {
            return `${state.poi.lat}, ${state.poi.lng}`
        }
    },
    mutations: {
        set (state, latLng) {
            state.center = latLng;
        },
        updatePOI (state, latLng) {
            state.poi = latLng;
        }
    }
}
