<template>
    <div>
            <!-- <v-flex xs10 ml-1 mb-3>
                <ul class="breadcrumb">
                    <li><a href="/">Home</a></li>
                    <li><a href="/scheduledJobList">Process Definition</a></li>
                    <li>Schedule a Job</li>
                </ul>
            </v-flex> -->
            <v-layout row wrap pl-4 mb-3 class="breadcrumbBackground">
            <v-flex xs8 style="margin:auto">
                <v-layout row wrap>
                    <v-flex xs12 pl-3>
                        <ul class="breadcrumb">
                            <li><a href="/">Home</a></li>
                            <li><a href="/scheduledJobList">Process Definition</a></li>
                            <li>Schedule a Job</li>
                        </ul>
                    </v-flex>
                     <v-flex >
                        
                    </v-flex>
                </v-layout>
                
            </v-flex>
            <v-flex xs4 text-xs-right pr-4 pb-1 style="">
               
            </v-flex>
        </v-layout>
        <v-card class="elevation-7">
            <v-card-title style="background:#494949;color:white;padding: 0px 7px;">
                <v-layout row wrap ml-3>
                    <v-flex xs12 style="text-align:left">
                        <span style="font-size:30px">Schedule </span>
                    </v-flex>
                </v-layout>
            </v-card-title>
            <v-card-text>
                <v-container>
                <!-- <v-layout row wrap>
                    <v-flex xs12> -->
                        <v-layout row wrap>
                            <v-flex xs6>
                                <v-text-field v-model="jobObject.params.name" label="Schedule Name"  style="width:90%;" readonly></v-text-field>
                            </v-flex>
                            <v-flex xs6>
                                <calender :input="jobObject.params.start_from" @update="setDate" style="width:90%;float:right"> </calender>
                            </v-flex>
                        </v-layout>
                        <v-layout row wrap>
                            <v-flex xs6>
                                <v-menu ref="menu" :close-on-content-click="false" v-model="menu2"
                                    :nudge-right="40" :return-value.sync="jobObject.params.start_time" lazy transition="scale-transition"  
                                    offset-y full-width max-width="290px" min-width="290px" style="width:90%">
                                        <v-text-field slot="activator" v-model="jobObject.params.start_time" label="Start Time"
                                        append-icon="access_time" readonly ></v-text-field>
                                    <v-time-picker v-if="menu2" v-model="jobObject.params.start_time" format="24hr" @change="$refs.menu.save(jobObject.params.start_time)" ></v-time-picker>
                                </v-menu>
                            </v-flex>
                            <v-flex xs6>
                                <v-autocomplete clearable v-model="jobObject.params.timezone" label="Time Zone" 
                                :items="timeZoneItems" style="width:90%;float:right;"></v-autocomplete> 
                            </v-flex>
                        </v-layout>
                        <v-layout row wrap v-if="type !== 'history'">
                            <v-flex xs6>
                                <v-layout style="width:90%;">
                                    <v-flex xs4 style="margin:auto">
                                        <label class="v-label" style="float: left;">Execution Type</label>
                                    </v-flex>
                                    <v-flex xs8>
                                        <v-radio-group v-model="jobObject.params.is_recurring" row>
                                            <v-radio class="radioClass" :color="colorCode" label="One Time" :value="false"></v-radio>
                                            <v-radio class="radioClass" :color="colorCode" label="Recurring" :value="true" v-if="!is_one_time_schedule"></v-radio>
                                        </v-radio-group>
                                    </v-flex>
                                </v-layout>
                            </v-flex>
                        </v-layout>
                    <!-- </v-flex>
                </v-layout> -->
                </v-container>
            </v-card-text>
        </v-card>
        
        <v-card class="elevation-7" style="margin-top:30px;padding-top:0px;padding-bottom:0px" v-show="jobObject.params.is_recurring == true">
            <v-card-title style="background:#494949;color:white;padding: 0px 7px;">
                <v-layout row wrap justify-start ml-3>
                    <v-flex xs12 style="text-align:left">
                        <label style="font-size:30px">Recurrence Pattern</label>
                    </v-flex>
                </v-layout>
            </v-card-title>
            <v-card-text>
                <v-layout row wrap>
                    <v-flex xs10 offset-xs1>
                        <v-layout row wrap>
                            <v-flex xs3>
                                    <!-- <v-radio class="radioClass" color="red" label="Daily" value="radio-1"></v-radio> -->
                                <v-radio-group v-model="jobObject.params.recurring.recurrence_pattern.recurrence_pattern_type" 
                                        column style="border-right: 02px dashed;margin-right: 20%;min-height: 200px;">
                                    <v-radio class="radioClass" :color="colorCode" label="Weekly" value="weekly"></v-radio>
                                    <v-radio class="radioClass" :color="colorCode" label="Monthly" value="monthly"></v-radio>
                                </v-radio-group>
                            </v-flex>
                            <v-flex xs9>
                                      <!-- *****dayOfWeeks******************** Weekly **************************     -->
                            <v-layout row wrap v-show="jobObject.params.recurring.recurrence_pattern.recurrence_pattern_type == 'weekly'" mt-3>
                                <v-flex xs12>
                                    <v-checkbox label="Select All" v-model = "weeklySelectAll" @change="toggleSelect" 
                                        :color="colorCode" class="customCheckbox">
                                    </v-checkbox>
                                </v-flex>
                                <v-flex class="text-sm-left" v-for="(day, index) in dayOfWeeks" :key="index">
                                    <v-chip :color="colorCode" class="pointer custWidth" text-color="white" @click="day.value = !day.value"  v-if="day.value">{{day.text}}</v-chip>
                                    <v-chip class="pointer custWidth" @click="day.value = !day.value" outline v-if="!day.value">{{day.text}}</v-chip>
                                </v-flex>
                            </v-layout>
                                <!-- ***************************** Monthly ************************************ -->
                            <v-layout row wrap v-show="jobObject.params.recurring.recurrence_pattern.recurrence_pattern_type == 'monthly'">
                                <v-flex>
                                    <v-checkbox label="Select All" v-model="monthlySelectAll" @change="toggleMonthlySelect" :color="colorCode" class="customCheckbox">
                                     </v-checkbox>
                                </v-flex>
                                <v-flex>
                                    <v-radio-group v-model="jobObject.params.recurring.recurrence_pattern.is_day_of_month" row>
                                        <v-radio class="radioClass" :color="colorCode" label="Date of Month" :value="false"></v-radio>
                                        <v-radio class="radioClass" :color="colorCode" label="Day of Month" :value="true"></v-radio>
                                    </v-radio-group>
                                </v-flex>
                            </v-layout>    
                            <v-layout class="text-sm-left" row v-show="jobObject.params.recurring.recurrence_pattern.recurrence_pattern_type == 'monthly'" >
                                <v-flex xs6 v-if="!jobObject.params.recurring.recurrence_pattern.is_day_of_month">
                                    <!-- jobObject.params.recurring.recurrence_pattern.day_of_month <label style="display: inline;float: left;margin-top:3%;font-weight: bold;font-size: 16px;">Date of month</label> -->
                                    <v-select :items="day_array" v-model="jobObject.params.recurring.recurrence_pattern.day_of_month" 
                                        label="Select Date" style="width:80%;display:inline-block;margin-top:0px"></v-select>
                                </v-flex>
                                <v-flex xs6 v-show="jobObject.params.recurring.recurrence_pattern.is_day_of_month">
                                    <!-- <label style="display: inline;float: left;margin-top:3%;font-weight: bold;font-size: 16px;">Day of Month</label> -->
                                    <v-select v-model="jobObject.params.recurring.recurrence_pattern.which_day_of_week" :items="day_of_week_array" label="Select Week" style="width:80%;display:inline-block;margin-top:0px"></v-select>
                                </v-flex>
                                <v-flex xs6 v-show="jobObject.params.recurring.recurrence_pattern.is_day_of_month">
                                    <v-select :items="week_array" v-model="jobObject.params.recurring.recurrence_pattern.selected_week_day" 
                                        label="Select Day" style="width:80%;display:inline-block;margin-top:0px"></v-select>
                                </v-flex>
                            </v-layout>
                            <v-layout row wrap v-show="jobObject.params.recurring.recurrence_pattern.recurrence_pattern_type == 'monthly'" mt-1>
                                <v-flex class="text-sm-left" v-for="(month, index) in dayOfMonthArray" :key="index">
                                    <v-chip :color="colorCode" class="pointer custWidth" text-color="white" @click="month.value = !month.value"  v-if="month.value">{{month.text}}</v-chip>
                                    <v-chip class="pointer custWidth" @click="month.value = !month.value" outline v-if="!month.value">{{month.text}}</v-chip>
                                </v-flex>
                            </v-layout>    

                            </v-flex> <!-- end of xs9 -->
                        </v-layout>

                    </v-flex>
                </v-layout>
            </v-card-text>
        </v-card>
        <v-card class="elevation-7" style="margin-top:30px" v-show="jobObject.params.is_recurring">
            <v-card-title style="background:#494949;color:white;padding: 0px 7px;">
                <v-layout row wrap justify-start ml-3>
                    <v-flex xs12 style="text-align:left">
                        <span style="font-size:30px">Range of Recurrence</span>
                    </v-flex>
                </v-layout>
            </v-card-title>
            <v-card-text>
                <v-layout row wrap>
                    <v-flex xs10 offset-xs1>
                      <v-layout row wrap>
                          <v-flex xs3>      
                              <v-checkbox label="No End Date" v-model="jobObject.params.recurring.range_of_recurrence.end_on" 
                                    :color="colorCode" class="customCheckbox" @change="toggleUntillDate"> </v-checkbox>
                          </v-flex>
                          <v-flex xs3 class="text-xs-right">
                                <v-text-field v-model="jobObject.params.recurring.range_of_recurrence.end_after_times" label="End after iterations" :rules="iterationRules" style="width:90%;float:right"> </v-text-field>
                            </v-flex>
                          <v-flex xs3 class="text-xs-right">
                               <label style="margin-top:7%;font-weight: bold;font-size: 16px;">Day of month</label>
                          </v-flex>
                          <v-flex xs3>
                               <calender :input="jobObject.params.recurring.range_of_recurrence.until_date" @update="setUntillDate" style="width:90%;float:right"> </calender>
                          </v-flex>
                      </v-layout>  
                    </v-flex>
                </v-layout>
            </v-card-text>
        </v-card>
        <v-layout row wrap mt-5>
            <v-flex xs12 class="text-xs-right" mr-2>
                <v-btn :color="outlineColor" outline @click="saveData" style="border-radius:10px">
                    Save
                </v-btn>                    
                <v-btn :color="outlineColor" outline style="border-radius:10px" @click="CancelSchedule">
                    Cancel
                </v-btn>
            </v-flex>
        </v-layout>
        <v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'>
            {{ snackbartext }}
        </v-snackbar>
    </div>
</template>
<script>
import config from "../../config.json"
import Calender from '../../views/calender'
import Breadcrumb from "../Breadcrumbs.vue"
import cloneDeep from 'lodash/cloneDeep'
import {
    get as getToServer,
    post as postToServer
} from './../../methods/serverCall.js';
import {
    SERVER_ERROR
} from '../../data/client_message.js'
import {
    GET_SCHEDULE,
    SCHEDULE_JOB,
    UPDATE_JOB
} from '../../data/url_constants.js';
import {
    DAY_OF_WEEKS,
    DAY_OF_MONTH_ARRAY,
    WEEK_ARRAY,
    DAY_ARRAY,
    DAY_OF_WEEK_ARRAY,
    JOB_OBJECT
} from '../../data/metaData.js'
import filter from 'lodash/filter'
import {COLOR_CODE, BTN_COLOR} from '../../data/macros.js'
var moment = require("moment-timezone");
export default {
    name: 'Schedule',
    components: {
        'calender': Calender,
        Breadcrumb
    },
    data() {
        return {
            disabled: 0,
            snackbar:false,
            snackbartext:'',
            snackbartimeout:5000,
            colorValue:'error',
            loader: "loading",
            loading: false,
            outlineColor:BTN_COLOR,
            colorCode:COLOR_CODE,
            type:'new',
            weeklySelectAll: true,
            monthlySelectAll: true,
            dayOfWeeks: DAY_OF_WEEKS,
            dayOfMonthArray: DAY_OF_MONTH_ARRAY,
            schedule_name: "",
            start_date: "",
            start_time: "",
            timezone: "",
            dayOfMonth: "Date of Month",
            time: null,
            menu2: false,
            modal2: false,
            timeZoneItems: moment.tz.names(),
            WeeklyArray: [],
            monthArray: [],
            row: 'One Time',
            recurrence: 'Weekly',
            week_array: WEEK_ARRAY,
            day_array: DAY_ARRAY,
            day_of_week_array: DAY_OF_WEEK_ARRAY,
            jobObject: cloneDeep(JOB_OBJECT),
            is_one_time_schedule:false,
            iterationRules: [v => /^((\d+(\.\d *)?)|((\d*\.)?\d+))$/.test(v) || 'End after iterations should be numeric'],
        }
    },
    watch: {
        'jobObject.params.recurring.range_of_recurrence.until_date'(newvalue, o) {
            if (newvalue)
                this.jobObject.params.recurring.range_of_recurrence.end_on = false;
        },
        dayOfMonthArray: {
            handler: function (val, o) {
                let selectedMonth = filter(val, 'value');
                this.monthlySelectAll = selectedMonth.length == val.length ? true : false;
            },
            deep: true
        },
        dayOfWeeks: {
            handler: function (val, oldVal) {
                let selectedWeek = filter(val, 'value');
                this.weeklySelectAll = selectedWeek.length == val.length ? true : false;
            },
            deep: true
        },
    },
    mounted() {
        let _this = this;
            // debugger;
        if (this.$route.params.service_id && this.$route.params.end_point) {
            _this.jobObject.params.service_id = this.$route.params.service_id;
            _this.jobObject.params.end_point = this.$route.params.end_point;
            _this.jobObject.params.name = this.$route.params.schedule_data.process_definition_name
            _this.jobObject.params = Object.assign(_this.jobObject.params, this.$route.params.schedule_data)
            console.log(_this.jobObject.params)
        }
        if (this.$route.params.schedule_id) {
            this.getSchedule()
        }
        else{
            this.jobObject.params.timezone = this.$session.get('time_zone_preference')
        }
        if(this.$route.params.type && this.$route.params.type == 'history' && this.$route.params.job){
        this.type = 'history';
        this.jobObject = this.$route.params.job;
        this.jobObject.params.start_time = this.jobObject.params.start_time.HH + ':' + this.jobObject.params.start_time.mm;
        this.jobObject.schedule_id = this.jobObject.id;
        this.jobObject.params.is_recurring = false;
      }
      this.is_one_time_schedule =  this.$route.params.schedule_data.is_one_time_schedule
    },
    props: {
        msg: String
    },
    methods: {
        toggleUntillDate(val) {
            if (val) this.jobObject.params.recurring.range_of_recurrence.until_date = null;
        },
        toggleMonthlySelect(val) {
            this.dayOfMonthArray.map(obj => {
                obj.value = val ? true : false;
            })
        },
        toggleSelect(val) {
            this.dayOfWeeks.map(obj => {
                obj.value = val ? true : false;
            });
        },
        saveData() {
            let _this = this;
            var clientId = this.$session.get('client_id')
            var user_id = this.$session.get('email')

            this.jobObject.params.client_id = clientId;
            this.jobObject.params.created_by = user_id;
            let inputParam = _this.getSaveObject(this.jobObject);
            let url = "";
            if (this.$route.params.schedule_id && this.$route.params.type && this.$route.params.type == 'edit') {
                inputParam.id = this.$route.params.schedule_id;
                url = config.SCHEDULER_URL + UPDATE_JOB;
            } else {
                url = config.SCHEDULER_URL + SCHEDULE_JOB;
            }
            postToServer(this, url, inputParam).then(
                    addResponse  => {
                        setTimeout(function () {
                            _this.$router.push('/scheduledJobList');
                        }, 2000);
                    }).catch(error_response => {
                if(error_response){
                    this.snackbar = true
                    this.colorValue = 'error'
                    this.snackbartext = error_response;
                }
                else {
                    this.snackbar = true
                    this.colorValue = 'error'
                    this.snackbartext = SERVER_ERROR;
                    }
                });

            // postToServer(this, url, inputParam).then(response => {
            //     debugger
            //     // this.$toasted.success(response.message);
            //     this.colorValue = 'success'
            //     this.snackbartext = response.message;
            //     this.snackbar = true
            //     setTimeout(function () {
            //         _this.$router.push('/scheduledJobList');
            //     }, 2000);
            // }, error => {
            //     if (error){
            //     this.colorValue = 'error'
            //     this.snackbartext = error;
            //     this.snackbar = true
            //     }
            //         // this.$toasted.error(error);
            // }).catch(error_response => {

            // })
        },
        getSaveObject(Object) {
            let tempObject = cloneDeep(Object);
            let _this = this;
            tempObject.params.is_recurring = tempObject.params.is_recurring + "";
            if (tempObject.params.is_recurring) {
                if (tempObject.params.recurring.recurrence_pattern.recurrence_pattern_type == 'weekly') {
                    // The `_.property` iteratee shorthand. tempObject.params.recurring.recurrence_pattern.month_array
                    let selectedWeek = filter(_this.dayOfWeeks, 'value');
                    tempObject.params.recurring.recurrence_pattern.week_array = [];
                    selectedWeek.map((obj, index) => {
                        tempObject.params.recurring.recurrence_pattern.week_array.push(obj.text);
                    });
                } else {
                    let selectedMonth = filter(_this.dayOfMonthArray, 'value');
                    tempObject.params.recurring.recurrence_pattern.month_array = [];
                    selectedMonth.map((obj, index) => {
                        tempObject.params.recurring.recurrence_pattern.month_array.push(obj.text);
                    });
                }
            }
            if (tempObject.params.start_time) {
                let time = tempObject.params.start_time.split(":");
                tempObject.params.start_time = {
                    'HH': time[0],
                    'mm': time[1]
                }
            }
            return tempObject;
        },
        setDate(dateParam) {
            let _this = this;
            _this.jobObject.params.start_from = dateParam;
        },
        setUntillDate(dateParam) {
            let _this = this;
            _this.jobObject.params.recurring.range_of_recurrence.until_date = dateParam;
            _this.jobObject.params.recurring.range_of_recurrence.end_on = false;
        },
        getSchedule() {
            getToServer(this, config.SCHEDULER_URL + GET_SCHEDULE + this.$route.params.schedule_id).then(response => {
                this.jobObject = response;
                this.jobObject.params.start_time = response.params.start_time.HH + ':' + response.params.start_time.mm;
                this.jobObject.params.is_recurring = JSON.parse(this.jobObject.params.is_recurring);
            }).catch(error_response => {

            })
        },
        CancelSchedule(){
            // this.$router.push('/process_def_list_for_execution')
            this.$router.go(-1);
        }
    },

}
</script>
<style scoped>
 .radioClass >>> label{
    top: 5px !important;
} 
.radioClass >>> i{
    font-size: 30px
}
.customCheckbox >>> label{
    top: 5px !important;
}
/* .customCheckbox >>> i{
    top: 5px !important;
} */
.pointer{
    cursor: pointer;
}
.pointer >>> span{
    cursor: pointer;
}
.custWidth{
    width: 55px;
}
.customCheckbox >>> label{
    top: 5px !important;
}
</style>

