import { OpdateAPI } from '@/api/opdate';
import { OpEntryAPI } from "@/api/opentry";

const state = {
    /* Данные к таблице операционных дней */
    opDateList: [], // Список опердней
    selectedOpDateRow: null, // Выбранный опердень
    updatedOpDateRow: null, // Обновленные данные выбранного опердня

    /* Данные к таблице проводок по выбранному опердню */
    opEntryListByOpdate: [], // Список проводок по дню
    selectedOpEntryRow: null, // Выбранная проводка по счету
    updatedOpEntryRow: null, // Обновленные данные выбранной проводки
}

const getters = {
    opDateList: s => s.opDateList,
    selectedOpDateRow: s => s.selectedOpDateRow,
    updatedOpDateRow: s => s.updatedOpDateRow,

    opEntryListByOpdate: s => s.opEntryListByOpdate,
    selectedOpEntryRow: s => s.selectedOpEntryRow,
    updatedOpEntryRow: s => s.updatedOpEntryRow
}

const actions = {
    async getOpDateList({ commit }) {
        const opDateList = await OpdateAPI.getOpDateList()
        commit('SET_OP_DATE_LIST', opDateList)
    },

    getOpEntryListByOpDate({ rootState, commit }, payload) {
        const opEntryListByOpDate = rootState.opentry.opEntryList.filter(opEntry => opEntry.OpDate === payload.OpDate)
        commit('SET_OPENTRY_LIST_BY_OPDATE', opEntryListByOpDate)
    },

    addOpDateRow({ state, commit }) {
        const opdateListWithEmptyRow = [...state.opDateList]
        opdateListWithEmptyRow.unshift({
            OpDate: '',
            edit_mode: true,
            creatable: true
        });

        commit('SET_OP_DATE_LIST', opdateListWithEmptyRow)
        commit('SET_SELECTED_OPDATE_ROW', opdateListWithEmptyRow[0])
        commit('SET_OPENTRY_LIST_BY_OPDATE', [])
    },

    async deleteOpdate({ state, commit }) {
        // Удаляем запись из списка локально
        const updatedOpDateIdx = state.opDateList.findIndex(opDate => opDate.id === state.selectedOpDateRow.id)
        const updatedOpDateList = [...state.opDateList]
        updatedOpDateList.splice(updatedOpDateIdx, 1);
        commit('SET_OP_DATE_LIST', updatedOpDateList)

        // Удаляем запись в db
        await OpdateAPI.deleteOpDate(state.selectedOpDateRow.id)
        commit('SET_SELECTED_OPDATE_ROW', null)
    },

    async createOpDate({ commit, dispatch }) {
        const data = { ...state.updatedOpDateRow}
        delete data.edit_mode
        delete data.id

        // TODO wtf? оптимизируй
        const createdOpDate = await OpdateAPI.createOpDate(data)
        commit('SET_SELECTED_OPDATE_ROW', {
            ...createdOpDate,
            edit_mode: true
        })
        commit('SET_OP_DATE_LIST', [{ ...state.selectedOpDateRow }, ...state.opDateList])

        // Заменяем поле создания уже созданным экземпляром
        // const opDateListWithNewRow = [
        //     {
        //         ...createdOpDate,
        //         edit_mode: true
        //     },
        //     ...state.opDateList
        // ]

        const opDateListWithNewRow = [...state.opDateList]
        opDateListWithNewRow.splice(1, 1)
        commit('SET_OP_DATE_LIST', opDateListWithNewRow)

        // await dispatch('getOpEntryList', null, { root: true })
        await dispatch('getOpEntryListByOpDate', createdOpDate)

        commit('SET_SELECTED_OPDATE_ROW', {
            ...createdOpDate,
            edit_mode: false
        })
    },

    async updateOpdate({ state, commit, rootState, dispatch }) {
        // Локально обновляем запись в списке
        const selectedOpDateIdx = state.opDateList.findIndex(opDate => opDate.id === state.selectedOpDateRow.id)
        const updatedOpDateList = [...state.opDateList]
        updatedOpDateList.splice(selectedOpDateIdx, 1, state.updatedOpDateRow);
        commit('SET_OP_DATE_LIST', updatedOpDateList)

        // Обновляем запись в db
        const data = {...state.updatedOpDateRow}
        delete data.edit_mode
        const updatedData = await OpdateAPI.updateOpDate(data.id, data)

        // Обновляем номер счета в проводках, если он менялся
        // Сделано, чтобы сохранить консистентность данных в приложении
        if (state.opEntryListByOpdate.length) {
            const updatedOpEntryList = [...rootState.opentry.opEntryList]
            for (const opEntry of rootState.opentry.opEntryList) {
                if (!state.opEntryListByOpdate.includes(opEntry)) {
                    continue
                }

                const updatedOpEntry = { ...opEntry }
                updatedOpEntry.OpDate = state.updatedOpDateRow.OpDate

                await OpEntryAPI.updateOpEntry(opEntry.id, updatedOpEntry)

                const updatedOpEntryIdx = state.opEntryListByOpdate.findIndex(
                    opEntry => opEntry.id === updatedOpEntry.id
                )
                updatedOpEntryList.splice(updatedOpEntryIdx, 1, updatedOpEntry);
            }

            await dispatch('setOpEntryList', updatedOpEntryList, { root: true })
            dispatch('getOpEntryListByOpDate', updatedData.OpDate)
        }

        // Обновляем данные выбранной записи
        commit('SET_SELECTED_OPDATE_ROW', {
            ...updatedData,
            edit_mode: false
        })

        commit('SET_UPDATED_OPDATE_ROW', null)
    },

    cancelAddingOpDate({ commit }) {
        const opDateListWithoutEmptyRow = [...state.opDateList]
        opDateListWithoutEmptyRow.shift()

        commit('SET_OP_DATE_LIST', opDateListWithoutEmptyRow)
        commit('SET_OPENTRY_LIST_BY_OPDATE', [])
        commit('SET_SELECTED_OPDATE_ROW', null)
        commit('SET_UPDATED_OPDATE_ROW', null)
    },

    async createOpEntry({ state, commit }) {
        const data = { ...state.updatedOpEntryRow}
        delete data.edit_mode
        delete data.id

        const createdOpEntry = await OpEntryAPI.createOpEntry(data)
        commit('SET_SELECTED_OPENTRY_ROW', {
            ...createdOpEntry,
            edit_mode: true
        })
        commit('SET_OPENTRY_LIST_BY_OPDATE', [{ ...state.selectedOpEntryRow }, ...state.opEntryListByOpdate])

        const opEntryListWithNewRow = [...state.opEntryListByOpdate]
        opEntryListWithNewRow.splice(1, 1)
        commit('SET_OPENTRY_LIST_BY_OPDATE', opEntryListWithNewRow)

        commit('SET_SELECTED_OPENTRY_ROW', {
            ...createdOpEntry,
            edit_mode: false
        })
    },

    async updateOpEntry({ state, commit, dispatch, rootState }) {
        // Локально обновляем запись в списке
        const selectedOpEntryIdx = state.opEntryListByOpdate.findIndex(
            opEntry => opEntry.id === state.selectedOpEntryRow.id
        )
        const updatedOpEntryByOpdateList = [...state.opEntryListByOpdate]
        updatedOpEntryByOpdateList.splice(selectedOpEntryIdx, 1, state.updatedOpEntryRow);
        commit('SET_OPENTRY_LIST_BY_OPDATE', updatedOpEntryByOpdateList)

        // Обновляем запись в db
        const data = {...state.updatedOpEntryRow}
        delete data.edit_mode

        const updatedData = await OpEntryAPI.updateOpEntry(data.id, data)

        // Обновляем список opEntryList
        const updatedOpEntryList = [...rootState.opentry.opEntryList]
        const updatedOpEntryIdx = state.opEntryListByOpdate.findIndex(
            opEntry => opEntry.id === updatedData.id
        )
        updatedOpEntryList.splice(updatedOpEntryIdx, 1, updatedData);
        dispatch('setOpEntryList', updatedOpEntryList, { root: true })

        // Обновляем данные выбранной записи
        commit('SET_SELECTED_OPENTRY_ROW', {
            ...updatedData,
            edit_mode: false
        })

        commit('SET_UPDATED_OPENTRY_ROW', null)
    },

    async deleteOpEntry({ state, commit }) {
        // Удаляем запись из списка локально
        const updatedOpEntryByOpdateListIdx = state.opEntryListByOpdate.findIndex(
            opEntry => opEntry.id === state.selectedOpEntryRow.id
        )
        const updatedOpEntryByOpdateList = [...state.opEntryListByOpdate]
        updatedOpEntryByOpdateList.splice(updatedOpEntryByOpdateListIdx, 1);
        commit('SET_OPENTRY_LIST_BY_OPDATE', updatedOpEntryByOpdateList)

        // Удаляем запись в db
        await OpEntryAPI.deleteOpEntry(state.selectedOpEntryRow.id)
        commit('SET_SELECTED_OPENTRY_ROW', null)
    },

    addOpEntryRow({ state, commit }) {
        const opEntryListWithEmptyRow = [...state.opEntryListByOpdate]
        opEntryListWithEmptyRow.unshift({
            AcctCr: '',
            AcctDB: '',
            Amount: 0,
            OpDate: '',
            edit_mode: true,
            creatable: true
        });

        commit('SET_OPENTRY_LIST_BY_OPDATE', opEntryListWithEmptyRow)
        commit('SET_SELECTED_OPENTRY_ROW', opEntryListWithEmptyRow[0])
    },

    cancelAddingOpEntry({ commit }) {
        const opEntryListWithoutEmptyRow = [...state.opEntryListByOpdate]
        opEntryListWithoutEmptyRow.shift()

        commit('SET_OPENTRY_LIST_BY_OPDATE', opEntryListWithoutEmptyRow)
        commit('SET_SELECTED_OPENTRY_ROW', null)
        commit('SET_UPDATED_OPENTRY_ROW', null)
    },

    setSelectedOpDateRow({ commit }, payload) {
        commit('SET_SELECTED_OPDATE_ROW', payload)
    },

    setUpdatedOpDateRow({ commit }, payload) {
        commit('SET_UPDATED_OPDATE_ROW', payload)
    },

    setOpEntryListByOpdate({ commit }, payload) {
        commit('SET_OPENTRY_LIST_BY_OPDATE', payload)
    },

    setSelectedOpEntryRow({ commit }, payload) {
        commit('SET_SELECTED_OPENTRY_ROW', payload)
    },

    setUpdatedOpEntryRow({ commit }, payload) {
        commit('SET_UPDATED_OPENTRY_ROW', payload)
    }
}

const mutations = {
    SET_OP_DATE_LIST(state, payload) {
        state.opDateList = payload
    },

    SET_SELECTED_OPDATE_ROW(state, payload) {
        state.selectedOpDateRow = payload
    },

    SET_UPDATED_OPDATE_ROW(state, payload) {
        state.updatedOpDateRow = payload
    },

    SET_OPENTRY_LIST_BY_OPDATE(state, payload) {
        state.opEntryListByOpdate = payload
    },

    SET_SELECTED_OPENTRY_ROW(state, payload) {
        state.selectedOpEntryRow = payload
    },

    SET_UPDATED_OPENTRY_ROW(state, payload) {
        state.updatedOpEntryRow = payload
    }
}

export default {
    namespaced: true,
    state,
    actions,
    mutations,
    getters
}
