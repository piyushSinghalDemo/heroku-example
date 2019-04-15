import '@babel/polyfill'
import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import router from './router'
import VueResource from 'vue-resource'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import VueBreadcrumbs from 'vue-breadcrumbs'
import store from './store'
import VueSession from 'vue-session'
import VueMoment from 'vue-moment'
import moment from 'moment-timezone'
import VueCookies from 'vue-cookies'
import Vue2Filters from 'vue2-filters'
import VueDraggable from 'vue-draggable'
import ToggleButton from 'vue-js-toggle-button'
// import Toasted from "vue-toasted";
import HighchartsVue from 'highcharts-vue'
import VueApexCharts from 'vue-apexcharts'
Vue.use(VueApexCharts)

Vue.component('apexchart', VueApexCharts)
Vue.use(VueMoment, {
    moment,
})

window.$ = require('jquery')
window.JQuery = require('jquery')

Vue.use(VueDraggable)
Vue.use(VueBreadcrumbs)
Vue.use(BootstrapVue);
Vue.use(VueResource)
Vue.use(VueSession, {'persist': true})
Vue.use(VueCookies)
Vue.use(Vue2Filters)
Vue.use(ToggleButton)
Vue.use(HighchartsVue)
// Vue.use(Toasted, {
//     theme: "primary",
//     duration: 2000,
//     position: "top-right",
//     action: {
//         text: "X",
//         onClick: (e, toastObject) => {
//             toastObject.goAway(0);
//         }
//     }
// });
Vue.config.productionTip = false

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')