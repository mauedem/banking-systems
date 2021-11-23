import Vue from 'vue'
import Vuex from 'vuex'

import acct from '@/store/acct.store'
import opdate from '@/store/opdate.store'
import opentry from '@/store/opentry.store'

Vue.use(Vuex)

export default new Vuex.Store({
    modules: {
        acct: acct,
        opdate: opdate,
        opentry: opentry
    }
})
