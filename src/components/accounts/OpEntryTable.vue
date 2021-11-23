<template>
    <b-table
        ref="OpEntryTable"
        caption="Проводки по счету"
        caption-top
        sticky-header
        :selectable="isTableSelectable"
        select-mode="single"
        :fields="fields"
        :items="opEntryListByAcctPos"
        show-empty
        @row-selected="selectRow"
    >

        <template #cell(OpDate)="data">
            <b-form-input
                v-if="selectedOpEntryRow && selectedOpEntryRow.id === data.item.id &&
                    selectedOpEntryRow.edit_mode"
                style="width: 250px"
                :value="data.value"
                @input="(value) => inputHandler(value, data.field.key)"
            />

            <div v-else>{{ data.value }}</div>
        </template>

        <template #cell(AcctDB)="data">
            <b-form-input
                v-if="selectedOpEntryRow && selectedOpEntryRow.id === data.item.id &&
                    selectedOpEntryRow.edit_mode"
                style="width: 250px"
                :value="data.value"
                @input="(value) => inputHandler(value, data.field.key)"
            />

            <div
                v-else
                :class="{'text-danger': selectedAcctPosRow.Acct === data.value}"
            >
                {{ data.value }}
            </div>
        </template>

        <template #cell(AcctCr)="data">
            <b-form-input
                v-if="selectedOpEntryRow && selectedOpEntryRow.id === data.item.id &&
                    selectedOpEntryRow.edit_mode"
                style="width: 250px"
                :value="data.value"
                @input="(value) => inputHandler(value, data.field.key)"
            />

            <div
                v-else
                :class="{'text-danger': selectedAcctPosRow.Acct === data.value}"
            >
                {{ data.value }}
            </div>
        </template>

        <template #cell(Amount)="data">
            <b-form-input
                v-if="selectedOpEntryRow && selectedOpEntryRow.id === data.item.id &&
                    selectedOpEntryRow.edit_mode"
                style="width: 250px"
                :value="data.value"
                @input="(value) => inputHandler(value, data.field.key)"
            />

            <div v-else>{{ data.value }}</div>
        </template>

        <template #empty>
            <div class="text-center">
                {{ !selectedAcctPosRow ? 'Счет не выбран' : 'Нет данных' }}
            </div>
        </template>
    </b-table>
</template>

<script>
import { mapGetters } from "vuex"

export default {
    name: "OpEntryTable", // Табличная форма "Проводки по счету"

    data: () => ({
        fields: [
            {
                key: 'OpDate',
                label: 'Дата опердня',
                tdClass: 'bg-red',
            },
            {
                key: 'AcctDB',
                label: 'Счет дебета'
            },
            {
                key: 'AcctCr',
                label: 'Счет кредита'
            },
            {
                key: 'Amount',
                label: 'Сумма'
            }
        ],

        isTableSelectable: true
    }),

    computed: {
        ...mapGetters('acct', [
            'opEntryListByAcctPos',
            'selectedAcctPosRow',
            'selectedOpEntryRow',
            'updatedOpEntryRow'
        ])
    },

    watch: {
        selectedOpEntryRow(value) {
            this.isTableSelectable = !value || value && !value.edit_mode

            if (value) {
                this.selectTableRow(value)
            }
        }
    },

    mounted() {
        if (this.selectedOpEntryRow) {
            const selectedRowIdx = this.opEntryListByAcctPos.findIndex(opEntry => opEntry.id === this.selectedOpEntryRow.id)

            this.$refs.OpEntryTable.selectRow(selectedRowIdx)
        }
    },

    methods: {
        selectRow(rowData) {
            if (this.selectedOpEntryRow?.edit_mode) return

            if (!rowData.length) {
                this.$store.dispatch('acct/setSelectedOpEntryRow', null)

                return
            }

            this.$store.dispatch('acct/setSelectedOpEntryRow', {
                ...rowData[0],
                edit_mode: false
            })
        },

        inputHandler(value, key) {
            const updatedOpEntryRow = this.$store.getters['acct/updatedOpEntryRow']

            const typedValue = key === 'Amount' ? Number(value) : value
            this.$store.dispatch('acct/setUpdatedOpEntryRow', {
                ...updatedOpEntryRow,
                [key]: typedValue
            })
        },

        async selectTableRow(value) {
            if (!this.isTableSelectable) return
            if (!this.selectedOpEntryRow) return

            let isRowSelected = false

            const selectedRowIdx = this.opEntryListByAcctPos.findIndex(opEntry => opEntry.id === value.id)
            isRowSelected = this.$refs.OpEntryTable.isRowSelected(selectedRowIdx)

            let counter = 0
            while (!isRowSelected) {
                await this.$refs.OpEntryTable.selectRow(selectedRowIdx)
                isRowSelected = this.$refs.OpEntryTable.isRowSelected(selectedRowIdx)

                counter += 1
                if (counter >= 3) return
            }
        }

    }
}
</script>

<style scoped>
.b-table-sticky-header {
    max-height: 100%;
}
</style>
