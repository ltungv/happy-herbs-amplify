import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";

import Amplify from "aws-amplify";
import { AWSIoTProvider } from "@aws-amplify/pubsub";
import aws_exports from "./aws-exports";
import {
  applyPolyfills,
  defineCustomElements
} from "@aws-amplify/ui-components/loader";
import "@aws-amplify/ui-vue";

Amplify.configure(aws_exports);
Amplify.addPluggable(
  new AWSIoTProvider({
    aws_pubsub_region: "ap-southeast-1",
    aws_pubsub_endpoint:
      "wss://a2p23x3rl0tb19-ats.iot.ap-southeast-1.amazonaws.com/mqtt"
  })
);
applyPolyfills().then(() => {
  defineCustomElements(window);
});

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount("#app");
