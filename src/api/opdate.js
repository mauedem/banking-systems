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
    }
}
