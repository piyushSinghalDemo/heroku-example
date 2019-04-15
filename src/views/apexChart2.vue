<template>
  <div class="example">
    <apexchart width="1200" height="550" type="line" :options="chartOptions" :series="series"></apexchart>
    <!-- <apexchart width="1200" height="550" type="line" :options="chartOptions" :series="series2"></apexchart> -->
    <!-- <apexchart ref="donut" width="350" type="donut" :options="donutChartOptions" :series="donutSeries"></apexchart> -->
  </div>
</template>

<script>
export default {
  name: 'LineExample',
  data: function() {
    return {
      chartOptions: {
        colors:['#000000','#0000FF'],
           chart: {
             events: {
                 click: function (event, chartContext, config) {
                    console.log(chartContext);
                },
                dataPointSelection: function(event, chartContext, config) {
                console.log(chartContext, config);
                }
             },
            toolbar: {
            show: false,
            },
        },
        stroke: {
            show: true,
            curve: 'smooth',
            // lineCap: 'butt',
            colors: undefined,
            width: 2,
            dashArray: [0,0,0,0,5],      
        },
        markers: {
            size: 3,
            opacity: 0.9,
            colors: ['#000000','#0000FF'],
            strokeColor: "#fff",
            strokeWidth: 2,                
            hover: {
                size: 7,
            }
        },
        xaxis: {
          type: 'category',
          categories: ['Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
            title: {
              text: 'Values (Week)'
            }
        },
        yaxis: {
            title: {
              text: 'Values (GB)'
            }
        },
        title: {
                text: 'Production Datagrowth Analysis',
                align: 'left'
        },
      },
      series: [{
        name: 'No Archiving',
        data: [30, 40, 45, 50, 49, 60],
        zoneAxis: 'x',
        zones: [{
            value: 8
        }, {
            dashStyle: 'dot'
        }]

      }, {
        name: 'With Archiving',
        data: [23.5, 33, 38.5, 12, 44, 52]
      }],

      donutChartOptions: {
        labels: ["EDI", "Purchase Orders", "Sales Orders", "General Ledger", "other"],
      },
      donutSeries: [11, 32, 45, 32,20]
    }
  },
  methods: {}
}
</script>