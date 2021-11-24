<template>
    <b-navbar toggleable="lg" type="dark" variant="dark">
        <b-navbar-nav align="center" class="w-100">
            <b-nav-item
                v-for="(route, index) in routes"
                :key="index"
                :active="activeItem === route.name"
            >
                <b-link @click="goToRoute(route.name)" class="nav-link">
                    {{ route.title }}
                </b-link>
            </b-nav-item>
        </b-navbar-nav>
    </b-navbar>
</template>

<script>
export default {
    name: "Navigation",

    data: () => ({
        routes: [
            {
                title: 'Счета',
                name: 'Accounts'
            },
            {
                title: 'Операционные дни',
                name: 'OperatingDates'
            },
            {
                title: 'Операции',
                name: 'Operations'
            }
        ]
    }),

    computed: {
        activeItem () {
            return this.$route.name;
        }
    },

    methods: {
        goToRoute(routeName) {
            const selectedAcctPosRow = this.$store.getters['acct/selectedAcctPosRow']
            const acctSelectedOpEntryRow = this.$store.getters['acct/selectedOpEntryRow']
            const selectedOpDateRow = this.$store.getters['opdate/selectedOpDateRow']
            const opdateSelectedOpEntryRow = this.$store.getters['opdate/selectedOpEntryRow']

            if (selectedAcctPosRow?.edit_mode || acctSelectedOpEntryRow?.edit_mode ||
                selectedOpDateRow?.edit_mode || opdateSelectedOpEntryRow?.edit_mode) return

            if (this.activeItem === routeName) return;

            this.$router.push({ name: routeName })
        }
    }
}
</script>
