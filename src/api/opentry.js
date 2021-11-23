import { baseUrl } from "@/api/api";

const opEntryUrl = `${baseUrl}/doc`

export const OpEntryAPI = {
    async getOpEntryList() {
        /**
         * Получение списка проводок
         */

        const response = await fetch(opEntryUrl)

        if (!response.ok) {
            throw new Error(await response.text());
        }

        return response.json()
    },

    async createOpEntry(data) {
        /**
         * Создание проводки
         */

        const response = await fetch(opEntryUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            throw new Error(await response.text())
        }

        return response.json()
    },

    async updateOpEntry(idOpEntry, data) {
        /**
         * Обновление проводки опердня
         *
         * @param {number} idOpEntry
         * @param {string} data.AcctCr
         * @param {string} data.AcctDB
         * @param {number} data.Amount
         * @param {string} data.OpDate
         */

        const url = `${opEntryUrl}/${idOpEntry}`

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            throw new Error(await response.text())
        }

        return response.json()
    },

    async deleteOpEntry(idOpEntry) {
        /**
         * Удаление проводки
         */

        const url = `${opEntryUrl}/${idOpEntry}`

        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        return response.json()
    }
}
