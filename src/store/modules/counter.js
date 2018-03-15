export default {
    state: {
      count: 0
    },
    getters: {
        count: state => {
            return state.count;
        }
    },
    mutations: {
        increment (state) {
            state.count++;
        },
        decrement (state) {
            state.count--;
        }
    }
}
