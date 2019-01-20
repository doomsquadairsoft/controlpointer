import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import About from '@/components/About'
import Store from '@/components/Store'
import Admin from '@/components/Admin/Admin'
import MapPage from '@/components/Map/MapPage'
import Utilities from '@/components/Utilities'
import AdminNue from '@/components/AdminNue/Admin'
import AboutGreenFox from '@/components/AboutGreenFox'
import ControlPointList from '@/components/ControlPoint/ControlPointList'
import Game from '@/components/AdminNue/GameList/Game/Game'

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
            path: '/game/:gameId',
            name: 'Game',
            component: Game
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
