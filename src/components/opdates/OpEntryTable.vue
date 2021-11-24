<template>
    <b-table
        ref="OpEntryTable"
        caption="Проводки операционного дня"
        caption-top
        sticky-header
        :selectable="isTableSelectable"
        select-mode="single"
        :fields="fields"
        :items="opEntryListByOpdate"
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

            <div v-else>
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

            <div v-else>
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
                {{ !selectedOpDateRow ? 'Дата не выбрана' : 'Нет проводок на выбранный день' }}
            </div>
        </template>
    </b-table>
</template>

<script>
import { mapGetters } from "vuex"

export default {
    name: "OpEntryTable", // Табличная форма "Проводки операционного дня"

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
        ...mapGetters('opdate', [
            'opEntryListByOpdate',
            'selectedOpEntryRow',
            'selectedOpDateRow',
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
            const selectedRowIdx = this.opEntryListByOpdate.findIndex(opEntry => opEntry.id === this.selectedOpEntryRow.id)

            this.$refs.OpEntryTable.selectRow(selectedRowIdx)
        }
    },

    methods: {
        selectRow(rowData) {
            if (this.selectedOpEntryRow?.edit_mode) return

            if (!rowData.length) {
                this.$store.dispatch('opdate/setSelectedOpEntryRow', null)

                return
            }

            this.$store.dispatch('opdate/setSelectedOpEntryRow', {
                ...rowData[0],
                edit_mode: false
            })
        },

        inputHandler(value, key) {
            const updatedOpEntryRow = this.$store.getters['opdate/updatedOpEntryRow']

            const typedValue = key === 'Amount' ? Number(value) : value
            this.$store.dispatch('opdate/setUpdatedOpEntryRow', {
                ...updatedOpEntryRow,
                [key]: typedValue
            })
        },

        async selectTableRow(value) {
            if (!this.isTableSelectable) return
            if (!this.selectedOpEntryRow) return

            let isRowSelected = false

            const selectedRowIdx = this.opEntryListByOpdate.findIndex(opEntry => opEntry.id === value.id)
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
