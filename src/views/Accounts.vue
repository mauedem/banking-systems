<template>
    <b-container fluid class="p-0 overflow-hidden">
        <b-row class="mx-4 my-3">
            <b-col cols="4">
                <AcctPosTable class="acctpos-table" />

                <TableActions
                    v-if="!selectedOpEntryRow || selectedOpEntryRow && !selectedOpEntryRow.edit_mode"
                    :selected-row="selectedAcctPosRow"
                    @add-row="addAcctPos"
                    @edit-row="editAcctPos"
                    @delete-row="deleteAcctPosRow"
                    @save="saveAcctPosRow"
                    @cancel="cancelEditAcctPos"
                />
            </b-col>

            <b-col cols="8">
                <OpEntryTable class="opentry-table" />

                <TableActions
                    v-if="selectedAcctPosRow && !selectedAcctPosRow.edit_mode"
                    :selected-row="selectedOpEntryRow"
                    @add-row="addOpEntry"
                    @edit-row="editOpEntry"
                    @delete-row="deleteOpEntryRow"
                    @save="saveOpEntryRow"
                    @cancel="cancelEditOpEntry"
                />
            </b-col>
        </b-row>
    </b-container>
</template>

<script>
import { mapGetters } from 'vuex'
import AcctPosTable from "@/components/accounts/AcctPosTable";
import OpEntryTable from "@/components/accounts/OpEntryTable";
import TableActions from "@/components/common/TableActions";

export default {
    name: "Accounts",

    components: {
        AcctPosTable,
        OpEntryTable,
        TableActions
    },

    computed: {
        ...mapGetters('acct', [
            'acctList',
            'selectedOpDate',
            'selectedAcctPosRow',
            'updatedAcctPosRow',
            'selectedOpEntryRow',
            'acctPosList',
            'updatedOpEntryRow',
            'opEntryListByAcctPos'
        ]),

        ...mapGetters('opentry', ['opEntryList'])
    },

    watch: {
        selectedOpDate(value) {
            if (value && this.acctList.length && this.opEntryList.length) {
                this.$store.dispatch('acct/getAcctPosListByOpDate')
            }
        }
    },

    methods: {
        /* Методы для AcctPosTable */

        editAcctPos() {
            // Включаем режим редактирования у активной строки
            this.$store.dispatch('acct/setSelectedAcctPosRow', {
                ...this.selectedAcctPosRow,
                edit_mode: true
            })

            // Делаем ее копию в updatedAcctPosRow, чтобы менять данные у нее
            // Нужно, чтобы мы могли отменить сделанные изменения
            this.$store.dispatch('acct/setUpdatedAcctPosRow', {
                ...this.selectedAcctPosRow
            })
        },

        cancelEditAcctPos() {
            // Отменяем добавление записи
            if (this.acctPosList[0].creatable) {
                this.$store.dispatch('acct/cancelAddingAcctPos')

                return
            }

            // Отменяем редактирование записи
            this.$store.dispatch('acct/setSelectedAcctPosRow', {
                ...this.selectedAcctPosRow,
                edit_mode: false
            })
            this.$store.dispatch('acct/setUpdatedAcctPosRow', null)
        },

        addAcctPos() {
            this.$store.dispatch('acct/setUpdatedAcctPosRow', {
                Acct: '',
                Ost: 0
            })

            this.$store.dispatch('acct/addAcctPosRow')
        },

        async saveAcctPosRow() {
            if (!this.updatedAcctPosRow.Acct) return

            // Добавляем новую запись
            if (this.selectedAcctPosRow.creatable) {
                await this.$store.dispatch('acct/createAcct')

                return
            }

            // Сохраняем обновленную запись
            await this.$store.dispatch('acct/updateAcct')
            this.cancelEditAcctPos()
        },

        async deleteAcctPosRow() {
            await this.$store.dispatch('acct/deleteAcct')
        },

        /* Методы для OpEntryTable */

        editOpEntry() {
            // Включаем режим редактирования у активной строки
            this.$store.dispatch('acct/setSelectedOpEntryRow', {
                ...this.selectedOpEntryRow,
                edit_mode: true
            })

            // Делаем ее копию в updatedAcctPosRow, чтобы менять данные у нее
            // Нужно, чтобы мы могли отменить сделанные изменения
            this.$store.dispatch('acct/setUpdatedOpEntryRow', {
                ...this.selectedOpEntryRow
            })
        },

        cancelEditOpEntry() {
            // Отменяем добавление записи
            if (this.opEntryListByAcctPos[0].creatable) {
                this.$store.dispatch('acct/cancelAddingOpEntry')

                return
            }

            // Отменяем редактирование записи
            this.$store.dispatch('acct/setSelectedOpEntryRow', {
                ...this.selectedOpEntryRow,
                edit_mode: false
            })
            this.$store.dispatch('acct/setUpdatedOpEntryRow', null)
        },

        async deleteOpEntryRow() {
            await this.$store.dispatch('acct/deleteOpEntry')
        },

        async saveOpEntryRow() {
            if (!this.updatedOpEntryRow.AcctCr || !this.updatedOpEntryRow.AcctDB ||
                !this.updatedOpEntryRow.OpDate) return


            // Добавляем новую запись
            if (this.selectedOpEntryRow.creatable) {
                await this.$store.dispatch('acct/createOpEntry')

                return
            }

            // Сохраняем обновленную запись
            await this.$store.dispatch('acct/updateOpEntry')
            this.cancelEditOpEntry()
        },

        addOpEntry() {
            this.$store.dispatch('acct/setUpdatedOpEntryRow', {
                AcctCr: '',
                AcctDB: '',
                Amount: 0,
                OpDate: ''
            })

            this.$store.dispatch('acct/addOpEntryRow')
        }
    }
}
</script>
