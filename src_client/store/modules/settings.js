export default {
    state: {
      theme: 'dark',
      devmode: false
    },
    getters: {
        theme: state => {
            return state.theme;
        },
        devmode: state => {
            return state.devmode;
        }
    },
    mutations: {
        setThemeDark (state) {
            state.theme = 'dark';
        },
        setThemeLight (state) {
            state.theme = 'light';
        },
        setDevmodeOn (state) {
          state.devmode = true;
        },
        setDevmodeOff (state) {
          state.devmode = false;
        }
    }
}
