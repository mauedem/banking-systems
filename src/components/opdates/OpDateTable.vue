<template>
    <b-table
        ref="OpDateTable"
        caption="Операционные дни"
        caption-top
        :selectable="isTableSelectable"
        select-mode="single"
        sticky-header
        :fields="fields"
        :items="opDateList"
        show-empty
        @row-selected="selectRow"
    >
        <template #cell(OpDate)="data">
            <b-form-input
                v-if="selectedOpDateRow && selectedOpDateRow.id === data.item.id &&
                    selectedOpDateRow.edit_mode"
                style="width: 250px"
                :value="data.value"
                @input="(value) => inputHandler(value, data.field.key)"
            />

            <div v-else>{{ data.value }}</div>
        </template>

        <template #empty>
            <div class="text-center">
                День не выбран
            </div>
        </template>
    </b-table>
</template>

<script>
import {mapGetters} from "vuex";

export default {
    name: "OpDateTable",

    data: () => ({
        fields: [
            {
                key: '',
                label: ''
            },
            {
                key: 'OpDate',
                label: 'Дата операционного дня'
            }
        ],

        isTableSelectable: true
    }),

    watch: {
        selectedOpDateRow(value) {
            this.isTableSelectable = !value || value && !value.edit_mode

            if (value) {
                this.selectTableRow(value)
            }
        }
    },

    computed: {
        ...mapGetters('opdate', [
            'opDateList',
            'selectedOpDateRow',
        ]),
    },

    mounted() {
        if (this.selectedOpDateRow) {
            const selectedRowIdx = this.opDateList.findIndex(opDate => opDate.id === this.selectedOpDateRow.id)

            this.$refs.OpDateTable.selectRow(selectedRowIdx)
        }
    },

    methods: {
        selectRow(rowData) {
            if (this.selectedOpDateRow?.edit_mode) return

            if (!rowData.length) {
                this.$store.dispatch('opdate/setSelectedOpDateRow', null)
                this.$store.dispatch('opdate/setOpEntryListByOpdate', [])

                return
            }

            this.$store.dispatch('opdate/setSelectedOpDateRow', {
                ...rowData[0],
                edit_mode: false
            })
            this.$store.dispatch('opdate/getOpEntryListByOpDate', rowData[0])
        },

        inputHandler(value, key) {
            const updatedOpDateRow = this.$store.getters['opdate/updatedOpDateRow']

            this.$store.dispatch('opdate/setUpdatedOpDateRow', {
                ...updatedOpDateRow,
                [key]: value
            })
        },

        async selectTableRow(value) {
            if (!this.isTableSelectable) return
            if (!this.selectedOpDateRow) return

            let isRowSelected = false

            const selectedRowIdx = this.opDateList.findIndex(opDate => opDate.id === value.id)
            isRowSelected = this.$refs.OpDateTable.isRowSelected(selectedRowIdx)

            let counter = 0
            while (!isRowSelected) {
                await this.$refs.OpDateTable.selectRow(selectedRowIdx)
                isRowSelected = this.$refs.OpDateTable.isRowSelected(selectedRowIdx)

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
