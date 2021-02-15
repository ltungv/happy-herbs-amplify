import Vue from "vue";
import Vuex from "vuex";
import { Auth } from "aws-amplify";
import { IoTClient, ListThingsCommand } from "@aws-sdk/client-iot";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    awsUser: undefined,
    awsIotThings: []
  },
  getters: {
    awsUser(state) {
      return state.awsUser;
    },
    awsIotThings(state) {
      return state.awsIotThings;
    }
  },
  mutations: {
    setAWSUser(state, awsUser) {
      state.awsUser = awsUser;
    },
    setAWSIotThings(state, awsIotThings) {
      state.awsIotThings = awsIotThings;
    }
  },
  actions: {
    async execAWSListThingsCommand(ctx) {
      const creds = await Auth.currentCredentials();
      const iotCli = new IoTClient({
        region: "ap-southeast-1",
        credentials: creds
      });

      const listThingsRes = await iotCli.send(new ListThingsCommand({}));
      ctx.commit("setAWSIotThings", listThingsRes.things);
    }
  },
  modules: {}
});
