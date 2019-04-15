<template>
    <v-container grid-list-md style="padding-top:0px;">
        <v-layout>
            <v-flex xs9 id="left-container">
                <v-card class="elevation-7" style="padding-top:0px;padding:0px;text-align:left">
                    <v-card-text style="padding-top:0px;padding-bottom:0px">
                        <v-flex style="padding:0px">       
                            <div style="font-size:20px;padding-top:3px;padding-bottom:3px;">
                                Items Awating Actions
                            </div>
                            <v-divider style="margin:0px"></v-divider>
                            <template v-for="(item, index) in awatingItems">
                                <v-flex :key="item.title" style="padding:0px;padding-top:3px;padding-bottom:3px">
                                    <v-layout row wrap>
                                        <v-flex  xs8 style="margin:auto">
                                            {{item.request_desc}}
                                        </v-flex>
                                        <v-flex xs4 style="text-align:right;margin:auto">
                                            <v-btn v-if="item.show_ar_btn" outline :color="outlineColor" small style="border-radius:10px;">Reject</v-btn>
                                            <v-btn v-if="item.show_ar_btn" outline :color="outlineColor" small style="border-radius:10px;">Approve</v-btn>
                                        </v-flex>
                                    </v-layout>
                                </v-flex>
                                <v-divider v-if="index + 1 < awatingItems.length" :key="index" style="margin:0px"></v-divider>
                            </template>
                        </v-flex>
                    </v-card-text>
                </v-card>
                <v-card class="elevation-7" style="margin-top:10px;padding-top:0px;padding-bottom:0px">
                    <v-card-text>
                        <highcharts :options="chartOptions"></highcharts>
                    </v-card-text>
                </v-card>
                <v-layout row wrap>
                    <v-flex>
                        <v-card class="elevation-7" style="margin-top:10px;padding-top:0px;padding-bottom:0px">
                        <v-card-text>
                        <div class="headline" style="text-align:left">Compliance</div>
                        <v-layout row wrap>
                            <v-flex style="margin:auto">Archiving</v-flex>
                            <v-flex>
                                <v-progress-circular :size="79" :width="8" :value="value" color="teal">
                                    {{ value }}
                                </v-progress-circular>
                            </v-flex>
                            <v-flex style="margin:auto">
                                <v-btn outline :color="outlineColor" style="border-radius:10px">Fix</v-btn>
                            </v-flex>
                        </v-layout>
                        <v-layout row wrap>
                            <v-flex style="margin:auto">Disposal</v-flex>
                            <v-flex>
                                <v-progress-circular :size="79" :width="8" :value="value" color="#333333">
                                    {{ value }}
                                </v-progress-circular>
                            </v-flex>
                            <v-flex style="margin:auto">
                                <v-btn outline :color="outlineColor" style="border-radius:10px">Fix</v-btn>
                            </v-flex>
                        </v-layout>
                        </v-card-text>
                        </v-card>
                    </v-flex>
                    <v-flex>
                        <v-card class="elevation-7" style="margin-top:10px;padding-top:0px;padding-bottom:0px">
                            <v-card-text>
                                <!-- <div class="headline" >Overview</div> -->
                                <highcharts :options="pieChartOptions"></highcharts>
                            </v-card-text>
                        </v-card>
                    </v-flex>
                </v-layout>
            </v-flex>
            <v-flex xs3>
                <div style="text-align:left;font-size: 18px;margin-bottom:5%">Recent Activity</div>
                <v-flex xs12 style="background: #333333;
                    color: white;font-size: 18px;">2019</v-flex>
                <v-timeline :style="{'min-height':screenHeight}">
                    <v-timeline-item color="#333333" v-for="(item, i) in timelines" :key="i" small>
                        <span slot="opposite">{{formattedDate(item.created_date)}}</span>
                        <v-card dark style="font-size:10px">
                            <v-card-title class="title" style="color:white;font-size:11px !important" :title="item.activity_type">{{item.business_object_name}}</v-card-title>
                        </v-card>
                    </v-timeline-item>
                </v-timeline>
            </v-flex>
        </v-layout>
    </v-container>
</template>
<script>
import {BTN_COLOR} from '@/data/macros.js'
import { get as getToServer, deleteFromServer, post as postToServer } from '@/methods/serverCall.js';
import {N_USER_APPROVAL, GET_ACTIVITY_DETAILS } from '@/data/url_constants.js';
import config from '../config.json'
import dateFormat from '@/methods/DateFormat.js'
export default {
    name: "Dashboard",
    data () {
      return {
          screenHeight:'300px',
          value: '45%',
          outlineColor:BTN_COLOR,
          timelines:[
  {
    "business_object_name": "General Ledger",
    "business_object_id": "BOJDE0910000003",
    "created_date": "2019/04/02",
    "activity_type": "Restore",
    "activity_id": 458
  },
  {
    "business_object_name": "Purchase Order",
    "business_object_id": "BOJDE0910000003",
    "created_date": "2019/04/02",
    "activity_type": "Archival",
    "activity_id": 457
  },
  {
    "business_object_name": "Sales Order",
    "business_object_id": "BOCST0380",
    "created_date": "2019/03/26",
    "activity_type": "Restore",
    "activity_id": 456
  },
  {
    "business_object_name": "General Ledger",
    "business_object_id": "BOCST0380",
    "created_date": "2019/03/26",
    "activity_type": "Archival",
    "activity_id": 455
  },
  {
    "business_object_name": "EDI",
    "business_object_id": "BOJDE0910000003",
    "created_date": "2019/03/26",
    "activity_type": "Restore",
    "activity_id": 454
  },
  {
    "business_object_name": "Sales Order",
    "business_object_id": "BOJDE0910000003",
    "created_date": "2019/03/26",
    "activity_type": "Archival",
    "activity_id": 453
  }
],
            awatingItems:[
  {
    "request_desc": "Execute Sales Orders Archival older than Jan 1, 2015",
    "action": "accepted",
    "show_ar_btn": true,
    "id": 145
  },
   {
    "request_desc": "Publish General Ledger Archival version 2 from JDE Test to JDE Production",
    "action": "accepted",
    "show_ar_btn": true,
    "id": 146
  },
   {
    "request_desc": " Execute General Ledger Archival older than Jan 1, 2015",
    "action": "accepted",
    "show_ar_btn": true,
    "id": 147
  }
],
            chartOptions: {
                chart: {
                    type: 'line',
                     height: 300,
                },
                title: {
                    text: 'Data Growth Projection',
                    'align':'left',
                     x: -10
                },
                tooltip: {
                    // enabled: false,
                },
                xAxis: {
                    categories: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                },
                 yAxis: {
                    title: {
                        text: 'values (GB)'
                    }
                },
                // yAxis: {
                //     categories: ['0','250', '400', '600', '800', '950'],                
                // },
                plotOptions:{
                    series:{
                        allowPointSelect: true,
                        point: {
                            events:{
                                select: function(e) {                                
                                    console.log(e);
                                }
                            }                        
                        }
                    }
                },
                series: [{
                    name: 'No Archiving',
                    data: [450,500,550,800,850,900,950],
                    dashStyle:'dot'
                    //  zoneAxis: 'x',
                    // zones: [{
                    //     value: 4
                    // }, {
                    //     dashStyle: 'dot'
                    // }]
                }, {
                    name: 'With Archiving',
                    data: [250,300,350,500,550,600,650],
                    zoneAxis: 'x',
                    zones: [{
                        value: 4
                    }, {
                        dashStyle: 'dot'
                    }]
                }]
            },
            pieChartOptions:{chart: {
                    type: 'pie',
                     height: 200,
                    // options3d: {
                    //     enabled: true,
                    //     alpha: 45
                    // }
                },
                title: {
                    text: 'Overview'
                },
                // plotOptions: {
                //     pie: {
                //         innerSize: 150,
                //         depth: 45
                //     }
                // },
                series: [{
                    name: 'Delivered amount',
                    data: [
                        ['Other', 1],
                        ['Sales Orders', 6],
                        ['EDI', 2],
                        ['Purchase Orders', 5],
                        ['General Ledger', 6]
                    ]
                }]
                }            
      }},
      mounted() {
          this.screenHeight = window.innerHeight-170 +'px';
          this.getUserApprovalList();
          this.getActivityDetails();
      },
      methods:{
          formattedDate(dateObj){
              return dateFormat(this, dateObj);
          },
          getActivityDetails(){
              let inputParams={
                    "client_id": this.$session.get('client_id')
                }
                let _this = this;
              postToServer(this, config.ENGINE_API_URL + GET_ACTIVITY_DETAILS, inputParams).then(response => { 
                // _this.timelines = response;
              })
          },
          getUserApprovalList(){
              let inputParams={
                    "username": this.$session.get('email'),
                    "total_records": 5
                }
                let _this = this;
              postToServer(this, config.PROCESS_APPROVAL_URL +N_USER_APPROVAL, inputParams).then(response => {
                // console.log(response);    
                // _this.awatingItems = response;
              })
          }
      }
  }
</script>
