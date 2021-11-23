import { OpdateAPI } from '@/api/opdate';

const state = {
    opDateList: [], // Список опердней
}

const getters = {
    opDateList: s => s.opDateList,
}

const actions = {
    async getOpDateList({ commit }) {
        const opDateList = await OpdateAPI.getOpDateList()
        commit('SET_OP_DATE_LIST', opDateList)
    },
}

const mutations = {
    SET_OP_DATE_LIST(state, payload) {
        state.opDateList = payload
    },
}

export default {
    namespaced: true,
    state,
    actions,
    mutations,
    getters
}
