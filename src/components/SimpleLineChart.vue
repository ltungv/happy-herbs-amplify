<script>
import { Line, mixins } from "vue-chartjs";
const { reactiveProp } = mixins;

export default {
  extends: Line,
  mixins: [reactiveProp],
  props: {
    chartOptions: {
      type: Object,
      default: undefined
    }
  },
  mounted() {
    this.renderChart(this.chartData, this.chartOptions);
  }
};
</script>

<style></style>
