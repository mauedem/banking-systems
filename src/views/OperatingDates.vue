<template>
    <b-container fluid class="p-0 overflow-hidden">
        <b-row class="mx-4 my-3">
            <b-col cols="4">
                <OpDateTable class="opdate-table" />

                <TableActions
                    v-if="!selectedOpEntryRow || selectedOpEntryRow && !selectedOpEntryRow.edit_mode"
                    :selected-row="selectedOpDateRow"
                    @add-row="addOpDate"
                    @edit-row="editOpDate"
                    @delete-row="deleteOpDateRow"
                    @save="saveAcctPosRow"
                    @cancel="cancelEditOpDate"
                />
            </b-col>

            <b-col cols="8">
                <OpEntryTable class="opentry-table" />

                <TableActions
                    v-if="selectedOpDateRow && !selectedOpDateRow.edit_mode"
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
import OpDateTable from "@/components/opdates/OpDateTable";
import OpEntryTable from "@/components/opdates/OpEntryTable";
import TableActions from "@/components/common/TableActions";
import { mapGetters } from "vuex";

export default {
    name: "OperatingDates",

    components: {
        OpDateTable,
        OpEntryTable,
        TableActions
    },

    computed: {
        ...mapGetters('opdate', [
            'opDateList',
            'selectedOpDateRow',
            'updatedOpDateRow',
            'selectedOpEntryRow',
            'updatedOpEntryRow',
            'opEntryListByOpdate'
        ]),

        ...mapGetters('opentry', ['opEntryList'])
    },

    watch: {
        selectedOpDate(value) {
            if (value && this.opEntryList.length) {
                this.$store.dispatch('opdate/getOpEntryListByOpDate')
            }
        }
    },

    methods: {
        /* Методы для OpDateTable */

        addOpDate() {
            this.$store.dispatch('opdate/setUpdatedOpDateRow', {
                OpDate: '',
                OpStatus: 'Открыт',
            })

            this.$store.dispatch('opdate/addOpDateRow')
        },

        editOpDate() {
            // Включаем режим редактирования у активной строки
            this.$store.dispatch('opdate/setSelectedOpDateRow', {
                ...this.selectedOpDateRow,
                edit_mode: true
            })

            // Делаем ее копию в updatedAcctPosRow, чтобы менять данные у нее
            // Нужно, чтобы мы могли отменить сделанные изменения
            this.$store.dispatch('opdate/setUpdatedOpDateRow', {
                ...this.selectedOpDateRow
            })
        },

        cancelEditOpDate() {
            // Отменяем добавление записи
            if (this.opDateList[0].creatable) {
                this.$store.dispatch('opdate/cancelAddingOpDate')

                return
            }

            // Отменяем редактирование записи
            this.$store.dispatch('opdate/setSelectedOpDateRow', {
                ...this.selectedOpDateRow,
                edit_mode: false
            })
            this.$store.dispatch('opdate/setUpdatedOpDateRow', null)
        },

        async deleteOpDateRow() {
            await this.$store.dispatch('opdate/deleteOpdate')
        },

        async saveAcctPosRow() {
            if (!this.updatedOpDateRow.OpDate) return

            // Добавляем новую запись
            if (this.selectedOpDateRow.creatable) {
                await this.$store.dispatch('opdate/createOpDate')

                return
            }

            // Сохраняем обновленную запись
            await this.$store.dispatch('opdate/updateOpdate')
            this.cancelEditOpDate()
        },

        /* Методы для OpEntryTable */

        editOpEntry() {
            // Включаем режим редактирования у активной строки
            this.$store.dispatch('opdate/setSelectedOpEntryRow', {
                ...this.selectedOpEntryRow,
                edit_mode: true
            })

            // Делаем ее копию в updatedAcctPosRow, чтобы менять данные у нее
            // Нужно, чтобы мы могли отменить сделанные изменения
            this.$store.dispatch('opdate/setUpdatedOpEntryRow', {
                ...this.selectedOpEntryRow
            })
        },

        cancelEditOpEntry() {
            // Отменяем добавление записи
            if (this.opEntryListByOpdate[0].creatable) {
                this.$store.dispatch('opdate/cancelAddingOpEntry')

                return
            }

            // Отменяем редактирование записи
            this.$store.dispatch('opdate/setSelectedOpEntryRow', {
                ...this.selectedOpEntryRow,
                edit_mode: false
            })
            this.$store.dispatch('opdate/setUpdatedOpEntryRow', null)
        },

        async deleteOpEntryRow() {
            await this.$store.dispatch('opdate/deleteOpEntry')
        },

        async saveOpEntryRow() {
            if (!this.updatedOpEntryRow.AcctCr || !this.updatedOpEntryRow.AcctDB ||
                !this.updatedOpEntryRow.OpDate) return


            // Добавляем новую запись
            if (this.selectedOpEntryRow.creatable) {
                await this.$store.dispatch('opdate/createOpEntry')

                return
            }

            // Сохраняем обновленную запись
            await this.$store.dispatch('opdate/updateOpEntry')
            this.cancelEditOpEntry()
        },

        addOpEntry() {
            this.$store.dispatch('opdate/setUpdatedOpEntryRow', {
                AcctCr: '',
                AcctDB: '',
                Amount: 0,
                OpDate: ''
            })

            this.$store.dispatch('opdate/addOpEntryRow')
        }
    }
}
</script>
