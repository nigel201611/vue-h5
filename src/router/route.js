
const home = r => require.ensure([], () => r(require('../page/home/index.vue')), 'home');
const routes = [
  {
    path: '/',
    name: 'home',
    component: home
  }
]

export default routes;
