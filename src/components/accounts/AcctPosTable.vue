<template>
    <b-table
        ref="AcctPosTable"
        caption="Счета с остатками на дату"
        caption-top
        :selectable="isTableSelectable"
        select-mode="single"
        sticky-header
        show-empty
        :fields="fields"
        :items="acctPosList"
        @row-selected="selectRow"
    >
        <template #thead-top>
            <div style="width: 140px">
                <b-form-select
                    v-model="selectedOpDate"
                    :options="opDateList"
                    text-field="OpDate"
                    value-field="id"
                />
            </div>
        </template>

        <template #cell(Acct)="data">
            <b-form-input
                v-if="selectedAcctPosRow && selectedAcctPosRow.id === data.item.id &&
                    selectedAcctPosRow.edit_mode"
                style="width: 250px"
                :value="data.value"
                @input="(value) => inputHandler(value, data.field.key)"
            />

            <div v-else>{{ data.value }}</div>
        </template>

        <template #cell(Ost)="data">
            <b-form-input
                v-if="selectedAcctPosRow && selectedAcctPosRow.id === data.item.id &&
                    selectedAcctPosRow.edit_mode"
                style="width: 100px"
                :value="data.value"
                @input="(value) => inputHandler(value, data.field.key)"
            />

            <div v-else>{{ data.value }}</div>
        </template>

        <template #empty>
            <div class="text-center">
                Нет данных
            </div>
        </template>
    </b-table>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
    name: "AcctPosTable", // Табличная форма "Счета с остатками на дату"

    data: () => ({
        fields: [
            {
                key: '',
                label: ''
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
        selectedAcctPosRow(value) {
            this.isTableSelectable = !value || value && !value.edit_mode

            if (value) {
                this.selectTableRow(value)
            }
        }
    },

    computed: {
        ...mapGetters('opdate', ['opDateList']),
        ...mapGetters('acct', ['acctPosList', 'selectedAcctPosRow', 'selectedOpDate', 'selectedOpEntryRow']),

        selectedOpDate: {
            get () {
                const selectedOpDate = this.$store.getters['acct/selectedOpDate']

                return selectedOpDate?.id ?? selectedOpDate
            },

            set (value) {
                const selectedOpDate = this.$store.getters['acct/selectedOpDate']

                if (selectedOpDate === value) return

                this.$store.dispatch('acct/setSelectedOpDate', value)
            }
        }
    },

    mounted() {
        if (this.selectedAcctPosRow) {
            const selectedRowIdx = this.acctPosList.findIndex(accPos => accPos.id === this.selectedAcctPosRow.id)

            this.$refs.AcctPosTable.selectRow(selectedRowIdx)
        }
    },

    methods: {
        selectRow(rowData) {
            if (this.selectedAcctPosRow?.edit_mode) return

            if (!rowData.length) {
                this.$store.dispatch('acct/setSelectedAcctPosRow', null)
                this.$store.dispatch('acct/setOpEntryListByAcctPos', [])

                return
            }

            this.$store.dispatch('acct/setSelectedAcctPosRow', {
                ...rowData[0],
                edit_mode: false
            })
            this.$store.dispatch('acct/getOpEntryListByAcctPos', rowData[0])
        },

        inputHandler(value, key) {
            const updatedAcctPosRow = this.$store.getters['acct/updatedAcctPosRow']

            const typedValue = key === 'Ost' ? Number(value) : value
            this.$store.dispatch('acct/setUpdatedAcctPosRow', {
                ...updatedAcctPosRow,
                [key]: typedValue
            })
        },

        async selectTableRow(value) {
            if (!this.isTableSelectable) return
            if (!this.selectedAcctPosRow) return

            let isRowSelected = false

            const selectedRowIdx = this.acctPosList.findIndex(accPos => accPos.id === value.id)
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
