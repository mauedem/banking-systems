<template>
    <b-table
        ref="AcctPosTable"
        caption="Счета проводок"
        caption-top
        :selectable="isTableSelectable"
        select-mode="single"
        sticky-header
        show-empty
        :fields="fields"
        :items="acctListByOpEntry"
        @row-selected="selectRow"
    >
        <template #cell(Type)="data">
            <b-form-input
                v-if="selectedAcctRow && selectedAcctRow.id === data.item.id &&
                    selectedAcctRow.edit_mode"
                style="width: 250px"
                :value="data.value"
                @input="(value) => inputHandler(value, data.field.key)"
            />

            <div v-else>{{ data.value }}</div>
        </template>

        <template #cell(Acct)="data">
            <b-form-input
                v-if="selectedAcctRow && selectedAcctRow.id === data.item.id &&
                    selectedAcctRow.edit_mode"
                style="width: 250px"
                :value="data.value"
                @input="(value) => inputHandler(value, data.field.key)"
            />

            <div v-else>{{ data.value }}</div>
        </template>

        <template #cell(Ost)="data">
            <b-form-input
                v-if="selectedAcctRow && selectedAcctRow.id === data.item.id &&
                    selectedAcctRow.edit_mode"
                style="width: 100px"
                :value="data.value"
                @input="(value) => inputHandler(value, data.field.key)"
            />

            <div v-else>{{ data.value }}</div>
        </template>

        <template #empty>
            <div class="text-center">
                {{ !selectedOpEntryRow ? 'Операция не выбрана' : 'Нет счетов на выбранную операцию' }}
            </div>
        </template>
    </b-table>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
    name: "AcctPosTable", // Табличная форма "Счета проводок"

    data: () => ({
        fields: [
            {
                key: 'Type',
                label: 'Тип счета'
            },
            {
                key: 'Acct',
                label: 'Номер счета'
            },
            {
                key: 'Ost',
                label: 'Остаток'
            }
        ],

        isTableSelectable: true
    }),

    watch: {
        selectedAcctRow(value) {
            this.isTableSelectable = !value || value && !value.edit_mode

            if (value) {
                this.selectTableRow(value)
            }
        }
    },

    computed: {
        ...mapGetters('opentry', [
            'acctListByOpEntry',
            'selectedAcctRow',
            'selectedOpEntryRow'
        ])
    },

    mounted() {
        if (this.selectedAcctRow) {
            const selectedRowIdx = this.acctListByOpEntry.findIndex(accPos => accPos.id === this.selectedAcctRow.id)

            this.$refs.AcctPosTable.selectRow(selectedRowIdx)
        }
    },

    methods: {
        selectRow(rowData) {
            if (this.selectedAcctRow?.edit_mode) return

            if (!rowData.length) {
                this.$store.dispatch('opentry/setSelectedAcctRow', null)

                return
            }

            this.$store.dispatch('opentry/setSelectedAcctRow', {
                ...rowData[0],
                edit_mode: false
            })
        },

        inputHandler(value, key) {
            const updatedAcctRow = this.$store.getters['opentry/updatedAcctRow']

            const typedValue = key === 'Ost' ? Number(value) : value
            this.$store.dispatch('opentry/setUpdatedAcctRow', {
                ...updatedAcctRow,
                [key]: typedValue
            })
        },

        async selectTableRow(value) {
            if (!this.isTableSelectable) return
            if (!this.selectedAcctRow) return

            let isRowSelected = false

            const selectedRowIdx = this.acctListByOpEntry.findIndex(accPos => accPos.id === value.id)
            isRowSelected = this.$refs.AcctPosTable.isRowSelected(selectedRowIdx)

            let counter = 0
            while (!isRowSelected) {
                await this.$refs.AcctPosTable.selectRow(selectedRowIdx)
                isRowSelected = this.$refs.AcctPosTable.isRowSelected(selectedRowIdx)

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
