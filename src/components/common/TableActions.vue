<template>
    <div>
        <div
            v-if="!selectedRow || !selectedRow.edit_mode"
            class="d-flex mt-3"
        >
            <b-button
                v-if="!hideAddBtn"
                variant="outline-success"
                size="sm"
                @click="addAcctPosRow"
            >
                Добавить запись
            </b-button>

            <div v-if="selectedRow">
                <b-button
                    class="ml-3"
                    size="sm"
                    variant="outline-secondary"
                    @click="editRow"
                >
                    Редактировать
                </b-button>

                <b-button
                    v-if="!hideDeleteBtn"
                    class="ml-3"
                    variant="outline-danger"
                    size="sm"
                    @click="deleteRow"
                >
                    Удалить
                </b-button>
            </div>
        </div>

        <div
            v-else-if="selectedRow && selectedRow.edit_mode"
            class="d-flex mt-3"
        >
            <b-button
                class="ml-3"
                size="sm"
                variant="outline-success"
                @click="save"
            >
                Сохранить
            </b-button>

            <b-button
                class="ml-3"
                variant="outline-secondary"
                size="sm"
                @click="cancel"
            >
                Отменить
            </b-button>
        </div>
    </div>
</template>

<script>
export default {
    name: "TableActions",

    props: {
        selectedRow: {
            type: Object,
            default: null
        },

        hideAddBtn: {
            type: Boolean,
            default: false
        },

        hideDeleteBtn: {
            type: Boolean,
            default: false
        }
    },

    methods: {
        addAcctPosRow() {
            this.$emit('add-row')
        },

        editRow() {
            this.$emit('edit-row')
        },

        deleteRow() {
            this.$emit('delete-row')
        },

        save() {
            this.$emit('save')
        },

        cancel() {
            this.$emit('cancel')
        }
    }
}
</script>

<style scoped>

</style>
