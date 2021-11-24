import { OpEntryAPI } from '@/api/opentry';
import { AcctAPI } from "@/api/acct";

const state = {
    /* Данные к таблице операций */
    opEntryList: [], // Список проводок
    selectedOpEntryRow: null, // Выбранная операция
    updatedOpEntryRow: null, // Обновленные данные выбранной операции

    /* Данные к таблице счетов */
    acctListByOpEntry: [], // Список счетов на проводку
    selectedAcctRow: null, // Выбранный счет
    updatedAcctRow: null, // Обновленные данные по выбранному счету
}

const getters = {
    opEntryList: s => s.opEntryList,
    selectedOpEntryRow: s => s.selectedOpEntryRow,
    updatedOpEntryRow: s => s.updatedOpEntryRow,

    acctListByOpEntry: s => s.acctListByOpEntry,
    selectedAcctRow: s => s.selectedAcctRow,
    updatedAcctRow: s => s.updatedAcctRow
}

const actions = {
    getOpEntryList: {
        root: true,
        async handler({ commit }) {
            const opEntryList = await OpEntryAPI.getOpEntryList()
            commit('SET_OPENTRY_LIST', opEntryList)
        }
    },

    setOpEntryList: {
        root: true,
        async handler({ commit }) {
            const opEntryList = await OpEntryAPI.getOpEntryList()
            commit('SET_OPENTRY_LIST', opEntryList)
        }
    },

    getAcctsListByOpEntry({ state, rootState, commit }) {
        const acctDb = rootState.acct.acctList.find(acct => acct.Acct === state.selectedOpEntryRow.AcctDB)
        const acctCr = rootState.acct.acctList.find(acct => acct.Acct === state.selectedOpEntryRow.AcctCr)

        commit('SET_ACCT_POS_LIST_BY_OPENTRY', [
            {
                Type: 'Счет дебета',
                ...acctDb
            },
            {
                Type: 'Счет кредита',
                ...acctCr
            }
        ])
    },

    async deleteOpEntry({ state, commit }) {
        // Удаляем запись из списка локально
        const updatedOpEntryByOpdateListIdx = state.opEntryList.findIndex(
            opEntry => opEntry.id === state.selectedOpEntryRow.id
        )
        const updatedOpEntryByOpdateList = [...state.opEntryList]
        updatedOpEntryByOpdateList.splice(updatedOpEntryByOpdateListIdx, 1);
        commit('SET_OPENTRY_LIST', updatedOpEntryByOpdateList)

        // Удаляем запись в db
        await OpEntryAPI.deleteOpEntry(state.selectedOpEntryRow.id)
        commit('SET_SELECTED_OPENTRY_ROW', null)
    },

    async updateOpEntry({ state, commit }) {
        // Локально обновляем запись в списке
        const selectedOpEntryIdx = state.opEntryList.findIndex(
            opEntry => opEntry.id === state.selectedOpEntryRow.id
        )
        const updatedOpEntryByOpdateList = [...state.opEntryList]
        updatedOpEntryByOpdateList.splice(selectedOpEntryIdx, 1, state.updatedOpEntryRow);
        commit('SET_OPENTRY_LIST', updatedOpEntryByOpdateList)

        // Обновляем запись в db
        const data = {...state.updatedOpEntryRow}
        delete data.edit_mode

        const updatedData = await OpEntryAPI.updateOpEntry(data.id, data)

        // Обновляем список opEntryList
        const updatedOpEntryList = [...state.opEntryList]
        const updatedOpEntryIdx = state.opEntryList.findIndex(
            opEntry => opEntry.id === updatedData.id
        )
        updatedOpEntryList.splice(updatedOpEntryIdx, 1, updatedData);
        commit('SET_OPENTRY_LIST', updatedOpEntryList)

        // Обновляем данные выбранной записи
        commit('SET_SELECTED_OPENTRY_ROW', {
            ...updatedData,
            edit_mode: false
        })

        commit('SET_UPDATED_OPENTRY_ROW', null)
    },

    async createOpEntry({ state, commit, dispatch }) {
        const data = { ...state.updatedOpEntryRow}
        delete data.edit_mode
        delete data.id

        const createdOpEntry = await OpEntryAPI.createOpEntry(data)

        const opEntryListWithNewRow = [
            {
                ...createdOpEntry,
                edit_mode: true
            },
            ...state.opEntryList
        ]
        opEntryListWithNewRow.splice(1, 1)
        commit('SET_OPENTRY_LIST', opEntryListWithNewRow)

        await AcctAPI.createAcct({
            Acct: createdOpEntry.AcctDB,
            Ost: 0
        })
        await AcctAPI.createAcct({
            Acct: createdOpEntry.AcctCr,
            Ost: 0
        })

        await dispatch('getAcctList', null, { root: true })
        dispatch('getAcctsListByOpEntry')

        commit('SET_SELECTED_OPENTRY_ROW', {
            ...createdOpEntry,
            edit_mode: false
        })
    },

    addOpEntryRow({ state, commit }) {
        const opEntryListWithEmptyRow = [...state.opEntryList]
        opEntryListWithEmptyRow.unshift({
            AcctCr: '',
            AcctDB: '',
            Amount: 0,
            OpDate: '',
            edit_mode: true,
            creatable: true
        });

        commit('SET_OPENTRY_LIST', opEntryListWithEmptyRow)
        commit('SET_SELECTED_OPENTRY_ROW', opEntryListWithEmptyRow[0])
    },

    cancelAddingOpEntry({ commit }) {
        const opEntryListWithoutEmptyRow = [...state.opEntryList]
        opEntryListWithoutEmptyRow.shift()

        commit('SET_OPENTRY_LIST', opEntryListWithoutEmptyRow)
        commit('SET_SELECTED_OPENTRY_ROW', null)
        commit('SET_UPDATED_OPENTRY_ROW', null)
    },

    async updateAcct({ state, commit }) {
        // Локально обновляем запись в списке
        const selectedAcctIdx = state.acctListByOpEntry.findIndex(acctPos => acctPos.id === state.selectedAcctRow.id)
        const updatedAcctList = [...state.acctListByOpEntry]
        updatedAcctList.splice(selectedAcctIdx, 1, state.updatedAcctRow);
        commit('SET_ACCT_POS_LIST_BY_OPENTRY', updatedAcctList)

        // Обновляем запись в db
        const data = {...state.updatedAcctRow}
        delete data.edit_mode
        const updatedData = await AcctAPI.updateAcct(data.id, data)

        // Обновляем данные выбранной записи
        commit('SET_SELECTED_ACCT_ROW', {
            ...updatedData,
            edit_mode: false
        })
        commit('SET_UPDATED_ACCT_ROW', null)
    },

    setSelectedOpEntryRow({ commit }, payload) {
        commit('SET_SELECTED_OPENTRY_ROW', payload)
    },

    setUpdatedOpEntryRow({ commit }, payload) {
        commit('SET_UPDATED_OPENTRY_ROW', payload)
    },

    setSelectedAcctRow({ commit }, payload) {
        commit('SET_SELECTED_ACCT_ROW', payload)
    },

    setUpdatedAcctRow({ commit }, payload) {
        commit('SET_UPDATED_ACCT_ROW', payload)
    }
}

const mutations = {
    SET_OPENTRY_LIST(state, payload) {
        state.opEntryList = payload
    },

    SET_ACCT_POS_LIST_BY_OPENTRY(state, payload) {
        state.acctListByOpEntry = payload
    },

    SET_SELECTED_OPENTRY_ROW(state, payload) {
        state.selectedOpEntryRow = payload
    },

    SET_UPDATED_OPENTRY_ROW(state, payload) {
        state.updatedOpEntryRow = payload
    },

    SET_SELECTED_ACCT_ROW(state, payload) {
        state.selectedAcctRow = payload
        console.log('state.selectedAcctRow = ', state.selectedAcctRow)
    },

    SET_UPDATED_ACCT_ROW(state, payload) {
        state.updatedAcctRow = payload
    }
}

export default {
    namespaced: true,
    state,
    actions,
    mutations,
    getters
}
