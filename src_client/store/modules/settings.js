export default {
    state: {
      theme: 'dark'
    },
    getters: {
        theme: state => {
            return state.theme;
        }
    },
    mutations: {
        setThemeDark (state) {
            state.theme = 'dark';
        },
        setThemeLight (state) {
            state.theme = 'light';
        }
    }
}
