import Vue from 'vue'
import Router from 'vue-router'
import Home from '../components/Home'
import About from '../components/About'
import AboutGreenFox from '../components/AboutGreenFox'
import Admin from '../components/Admin/Admin'
import TechnicalInfo from '../components/TechnicalInfo'
import MapPage from '../components/Map/MapPage'
import Utilities from '../components/Utilities'
import Store from '../components/Store'

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/',
            name: 'Home',
            component: Home
        },
        {
            path: '/about',
            name: 'About',
            component: About
        },
        {
            path: '/green-fox-ii',
            name: 'AboutGreenFox',
            component: AboutGreenFox
        },
        {
            path: '/admin',
            name: 'Admin',
            component: Admin
        },
        {
            path: '/technical-info',
            name: 'TechnicalInfo',
            component: TechnicalInfo
        },
        {
            path: '/map',
            name: 'MapPage',
            component: MapPage
        },
        {
            path: '/utilities',
            name: 'Utilities',
            component: Utilities
        },
        {
            path: '/store',
            name: 'Store',
            component: Store
        },
    ]
})
