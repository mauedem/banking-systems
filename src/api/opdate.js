import { baseUrl } from "@/api/api";

const opdateUrl = `${baseUrl}/opdate`

export const OpdateAPI = {
    async getOpDateList() {
        /**
         * Получение списка опердней
         */

        const response = await fetch(opdateUrl)

        if (!response.ok) {
            throw new Error(await response.text());
        }

        return response.json()
    },

    async deleteOpDate(idOpDate) {
        /**
         * Удаление опердня
         *
         * @param {number} idOpDate
         */

        const url = `${opdateUrl}/${idOpDate}`

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
    },

    async createOpDate(data) {
        /**
         * Создание опердня
         *
         * @param {string} data.OpDate
         */

        const response = await fetch(opdateUrl, {
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

    async updateOpDate(idOpDate, data) {
        /**
         * Обновление проводки опердня
         *
         * @param {number} idOpDate
         * @param {string} data.OpDate
         */

        const url = `${opdateUrl}/${idOpDate}`

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
    }
}
