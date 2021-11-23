import { OpEntryAPI } from '@/api/opentry';

const state = {
    opEntryList: [], // Список проводок
}

const getters = {
    opEntryList: s => s.opEntryList,
}

const actions = {
    getOpEntryList: {
        root: true,
        async handler({ commit }) {
            const opEntryList = await OpEntryAPI.getOpEntryList()
            commit('SET_OP_ENTRY_LIST', opEntryList)
        }
    },

    setOpEntryList: {
        root: true,
        async handler({ commit }) {
            const opEntryList = await OpEntryAPI.getOpEntryList()
            commit('SET_OP_ENTRY_LIST', opEntryList)
        }
    }
}

const mutations = {
    SET_OP_ENTRY_LIST(state, payload) {
        state.opEntryList = payload
    }
}

export default {
    namespaced: true,
    state,
    actions,
    mutations,
    getters
}
