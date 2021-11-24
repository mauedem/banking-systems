<template>
    <div id="app">
        <Navigation />

        <router-view />
    </div>
</template>

<script>
import Navigation from "@/components/common/Navigation";
import { mapGetters } from "vuex";

export default {
    name: 'App',

    components: {
        Navigation
    },

    computed: {
        ...mapGetters('acct', ['selectedOpDate']),
        ...mapGetters('opentry', ['opEntryList']),
    },

    async created() {
        await this.$store.dispatch('opdate/getOpDateList')
        await this.$store.dispatch('getOpEntryList')
        await this.$store.dispatch('acct/selectLastOpDate')
        await this.$store.dispatch('getAcctList')
        await this.$store.dispatch('acct/getAcctPosListByOpDate')
    }
};
</script>

<style>
.opentry-table, .acctpos-table, .opdate-table {
    height: 80vh !important;
}

.b-table-sticky-header {
    max-height: 100% !important;
}

.opentry-table__opdate {
    width: 140px !important;
}

.opentry-table__acct {
    width: 250px !important;
}

.opentry-table__amount {
    width: 100px !important;
}

.acct-table__type {
    width: 130px !important;
}

.acct-table__acct {
    width: 220px
}

.acct-table__ost {
    width: 90px
}
</style>
