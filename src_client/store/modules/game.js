export default {
    state: {
      metadata: {},
    },
    getters: {
        metadata: state => {
            return state.metadata;
        },
    },
    mutations: {
        setMetadata (state, metadata) {
            state.metadata = metadata;
        }
    }
}
