<template>
  <div class="example">
    <!-- <apexchart width="1200" height="550" type="line" :options="chartOptions" :series="series"></apexchart> -->
    <apexchart width="1200" height="550" type="line" :options="chartOptions" :series="series2"></apexchart>
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
          categories: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
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
      series2: [
      //   {
      //   name: 'No Archiving',
      //   data: [
      //     [1,5],[2,10],[3,15],[4,10],[5,9],[6,7],[7,5],[8,2],[9,5],[10,20],[11,12],
      //     [12,10],[13,50],[14,20],[15,21],[16,22],[17,23],[18,24],[19,26],[20,27],[21,12],[22,2],[23,23],
      //       [24,26],[25,19],[26,12],[27,11],[28,12],[29,30]],
      // },
      {
        name: 'Archiving',
        data: [[1,20],[2,40],[3,25],[4,30],],
      }
      ],
      series: [{
        name: 'No Archiving',
        data: [80,75,70,65,60,50,45,40,35,30,25,20,15,10,5,5,20,22,24,26,28,30,32,34,36,38,40,42,44,46,
          48,50,52,54,56,58,60,62,64,66,68,70,72,24,50,40,30],
        zoneAxis: 'x',
        zones: [{
            value: 8
        }, {
            dashStyle: 'dot'
        }]
      },{
        name: 'No Archiving',
        data: [60,58,56,54,52,50,48,46,44,42,40,38,36,34,32,30,28,26,24,22,20,18,16,14,12,10,8,6,4,2,
        13,5,7,9,11,13,15,17,19,21,23,25,27,29,31,33,35,37,39,41],
        zoneAxis: 'x',
        zones: [{
            value: 8
        }, {
            dashStyle: 'dot'
        }]
      },{
        name: 'No Archiving',
        data: [2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40,42,44,46,48,50,52,54,56,58,60,58,
          56,54,52,50,48,46,44,42,40,38,36,34, 36,38,40,42,44,46,48],
        zoneAxis: 'x',
        zones: [{
            value: 8
        }, {
            dashStyle: 'dot'
        }]
      },
      {
        name: 'No Archiving',
        data: [5,10,15,10,9,7,5,2,5,20,12,10,50,20,21,22,23,24,26,27,12,2,23,23,30,19,12,11,12,30],
        zoneAxis: 'x',
        zones: [{
            value: 8
        }, {
            dashStyle: 'dot'
        }]
      },{
        name: 'No Archiving',
        data: [30, 40, 45, 50, 49, 60, 70,74,78,90,70,75,80,82,50,30,40,90,80,60], 
        zoneAxis: 'x',
        zones: [{
            value: 8
        }, {
            dashStyle: 'dot'
        }]

      }, {
        name: 'With Archiving',
        data: [23.5, 33, 38.5, 12, 44, 52, 32, 50,53,60,64,67, 68,69,70,71,72,
                73,74,75,77,77,76,76,78,79,80,81,82,83,84,85,86,87,88,90]  
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