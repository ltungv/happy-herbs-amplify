<template>
  <v-container>
    <v-select
      solo
      class="pa-4 mr-16"
      v-model="selectedTimeInterval"
      :items="timeIntervals"
      label="Time interval"
      @change="populateSensorsMeasurements()"
    ></v-select>
    <v-progress-linear
      v-if="isLoadingChartsData"
      indeterminate
    ></v-progress-linear>
    <template v-for="{ thingName, ...sensors } in this.sensorsChartData">
      <span v-if="!isLoadingChartsData" :key="thingName" class="pa-2 text-h4"
        >{{ thingName }}
      </span>
      <v-row v-if="!isLoadingChartsData" :key="thingName" class="pa-4">
        <v-col>
          <SimpleLineChart
            :width="200"
            :height="200"
            :chartData="sensors.lightMeter"
            :chartOptions="sensorsChartOpts"
          ></SimpleLineChart>
        </v-col>
        <v-col>
          <SimpleLineChart
            :width="200"
            :height="200"
            :chartData="sensors.temperature"
            :chartOptions="sensorsChartOpts"
          ></SimpleLineChart>
        </v-col>
        <v-col>
          <SimpleLineChart
            :width="200"
            :height="200"
            :chartData="sensors.humidity"
            :chartOptions="sensorsChartOpts"
          ></SimpleLineChart>
        </v-col>
        <v-col>
          <SimpleLineChart
            :width="200"
            :height="200"
            :chartData="sensors.moisture"
            :chartOptions="sensorsChartOpts"
          ></SimpleLineChart>
        </v-col>
      </v-row>
    </template>
  </v-container>
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
      isLoadingChartsData: true,
      // sensorsMeasurements contains measured valued of all the sensors in every existing MCUs
      sensorsMeasurements: [],
      selectedTimeInterval: {
        interval: 24 * 60 * 60,
        timeScale: "hour"
      },
      timeIntervals: [
        {
          text: "1 day",
          value: {
            interval: 24 * 60 * 60,
            timeScale: "hour"
          }
        },
        {
          text: "1 week",
          value: {
            interval: 7 * 24 * 60 * 60,
            timeScale: "day"
          }
        },
        {
          text: "1 month",
          value: {
            interval: 30 * 24 * 60 * 60,
            timeScale: "week"
          }
        }
      ]
    };
  },
  computed: {
    /**
     * Map the sensors' measurements received into datasets that can be read by chartjs
     */
    sensorsChartData() {
      return this.sensorsMeasurements.map((measurements, thingIdx) => {
        const labels = measurements.map(m => new Date(m.timestamp * 1000));
        return {
          thingName: this.things[thingIdx].thingName,
          lightMeter: {
            labels,
            datasets: [
              {
                label: "BH1750 (lx)",
                backgroundColor: "yellow",
                data: measurements.map(m => m.luxBH1750)
              }
            ]
          },
          temperature: {
            labels,
            datasets: [
              {
                label: "Temperature (\u00B0C)",
                backgroundColor: "red",
                data: measurements.map(m => m.temperature)
              }
            ]
          },
          humidity: {
            labels,
            datasets: [
              {
                label: "Air humidity (%)",
                backgroundColor: "blue",
                data: measurements.map(m => m.humidity)
              }
            ]
          },
          moisture: {
            labels,
            datasets: [
              {
                label: "Ground moisture (%)",
                backgroundColor: "brown",
                data: measurements.map(m => m.moisture)
              }
            ]
          }
        };
      });
    },
    sensorsChartOpts() {
      return {
        responsive: false,
        maintainAspectRatio: false,
        scales: {
          xAxes: [
            {
              type: "time",
              time: {
                unit: this.selectedTimeInterval.timeScale
              }
            }
          ]
        }
      };
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
      this.populateSensorsMeasurements();
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
      this.isLoadingChartsData = true;
      const currentTimestamp = Math.round(new Date().getTime() / 1000);
      try {
        const responses = await Promise.all(
          this.things.map(({ thingName }) => {
            return API.graphql(
              graphqlOperation(listSensorsMeasurements, {
                thingsName: thingName,
                timestamp: {
                  ge: currentTimestamp - this.selectedTimeInterval.interval
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
      this.isLoadingChartsData = false;
    }
  }
};
</script>
