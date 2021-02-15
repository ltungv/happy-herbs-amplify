import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/things/:thingName",
    name: "Thing",
    component: () =>
      // lazy-loaded the chunk when the route is visited.
      import(/* webpackChunkName: "about" */ "../views/Thing.vue")
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
