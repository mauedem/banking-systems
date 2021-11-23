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
        await this.$store.dispatch('acct/getAcctList')
        await this.$store.dispatch('acct/getAcctPosListByOpDate')
    }
};
</script>
