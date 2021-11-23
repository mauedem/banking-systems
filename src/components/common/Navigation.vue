<template>
    <b-navbar toggleable="lg" type="dark" variant="dark">
        <b-navbar-nav align="center" class="w-100">
            <b-nav-item
                v-for="(route, index) in routes"
                :key="index"
                :active="activeItem === route.name"
            >
                <b-link :to="{ name: route.name }" class="nav-link">
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
    }
}
</script>
