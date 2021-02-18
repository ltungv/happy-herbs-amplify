<template>
  <v-container fluid v-if="!isLoadingInitialSensorsMeasurements">
    <v-row
      v-for="{ thingName, lightMeter } in this.sensorsChartData"
      :key="thingName"
    >
      <v-col>
        <SimpleLineChart
          :width="420"
          :height="420"
          :chartData="lightMeter"
          :chartOptions="sensorsChartOpts"
        ></SimpleLineChart>
      </v-col>
    </v-row>
  </v-container>
  <v-progress-linear v-else indeterminate></v-progress-linear>
</template>

<script>
import { graphqlOperation, API } from "aws-amplify";
import { listSensorsMeasurements } from "../graphql/queries";
import SimpleLineChart from "../components/SimpleLineChart";

export default {
  name: "Home",
  components: { SimpleLineChart },
  data() {
    return {
      intervalLoadSensorsMeasurements: undefined,
      isLoadingInitialSensorsMeasurements: true,
      // sensorsMeasurements contains measured valued of all the sensors in every existing MCUs
      sensorsMeasurements: [],
      sensorsChartOpts: {
        responsive: false,
        maintainAspectRatio: false,
        scales: {
          xAxes: [
            {
              type: "time",
              time: {
                unit: "minute"
              }
            }
          ]
        }
      }
    };
  },
  computed: {
    /**
     * Map the sensors' measurements received into datasets that can be read by chartjs
     */
    sensorsChartData() {
      return this.sensorsMeasurements.map((measurements, thingIdx) => ({
        thingName: this.things[thingIdx].thingName,
        lightMeter: {
          labels: measurements.map(m => new Date(m.timestamp * 1000)),
          datasets: [
            {
              label: "BH1750 (lux)",
              backgroundColor: "yellow",
              data: measurements.map(m => m.luxBH1750)
            }
          ]
        }
      }));
    },

    /**
     * Information about all the existing MCUs
     */
    things() {
      return this.$store.getters.awsIotThings;
    }
  },
  beforeMount() {
    /**
     * Wait for 3 seconds and query the data using GraphQL for sensors' measurements
     */
    setTimeout(async () => {
      await this.populateSensorsMeasurements();
      this.isLoadingInitialSensorsMeasurements = false;
    }, 3000);

    /**
     * For every 30 seconds and query the data using GraphQL for sensors' measurements
     */
    this.intervalLoadSensorsMeasurements = setInterval(async () => {
      this.populateSensorsMeasurements();
    }, 30000);
  },
  beforeDestroy() {
    clearInterval(this.intervalLoadSensorsMeasurements);
  },
  methods: {
    /**
     * Query the database using GraphQL for sensors' measurements from every existing MCU.
     * The data is filter for a range of time up until now
     */
    async populateSensorsMeasurements() {
      const currentTimestamp = Math.round(new Date().getTime() / 1000);
      try {
        const responses = await Promise.all(
          this.things.map(({ thingName }) => {
            return API.graphql(
              graphqlOperation(listSensorsMeasurements, {
                thingsName: thingName,
                timestamp: {
                  ge: currentTimestamp - 24 * 60 * 60 // 1 DAY
                },
                sortDirection: "DESC" // LATEST FIRST
              })
            );
          })
        );
        this.sensorsMeasurements = responses.map(
          res => res.data.listSensorsMeasurements.items
        );
      } catch (err) {
        console.log(err);
      }
    }
  }
};
</script>
