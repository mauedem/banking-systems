import { baseUrl } from "@/api/api";

const acctUrl = `${baseUrl}/acct`

export const AcctAPI = {
    async getAcctList() {
        /**
         * Получение списка счетов
         */

        const response = await fetch(acctUrl)

        if (!response.ok) {
            throw new Error(await response.text());
        }

        return response.json()
    },

    async createAcct(data) {
        /**
         * Создание счета
         */

        const response = await fetch(acctUrl, {
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

    async updateAcct(idAcct, data) {
        /**
         * Обновление счета
         *
         * @param {string} data.Acct
         * @param {number} data.Ost
         */

        const url = `${acctUrl}/${idAcct}`

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        return response.json()
    },

    async deleteAcct(idAcct) {
        /**
         * Удаление счета
         *
         * @param {number} idAcct
         */

        const url = `${acctUrl}/${idAcct}`

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
