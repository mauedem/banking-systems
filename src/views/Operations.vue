<template>
    <b-container fluid class="p-0 overflow-hidden">
        <b-row class="mx-4 my-3">
            <b-col cols="8">
                <OpEntryTable class="opentry-table" />

                <TableActions
                    v-if="!selectedAcctRow || selectedAcctRow && !selectedAcctRow.edit_mode"
                    :selected-row="selectedOpEntryRow"
                    @add-row="addOpEntry"
                    @edit-row="editOpEntry"
                    @delete-row="deleteOpEntryRow"
                    @save="saveOpEntryRow"
                    @cancel="cancelEditOpEntry"
                />
            </b-col>

            <b-col cols="4">
                <AcctTable class="acctpos-table" />

                <!-- Прячем кнопочку "Добавить запись" и "Удалить",
                 потому что в этой таблице может быть только 2 записи -->
                <TableActions
                    v-if="selectedOpEntryRow && !selectedOpEntryRow.edit_mode"
                    :selected-row="selectedAcctRow"
                    hideAddBtn
                    hideDeleteBtn
                    @edit-row="editAcct"
                    @save="saveAcct"
                    @cancel="cancelEditAcct"
                />
            </b-col>
        </b-row>
    </b-container>
</template>

<script>
import OpEntryTable from "@/components/opentries/OpEntryTable";
import AcctTable from "@/components/opentries/AcctTable";
import TableActions from "@/components/common/TableActions";
import { mapGetters } from "vuex";

export default {
    name: "Operations",

    components: {
        OpEntryTable,
        AcctTable,
        TableActions
    },

    watch: {
        selectedOpEntryRow(value) {
            if (value) {
                this.$store.dispatch('opentry/getAcctsListByOpEntry')
            }
        }
    },

    computed: {
        ...mapGetters('opentry', [
            'opEntryList',
            'selectedOpEntryRow',
            'selectedAcctRow',
            'acctListByOpEntry',
            'updatedOpEntryRow',
            'updatedAcctRow'
        ]),
    },

    methods: {
        /* Методы для OpEntryTable */

        editOpEntry() {
            // Включаем режим редактирования у активной строки
            this.$store.dispatch('opentry/setSelectedOpEntryRow', {
                ...this.selectedOpEntryRow,
                edit_mode: true
            })

            // Делаем ее копию в updatedAcctRow, чтобы менять данные у нее
            // Нужно, чтобы мы могли отменить сделанные изменения
            this.$store.dispatch('opentry/setUpdatedOpEntryRow', {
                ...this.selectedOpEntryRow
            })
        },

        cancelEditOpEntry() {
            // Отменяем добавление записи
            if (this.opEntryList[0].creatable) {
                this.$store.dispatch('opentry/cancelAddingOpEntry')

                return
            }

            // Отменяем редактирование записи
            this.$store.dispatch('opentry/setSelectedOpEntryRow', {
                ...this.selectedOpEntryRow,
                edit_mode: false
            })
            this.$store.dispatch('opentry/setUpdatedOpEntryRow', null)
        },

        async deleteOpEntryRow() {
            await this.$store.dispatch('opentry/deleteOpEntry')
        },

        async saveOpEntryRow() {
            if (!this.updatedOpEntryRow.AcctCr || !this.updatedOpEntryRow.AcctDB ||
                !this.updatedOpEntryRow.OpDate) return


            // Добавляем новую запись
            if (this.selectedOpEntryRow.creatable) {
                await this.$store.dispatch('opentry/createOpEntry')

                return
            }

            // Сохраняем обновленную запись
            await this.$store.dispatch('opentry/updateOpEntry')
            this.cancelEditOpEntry()
        },

        addOpEntry() {
            this.$store.dispatch('opentry/setUpdatedOpEntryRow', {
                AcctCr: '',
                AcctDB: '',
                Amount: 0,
                OpDate: ''
            })

            this.$store.dispatch('opentry/addOpEntryRow')
        },

        /* Методы для AcctPosTable */

        editAcct() {
            // Включаем режим редактирования у активной строки
            this.$store.dispatch('opentry/setSelectedAcctRow', {
                ...this.selectedAcctRow,
                edit_mode: true
            })

            // Делаем ее копию в updatedAcctRow, чтобы менять данные у нее
            // Нужно, чтобы мы могли отменить сделанные изменения
            this.$store.dispatch('opentry/setUpdatedAcctRow', {
                ...this.selectedAcctRow
            })
        },

        cancelEditAcct() {
            // Отменяем редактирование записи
            this.$store.dispatch('opentry/setSelectedAcctRow', {
                ...this.selectedAcctRow,
                edit_mode: false
            })
            this.$store.dispatch('opentry/setUpdatedAcctRow', null)
        },

        async saveAcct() {
            if (!this.updatedAcctRow.Acct) return

            // Сохраняем обновленную запись
            await this.$store.dispatch('opentry/updateAcct')
            this.cancelEditAcct()
        }
    },
}
</script>
