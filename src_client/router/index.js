import Vue from 'vue'
import Router from 'vue-router'
import Home from '../components/Home'
import About from '../components/About'
import AboutGreenFox from '../components/AboutGreenFox'
import Admin from '../components/Admin/Admin'
import MapPage from '../components/Map/MapPage'
import AdminNue from '../components/AdminNue/Admin'
import Utilities from '../components/Utilities'
import Store from '../components/Store'
import ControlPointList from '../components/ControlPoint/ControlPointList'


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
            path: '/green-fox-iii',
            name: 'AboutGreenFox',
            component: AboutGreenFox
        },
        {
            path: '/admin-old',
            name: 'AdminOld',
            component: Admin
        },
        {
            path: '/admin',
            name: 'Admin',
            component: AdminNue
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
        {
          path: '/controlpoint',
          name: 'ControlPointList',
          component: ControlPointList
        }
    ]
})
