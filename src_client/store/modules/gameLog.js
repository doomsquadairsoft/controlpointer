export default {
    state: {
      isScrolledToBottom: false,
    },
    getters: {
        isScrolledToBottom: state => {
            return state.isScrolledToBottom;
        },
    },
    mutations: {
        setScrolledToBottom (state) {
            state.isScrolledToBottom = true;
        },
        unsetScrolledToBottom (state) {
            state.isScrolledToBottom = false;
        },
    }
}
