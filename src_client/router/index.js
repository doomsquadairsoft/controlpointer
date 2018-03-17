import Vue from 'vue'
import Router from 'vue-router'
import Welcome from '../components/Welcome'
import About from '../components/About'
import Admin from '../components/Admin/Admin'


Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/',
            name: 'Welcome',
            component: Welcome,
            props: {
                msg: "Im the routed one"
            }
        },
        {
            path: '/about',
            name: 'About',
            component: About
        },
        {
            path: '/admin',
            name: 'Admin',
            component: Admin
        }
    ]
})
