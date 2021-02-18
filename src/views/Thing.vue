<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <span class="text-h2">{{ thingName }}</span>
        <v-btn icon color="secondary" @click="refreshConnection">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
        <v-icon top color="red" v-if="amplifyPubSubHasError"
          >mdi-wifi-off</v-icon
        >
        <v-icon top color="green" v-if="!amplifyPubSubHasError"
          >mdi-wifi</v-icon
        >
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-card>
          <v-card-title>Lamp status</v-card-title>
          <v-card-subtitle>
            Reported state
            <span class="green--text" v-if="thingShadow.reported.lampState"
              >ON</span
            >
            <span class="red--text" v-if="!thingShadow.reported.lampState"
              >OFF</span
            >
          </v-card-subtitle>

          <v-card-actions>
            <v-btn
              :loading="isUpdatingThingShadow"
              color="secondary"
              @click="publishShadowUpdateLampToggle"
            >
              <span v-if="thingShadow.desired.lampState">Turn off</span>
              <span v-if="!thingShadow.desired.lampState">Turn on</span>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { PubSub } from "aws-amplify";

export default {
  name: "Thing",
  data() {
    return {
      acceptedShadowGetAndUpdateSubscriber: undefined,
      rejectedShadowUpdateSubscriber: undefined,
      thingName: undefined,
      thingShadow: {
        desired: {
          lampState: false
        },
        reported: {
          lampState: false
        }
      },
      isUpdatingThingShadow: false,
      amplifyPubSubHasError: false,
      intervalPublishShadowGet: undefined
    };
  },
  created() {
    this.thingName = this.$route.params.thingName;
  },
  beforeMount() {
    this.subscribeAllTopics();

    setTimeout(async () => {
      this.publishShadowGet();
    }, 3000);

    this.intervalPublishShadowGet = setInterval(async () => {
      this.publishShadowGet();
    }, 30000);
  },
  beforeDestroy() {
    this.unsubscribeAllTopics();
    clearInterval(this.intervalPublishShadowGet);
  },
  methods: {
    async refreshConnection() {
      this.isUpdatingThingShadow = false;
      this.amplifyPubSubHasError = false;
      this.unsubscribeAllTopics();
      this.subscribeAllTopics();
      this.publishShadowGet();
    },
    async publishShadowUpdateLampToggle() {
      this.isUpdatingThingShadow = true;
      this.publishShadowUpdate({
        desired: {
          lampState: !this.thingShadow.desired.lampState
        }
      });
    },
    async publishShadowUpdate(state) {
      try {
        PubSub.publish(`$aws/things/${this.thingName}/shadow/update`, {
          state
        });
      } catch (err) {
        console.error("Could not publish shadow update request ", err);
      }
    },
    async publishShadowGet() {
      try {
        PubSub.publish(`$aws/things/${this.thingName}/shadow/get`, {});
      } catch (err) {
        console.error("Could not publish shadow get request ", err);
      }
    },
    subscribeAllTopics() {
      this.acceptedShadowGetAndUpdateSubscriber = PubSub.subscribe([
        "$aws/things/" + this.thingName + "/shadow/update/accepted",
        "$aws/things/" + this.thingName + "/shadow/get/accepted"
      ]).subscribe({
        next: data => {
          if (this.isUpdatingThingShadow) {
            this.isUpdatingThingShadow = false;
          }
          if (data.value.state.desired) {
            Object.entries(data.value.state.desired).forEach(([k, v]) => {
              this.thingShadow.desired[k] = v;
            });
          }
          if (data.value.state.reported) {
            Object.entries(data.value.state.reported).forEach(([k, v]) => {
              this.thingShadow.reported[k] = v;
            });
          }
        },
        error: () => {
          this.amplifyPubSubHasError = true;
        }
      });

      this.rejectedShadowUpdateSubscriber = PubSub.subscribe(
        "$aws/things/" + this.thingName + "/shadow/update/rejected"
      ).subscribe({
        next: () => {
          if (this.isUpdatingThingShadow) {
            this.isUpdatingThingShadow = false;
          }
        },
        error: () => {
          this.amplifyPubSubHasError = true;
        }
      });
    },
    unsubscribeAllTopics() {
      if (this.acceptedShadowGetAndUpdateSuscriber) {
        this.acceptedShadowGetAndUpdateSuscriber.unsubscribe();
      }
      if (this.rejectedShadowUpdateSubscriber) {
        this.rejectedShadowUpdateSubscriber.unsubscribe();
      }
    }
  }
};
</script>
