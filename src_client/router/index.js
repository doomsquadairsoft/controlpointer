import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/components/Home';
import Shop from '@/components/Shop/Shop';
import About from '@/components/About';
import Map from '@/components/Map/Map';
import Utilities from '@/components/Utilities';
import Settings from '@/components/Settings';
import ControlPointList from '@/components/ControlPoint/ControlPointList';
import Game from '@/components/Game/Game';
import GameList from '@/components/GameList/GameList';
import PostGame from '@/components/PostGame/PostGame';
import DeviceList from '@/components/DeviceList/DeviceList';
import Device from '@/components/Device/Device';
import Controlpoint from '@/components/ControlPoint/ControlPoint';

Vue.use(Router);

export default new Router({

  routes: [{
      path: '/device',
      name: 'DeviceList',
      component: DeviceList
    },
    {
      path: '/device/:deviceId',
      name: 'Device',
      component: Device
    },
    {
      path: '/device/:deviceId/controlpoint',
      name: 'Controlpoint',
      component: Controlpoint
    },
    {
      path: '/postgame/:gameId',
      name: 'PostGame',
      component: PostGame
    },
    {
      path: '/',
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
      path: '/map/:gameId',
      name: 'Map',
      component: Map
    },
    {
      path: '/settings',
      name: 'Settings',
      component: Settings
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
