
const mutations = {
  changeControllingTeamBlue (state, amt) {
    state.patchDevice([state._id, {
      bluProgress: 100,
      redProgress: 0
    }, undefined])
  },
  changeControllingTeamRed (state, amt) {
    state.patchDevice([state._id, {
      bluProgress: 0,
      redProgress: 100
    }, undefined])
  },
  changeControllingTeamUnk (state, amt) {
    state.patchDevice([state._id, {
      bluProgress: 0,
      redProgress: 0
    }, undefined])
  }
}

const actions = {
  changeControllingTeamBlue (state) {
    state.commit('changeControllingTeamBlue')
  },
  changeControllingTeamRed (state) {
    state.commit('changeControllingTeamRed')
  },
  changeControllingTeamUnc (state) {
    state.commit('changeControllingTeamUnc')
  }
}


export default {
    state: {
      count: 0
    },
    getters: {
        count: state => {
            return state.count;
        }
    },
    mutations,
    actions
}
