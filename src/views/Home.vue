<template>
  <v-container fluid>
    <SimpleLineChart
      :width="420"
      :height="420"
      :chartData="lightMeterChartData"
      :chartOptions="lightMeterChartOptions"
    ></SimpleLineChart>
  </v-container>
</template>

<script>
import { graphqlOperation, API } from "aws-amplify";
import { listSensorsMeasurements } from "../graphql/queries";
import SimpleLineChart from "../components/SimpleLineChart";

export default {
  name: "Home",
  components: { SimpleLineChart },
  computed: {
    lightMeterChartData() {
      return {
        labels: this.sensorsMeasurements.map(m => new Date(m.timestamp * 1000)),
        datasets: [
          {
            label: "BH1750 (lux)",
            backgroundColor: "yellow",
            data: this.sensorsMeasurements.map(m => m.luxBH1750)
          }
        ]
      };
    }
  },
  data() {
    return {
      sensorsMeasurements: [],
      lightMeterChartOptions: {
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
  async beforeMount() {
    await this.populateSensorsMeasurements();
  },
  methods: {
    async populateSensorsMeasurements() {
      const currentTimestamp = Math.round(new Date().getTime() / 1000);
      try {
        const response = await API.graphql(
          graphqlOperation(listSensorsMeasurements, {
            thingsName: "test-plant-module-01",
            timestamp: {
              ge: currentTimestamp - 24 * 60 * 60
            },
            sortDirection: "DESC"
          })
        );
        this.sensorsMeasurements = response.data.listSensorsMeasurements.items;
      } catch (err) {
        console.error("Could not populate sensors' measurements ", err);
      }
    }
  }
};
</script>
