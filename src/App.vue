<template>
  <v-app>
    <amplify-authenticator>
      <amplify-sign-in slot="sign-in" hide-sign-up="true"></amplify-sign-in>
      <v-navigation-drawer app dark permanent class="pt-4">
        <v-list>
          <v-list-item link>
            <v-list-item-content>
              <div v-if="user">
                <v-list-item-title
                  class="title"
                  v-text="user.attributes.name"
                />
                <v-list-item-subtitle v-text="user.attributes.email" />
              </div>
            </v-list-item-content>
          </v-list-item>
        </v-list>

        <v-list-item>
          <v-list-item-content>
            <amplify-sign-out />
          </v-list-item-content>
        </v-list-item>

        <v-divider />

        <v-list nav>
          <v-list-item :to="{ path: '/' }">
            <v-list-item-icon>
              <v-icon>mdi-home</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Home</v-list-item-title>
          </v-list-item>

          <v-list-group
            :value="false"
            prepend-icon="mdi-account-circle"
            no-action
          >
            <template v-slot:activator>
              <v-list-item-content>
                <v-list-item-title>Things</v-list-item-title>
              </v-list-item-content>
            </template>

            <v-list-item
              v-for="({ thingName }, i) in things"
              :key="i"
              :to="{ path: `/things/${thingName}` }"
            >
              <v-list-item-title v-text="thingName" />
            </v-list-item>
          </v-list-group>
        </v-list>
      </v-navigation-drawer>

      <v-app-bar app dark>
        <v-app-bar-title>Happy Herbs</v-app-bar-title>
        <v-spacer></v-spacer>
      </v-app-bar>

      <v-main>
        <v-container fluid>
          <router-view></router-view>
        </v-container>
      </v-main>
    </amplify-authenticator>
  </v-app>
</template>

<script>
import { AuthState, onAuthUIStateChange } from "@aws-amplify/ui-components";

export default {
  name: "App",
  computed: {
    user() {
      return this.$store.getters.awsUser;
    },
    things() {
      return this.$store.getters.awsIotThings;
    }
  },
  created() {
    onAuthUIStateChange(async (state, user) => {
      // set current user and load data after login
      if (state === AuthState.SignedIn) {
        this.$store.commit("setAWSUser", user);
        this.$store.dispatch("execAWSListThingsCommand");
      }
    });
  }
};
</script>
