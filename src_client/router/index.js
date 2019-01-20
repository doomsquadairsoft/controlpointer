import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Shop from '@/components/Shop/Shop'
import About from '@/components/About'
import MapPage from '@/components/Map/MapPage'
import Utilities from '@/components/Utilities'
import AboutGreenFox from '@/components/AboutGreenFox'
import ControlPointList from '@/components/ControlPoint/ControlPointList'
import Game from '@/components/Game/Game'
import GameList from '@/components/GameList/GameList'


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
            path: '/game',
            name: 'GameList',
            component: GameList
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
            path: '/shop',
            name: 'Shop',
            component: Shop
        },
        {
          path: '/controlpoint',
          name: 'ControlPointList',
          component: ControlPointList
        }
    ]
})
