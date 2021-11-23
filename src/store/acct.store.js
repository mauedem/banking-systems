import { AcctAPI } from '@/api/acct';
import { OpEntryAPI } from "@/api/opentry";

const state = {
    /* Данные к таблице AcctPosTable */
    acctList: [], // Список счетов
    acctPosList: [], // Список остатков по счету на дату
    selectedOpDate: null, // Выбранный опердень
    selectedAcctPosRow: null, // Выбранный остаток по счету на дату
    updatedAcctPosRow: null, // Обновленные данные выбранного остатка по счету на дату

    /* Данные к таблице OpEntryTable */
    opEntryListByAcctPos: [], // Список проводок по выбранному остатку по счету на дату
    selectedOpEntryRow: null, // Выбранная проводка по счету
    updatedOpEntryRow: null, // Обновленные данные выбранной проводки
}

const getters = {
    acctList: s => s.acctList,
    acctPosList: s => s.acctPosList,
    selectedOpDate: s => s.selectedOpDate,
    selectedAcctPosRow: s => s.selectedAcctPosRow,
    updatedAcctPosRow: s => s.updatedAcctPosRow,

    opEntryListByAcctPos: s => s.opEntryListByAcctPos,
    selectedOpEntryRow: s => s.selectedOpEntryRow,
    updatedOpEntryRow: s => s.updatedOpEntryRow
}

const actions = {
    async getAcctList({ commit }) {
        const acctList = await AcctAPI.getAcctList()
        commit('SET_ACCT_LIST', acctList)
    },

    getAcctPosListByOpDate({ state, commit, rootState }) {
        const selectedOpDate = rootState.opdate.opDateList[state.selectedOpDate - 1]

        const opEntryListByOpDate = rootState.opentry.opEntryList.filter(
            opEntry => opEntry.OpDate === selectedOpDate.OpDate
        )

        const acctCrs = opEntryListByOpDate.map(opEntry => opEntry.AcctCr)
        const acctDbs = opEntryListByOpDate.map(opEntry => opEntry.AcctDB)
        const accts = [...acctCrs, ...acctDbs]

        const acctPosList = state.acctList.filter(acct => accts.includes(acct.Acct))
        acctPosList.sort((a, b) => a.Acct > b.Acct ? 1 : -1)

        commit('SET_ACCT_POS_LIST', acctPosList)
    },

    getOpEntryListByAcctPos({ commit, rootState }, payload) {
        const opEntryListByAcctPos = rootState.opentry.opEntryList.filter(
            opEntry => opEntry.AcctCr === payload.Acct || opEntry.AcctDB === payload.Acct
        )
        console.log('opEntryListByAcctPos = ',opEntryListByAcctPos)
        commit('SET_OPENTRY_LIST_BY_ACCT_POS', opEntryListByAcctPos)
    },

    selectLastOpDate({ commit, rootState }) {
        let lastOpDate = rootState.opdate.opDateList.at(-1);
        // Находим последнюю дату, потому что есть вероятность, что данные с сервера придут
        // не в том порядке
        rootState.opdate.opDateList.forEach((element) => {
            if (lastOpDate.OpDate < element.OpDate) {
                lastOpDate = element;
            }
        });
        commit('SET_SELECTED_OP_DATE', lastOpDate.id)
        console.log('lastOpDate.id = ', lastOpDate.id)
    },

    async updateAcct({ state, commit, dispatch, rootState }) {
        // Локально обновляем запись в списке
        const selectedAcctPosIdx = state.acctPosList.findIndex(acctPos => acctPos.id === state.selectedAcctPosRow.id)
        const updatedAcctPosList = [...state.acctPosList]
        updatedAcctPosList.splice(selectedAcctPosIdx, 1, state.updatedAcctPosRow);
        commit('SET_ACCT_POS_LIST', updatedAcctPosList)

        // Обновляем запись в db
        const data = {...state.updatedAcctPosRow}
        delete data.edit_mode
        const updatedData = await AcctAPI.updateAcct(data.id, data)

        // Обновляем номер счета в проводках, если он менялся
        // Сделано, чтобы сохранить консистентность данных в приложении
        if (state.selectedAcctPosRow.Acct !== state.updatedAcctPosRow.Acct) {
            const updatedOpEntryList = [...rootState.opentry.opEntryList]

            for (const opEntry of rootState.opentry.opEntryList) {
                if (!state.opEntryListByAcctPos.includes(opEntry)) {
                    continue
                }

                const updatedOpEntry = { ...opEntry }
                for (const key in opEntry) {
                    if (opEntry[key] === state.selectedAcctPosRow.Acct) {
                        updatedOpEntry[key] = state.updatedAcctPosRow.Acct
                    }
                }

                await OpEntryAPI.updateOpEntry(opEntry.id, updatedOpEntry)

                const updatedOpEntryIdx = state.opEntryListByAcctPos.findIndex(
                    opEntry => opEntry.id === updatedOpEntry.id
                )
                updatedOpEntryList.splice(updatedOpEntryIdx, 1, updatedOpEntry);
            }

            await dispatch('setOpEntryList', updatedOpEntryList, { root: true })
        }

        dispatch('getOpEntryListByAcctPos', updatedData.Acct)

        // Обновляем данные выбранной записи
        commit('SET_SELECTED_ACCT_POS_ROW', {
            ...updatedData,
            edit_mode: false
        })
        commit('SET_UPDATED_ACCT_POS_ROW', null)
    },

    async deleteAcct({ state, commit }) {
        // Удаляем запись из списка локально
        const updatedAcctPosIdx = state.acctPosList.findIndex(acctPos => acctPos.id === state.selectedAcctPosRow.id)
        const updatedAcctPosList = [...state.acctPosList]
        updatedAcctPosList.splice(updatedAcctPosIdx, 1);
        commit('SET_ACCT_POS_LIST', updatedAcctPosList)

        // Удаляем запись в db
        await AcctAPI.deleteAcct(state.selectedAcctPosRow.id)
        commit('SET_SELECTED_ACCT_POS_ROW', null)
    },

    addAcctPosRow({ state, commit }) {
        const acctPosListWithEmptyRow = [...state.acctPosList]
        acctPosListWithEmptyRow.unshift({
            Acct: '',
            Ost: 0,
            edit_mode: true,
            creatable: true
        });

        commit('SET_ACCT_POS_LIST', acctPosListWithEmptyRow)
        commit('SET_SELECTED_ACCT_POS_ROW', acctPosListWithEmptyRow[0])
        commit('SET_OPENTRY_LIST_BY_ACCT_POS', [])
    },

    cancelAddingAcctPos({ state, commit }) {
        const acctPosListWithoutEmptyRow = [...state.acctPosList]
        acctPosListWithoutEmptyRow.shift()

        commit('SET_ACCT_POS_LIST', acctPosListWithoutEmptyRow)
        commit('SET_OPENTRY_LIST_BY_ACCT_POS', [])
        commit('SET_SELECTED_ACCT_POS_ROW', null)
        commit('SET_UPDATED_ACCT_POS_ROW', null)
    },

    async createAcct({ state, commit, dispatch, rootState }) {
        const data = { ...state.updatedAcctPosRow}
        delete data.edit_mode
        delete data.id

        const createdAcct = await AcctAPI.createAcct(data)
        commit('SET_SELECTED_ACCT_POS_ROW', {
            ...createdAcct,
            edit_mode: true
        })
        commit('SET_ACCT_POS_LIST', [{ ...state.selectedAcctPosRow }, ...state.acctPosList])

        // Создаем проводку на этот счет и дату, чтобы созданный нами счет появился в списке
        // AcctPosList после обновления страницы
        dispatch('getOpEntryListByAcctPos', createdAcct.Acct)

        if (!state.opEntryListByAcctPos.length) {
            await OpEntryAPI.createOpEntry({
                "AcctCr": "",
                "AcctDB": createdAcct.Acct,
                "Amount": 0,
                "OpDate": rootState.opdate.opDateList[state.selectedOpDate - 1].OpDate
            })
        }

        const acctPosListWithNewRow = [...state.acctPosList]
        acctPosListWithNewRow.splice(1, 1)
        commit('SET_ACCT_POS_LIST', acctPosListWithNewRow)

        await dispatch('getOpEntryList', null, { root: true })

        commit('SET_SELECTED_ACCT_POS_ROW', {
            ...createdAcct,
            edit_mode: false
        })
    },

    async deleteOpEntry({ state, commit }) {
        // Удаляем запись из списка локально
        const updatedOpEntryByAcctListIdx = state.opEntryListByAcctPos.findIndex(
            acctPos => acctPos.id === state.selectedOpEntryRow.id
        )
        const updatedOpEntryByAcctList = [...state.opEntryListByAcctPos]
        updatedOpEntryByAcctList.splice(updatedOpEntryByAcctListIdx, 1);
        commit('SET_OPENTRY_LIST_BY_ACCT_POS', updatedOpEntryByAcctList)

        // Удаляем запись в db
        await OpEntryAPI.deleteOpEntry(state.selectedOpEntryRow.id)
        commit('SET_SELECTED_OPENTRY_ROW', null)
    },

    async updateOpEntry({ state, commit, rootState, dispatch }) {
        // Локально обновляем запись в списке
        const selectedOpEntryIdx = state.opEntryListByAcctPos.findIndex(
            opEntry => opEntry.id === state.selectedOpEntryRow.id
        )
        const updatedOpEntryByAcctList = [...state.opEntryListByAcctPos]
        updatedOpEntryByAcctList.splice(selectedOpEntryIdx, 1, state.updatedOpEntryRow);
        commit('SET_OPENTRY_LIST_BY_ACCT_POS', updatedOpEntryByAcctList)

        // Обновляем запись в db
        const data = {...state.updatedOpEntryRow}
        delete data.edit_mode

        const updatedData = await OpEntryAPI.updateOpEntry(data.id, data)

        // Обновляем список opEntryList
        const updatedOpEntryList = [...rootState.opentry.opEntryList]
        const updatedOpEntryIdx = state.opEntryListByAcctPos.findIndex(
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

    cancelAddingOpEntry({ state, commit }) {
        const opEntryListWithoutEmptyRow = [...state.opEntryListByAcctPos]
        opEntryListWithoutEmptyRow.shift()

        commit('SET_OPENTRY_LIST_BY_ACCT_POS', opEntryListWithoutEmptyRow)
        commit('SET_SELECTED_OPENTRY_ROW', null)
        commit('SET_UPDATED_OPENTRY_ROW', null)
    },

    addOpEntryRow({ state, commit }) {
        const opEntryListWithEmptyRow = [...state.opEntryListByAcctPos]
        opEntryListWithEmptyRow.unshift({
            AcctCr: '',
            AcctDB: '',
            Amount: '',
            OpDate: 0,
            edit_mode: true,
            creatable: true
        });

        commit('SET_OPENTRY_LIST_BY_ACCT_POS', opEntryListWithEmptyRow)
        commit('SET_SELECTED_OPENTRY_ROW', opEntryListWithEmptyRow[0])
    },

    async createOpEntry({ commit, dispatch }) {
        const data = { ...state.updatedOpEntryRow}
        delete data.edit_mode
        delete data.id

        const createdOpEntry = await OpEntryAPI.createOpEntry(data)
        commit('SET_SELECTED_OPENTRY_ROW', {
            ...createdOpEntry,
            edit_mode: true
        })
        commit('SET_OPENTRY_LIST_BY_ACCT_POS', [{ ...state.selectedOpEntryRow }, ...state.opEntryListByAcctPos])

        const opEntryListWithNewRow = [...state.opEntryListByAcctPos]
        opEntryListWithNewRow.splice(1, 1)
        commit('SET_OPENTRY_LIST_BY_ACCT_POS', opEntryListWithNewRow)

        await dispatch('getOpEntryList', null, { root: true })

        commit('SET_SELECTED_OPENTRY_ROW', {
            ...createdOpEntry,
            edit_mode: false
        })
    },

    setOpEntryListByAcctPos({commit}, payload) {
        commit('SET_OPENTRY_LIST_BY_ACCT_POS', payload)
    },

    setSelectedOpDate({commit}, payload) {
        commit('SET_SELECTED_OP_DATE', payload)
    },

    setSelectedAcctPosRow({commit}, payload) {
        commit('SET_SELECTED_ACCT_POS_ROW', payload)
    },

    setUpdatedAcctPosRow({commit}, payload) {
        commit('SET_UPDATED_ACCT_POS_ROW', payload)
    },

    setSelectedOpEntryRow({commit}, payload) {
        commit('SET_SELECTED_OPENTRY_ROW', payload)
    },

    setUpdatedOpEntryRow({commit}, payload) {
        commit('SET_UPDATED_OPENTRY_ROW', payload)
    },
}

const mutations = {
    SET_ACCT_LIST(state, payload) {
        state.acctList = payload
    },

    SET_ACCT_POS_LIST(state, payload) {
        state.acctPosList = payload
    },

    SET_SELECTED_OP_DATE(state, payload) {
        state.selectedOpDate = payload
        console.log('state.selectedOpDate = ', state.selectedOpDate)
    },

    SET_OPENTRY_LIST_BY_ACCT_POS(state, payload) {
        state.opEntryListByAcctPos = payload
    },

    SET_SELECTED_ACCT_POS_ROW(state, payload) {
        state.selectedAcctPosRow = payload
    },

    SET_SELECTED_OPENTRY_ROW(state, payload) {
        state.selectedOpEntryRow = payload
    },

    SET_UPDATED_ACCT_POS_ROW(state, payload) {
        state.updatedAcctPosRow = payload
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
