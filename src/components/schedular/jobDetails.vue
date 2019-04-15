<template>
    <v-container style="padding-top:10px;max-width:100%">
            <v-flex xs10 ml-3>
              <ul class="breadcrumb">
              <li><a href="/dashboard">Home</a></li>
              <li><a href="/processDefinitionList">Process Definition</a></li>
              <li>Jobs Details</li>
              <li><span style="font-weight:400;font-size:15px;"><input type="text" v-model="jobObject.params.name" :rules="SchedulerNameRules" @blur="untitle_job_details"/></span></li>
              </ul>
            </v-flex>
        <v-card class="elevation-7">
            <v-card-title style="background:#494949;color:white;padding: 0px 7px;">
                <v-layout row wrap justify-start>
                    <v-flex xs10 offset-xs1>
                        <span style="float:left;font-size:30px">Schedule Process for Archive Sales Order</span>
                    </v-flex>
                </v-layout>
            </v-card-title>
            <v-card-text>
                <v-layout row wrap>
                    <v-flex xs10 offset-xs1>
                        <v-layout row wrap>
                        <v-flex xs6>
                          <v-text-field label="Business Object"
                            style="margin-right:10px;width:90%;"
                            v-model="jobObject.params.job_name"
                            required
                            :rules="businessObjectRule" disabled></v-text-field>
                          </v-flex>
                          <v-flex xs6>
                                <!-- <v-text-field label="Start Day" style="width:90%;float:right" append-icon="fa-calendar-alt"></v-text-field> -->
                                <calender v-model="jobObject.params.start_from" style="margin-right:10px;width:90%;"> </calender>
                            </v-flex>
                        </v-layout>
                        <v-layout row wrap>
                            <v-flex xs6>
                                 <v-menu ref="menu" :close-on-content-click="false" v-model="menu2"
                                    :nudge-right="40" :return-value.sync="time" lazy transition="scale-transition"  offset-y full-width max-width="290px" 
                                    min-width="290px" style="width:90%;">
                                        <v-text-field slot="activator" v-model="jobObject.params.start_time" label="Start Time"
                                        append-icon="access_time" readonly ></v-text-field>
                                        <v-time-picker v-if="menu2" v-model="jobObject.params.start_time" format="24hr" @change="$refs.menu.save(time)" ></v-time-picker>
                                </v-menu>
                            </v-flex>
                            <v-flex xs6>
                                <v-select :items="timeZoneItems" label="Time Zone" style="margin-right:10px;width:90%;" v-model="jobObject.params.timezone" :rules="TimeZoneRules"></v-select>
                            </v-flex>
                        </v-layout>
                        <v-layout row wrap>
                            <v-flex xs6>
                                <v-layout style="width:90%;">
                                    <v-flex xs4>
                                        <label class="v-label" style="margin-top: 20%;float: left;">Execution Type</label>
                                    </v-flex>
                                    <v-flex xs8>
                                        <v-radio-group v-model="row" row>
                                            <v-radio class="radioClass" color="red" label="One Time" value="One Time"></v-radio>
                                            <v-radio class="radioClass" color="red" label="Recurring" value="Recurring"></v-radio>
                                        </v-radio-group>
                                    </v-flex>
                                </v-layout>
                            </v-flex>
                        </v-layout>
                    </v-flex>
                </v-layout>
            </v-card-text>
        </v-card>
        
        <v-card class="elevation-7" style="margin-top:30px;padding-top:0px;padding-bottom:0px" v-show="row == 'Recurring'">
            <v-card-title style="background:#494949;color:white;padding: 0px 7px;">
                <v-layout row wrap justify-start>
                    <v-flex xs10 offset-xs1>
                        <label style="float:left;font-size:30px">Recurrence Pattern</label>
                    </v-flex>
                </v-layout>
            </v-card-title>
            <v-card-text>
                <v-layout row wrap>
                    <v-flex xs10 offset-xs1>
                        <v-layout row wrap>
                            <v-flex xs3>
                                <v-radio-group v-model="recurrence" column style="border-right: 02px dashed;margin-right: 20%;min-height: 200px;">
                                    <v-radio class="radioClass" color="red" label="Weekly" value="Weekly"></v-radio>
                                    <v-radio class="radioClass" color="red" label="Monthly" value="Monthly"></v-radio>
                                </v-radio-group>
                            </v-flex>
                            <v-flex xs9>
                            <v-layout row wrap v-show="recurrence == 'Weekly'" mt-3>
                                <v-flex xs12>
                                     <v-checkbox label="Select All" color="red" class="customCheckbox">
                                     </v-checkbox>
                                </v-flex>
                                <v-flex class="text-sm-left">
                                    <v-chip color="primary" class="pointer custWidth" text-color="white" @click="sun = false"  v-if="sun==true || sun=='true'">Sun</v-chip>
                                    <v-chip class="pointer custWidth" @click="sun = true" outline v-if="sun==false || sun=='false'">Sun</v-chip>
                                </v-flex>
                                <v-flex class="text-sm-left">
                                    <v-chip color="primary" class="pointer custWidth" text-color="white" @click="Mon = false"  v-if="Mon==true || Mon=='true'">Mon</v-chip>
                                    <v-chip class="pointer custWidth" @click="Mon = true" outline v-if="Mon==false || Mon=='false'">Mon</v-chip>
                                </v-flex>
                                <v-flex class="text-sm-left">
                                    <v-chip color="primary" class="pointer custWidth" text-color="white" @click="Tue = false"  v-if="Tue==true || Tue=='true'">Tue</v-chip>
                                    <v-chip color="primary" class="pointer custWidth" @click="Tue = true" outline v-if="Tue==false || Tue=='false'">Tue</v-chip>
                                </v-flex>
                                <v-flex class="text-sm-left">
                                    <v-chip color="primary" class="pointer custWidth"  text-color="white" @click="Wed = false"  v-if="Wed==true || Wed=='true'">Wed</v-chip>
                                    <v-chip color="primary" class="pointer custWidth" @click="Wed = true" outline v-if="Wed==false || Wed=='false'">Wed</v-chip>
                                </v-flex>
                                <v-flex class="text-sm-left">
                                    <v-chip color="primary" class="pointer custWidth"  text-color="white" @click="Thu = false"  v-if="Thu==true || Thu=='true'">Thu</v-chip>
                                    <v-chip color="primary" class="pointer custWidth" @click="Thu = true" outline v-if="Thu==false || Thu=='false'">Thu</v-chip>
                                </v-flex>
                                <v-flex class="text-sm-left">
                                    <v-chip color="primary" class="pointer custWidth text-sm-center"  text-color="white" @click="Fri = false"  v-if="Fri==true || Fri=='true'">Fri</v-chip>
                                    <v-chip color="primary" class="pointer custWidth" @click="Fri = true" outline v-if="Fri==false || Fri=='false'">Fri</v-chip>
                                </v-flex>
                                <v-flex class="text-sm-left">
                                     <v-chip color="primary" class="pointer custWidth" text-color="white" @click="Sat = false"  v-if="Sat==true || Sat=='true'">Sat</v-chip>
                                    <v-chip color="primary" class="pointer custWidth" @click="Sat = true" outline v-if="Sat==false || Sat=='false'">Sat</v-chip>
                                </v-flex>
                            </v-layout>
                                <!-- ***************************** Monthly ************************************ -->
                            <v-layout row wrap v-show="recurrence == 'Monthly'">
                                <v-flex>
                                    <v-checkbox label="Select All" color="red" class="customCheckbox">
                                     </v-checkbox>
                                </v-flex>
                                <v-flex>
                                    <v-radio-group v-model="dayOfMonth" row>
                                        <v-radio class="radioClass" color="red" label="Date of Month" value="Date of Month"></v-radio>
                                        <v-radio class="radioClass" color="red" label="Day of Month" value="Day of Month"></v-radio>
                                    </v-radio-group>
                                </v-flex>
                            </v-layout>    
                            <v-layout class="text-sm-left" row v-show="recurrence == 'Monthly'" >
                                <v-flex xs6 v-if="dayOfMonth == 'Date of Month'">
                                    <!-- <label style="display: inline;float: left;margin-top:3%;font-weight: bold;font-size: 16px;">Date of month</label> -->
                                    <v-select :items="day_array" label="Select Date" style="width:80%;display:inline-block;margin-top:0px"></v-select>
                                </v-flex>
                                <v-flex xs6 v-show="dayOfMonth == 'Day of Month'">
                                    <!-- <label style="display: inline;float: left;margin-top:3%;font-weight: bold;font-size: 16px;">Day of Month</label> -->
                                    <v-select :items="day_of_week_array" label="Select Week" style="width:80%;display:inline-block;margin-top:0px"></v-select>
                                </v-flex>
                                <v-flex xs6 v-show="dayOfMonth == 'Day of Month'">
                                    <v-select :items="week_array" label="Select Day" style="width:80%;display:inline-block;margin-top:0px"></v-select>
                                </v-flex>
                            </v-layout>
                            <v-layout row wrap v-show="recurrence == 'Monthly'" mt-1>
                                <v-flex class="text-sm-left">
                                    <v-chip color="primary" class="pointer custWidth" text-color="white" @click="Jan = false"  v-if="Jan==true || Jan=='true'">Jan</v-chip>
                                    <v-chip class="pointer custWidth" @click="Jan = true" outline v-if="Jan==false || Jan=='false'">Jan</v-chip>
                                </v-flex>
                                <v-flex class="text-sm-left">
                                    <v-chip color="primary" class="pointer custWidth" text-color="white" @click="Feb = false"  v-if="Feb==true || Feb=='true'">Feb</v-chip>
                                    <v-chip class="pointer custWidth" @click="Feb = true" outline v-if="Feb==false || Feb=='false'">Feb</v-chip>
                                </v-flex>
                                <v-flex class="text-sm-left">
                                    <v-chip color="primary" class="pointer custWidth" text-color="white" @click="Mar = false"  v-if="Mar==true || Mar=='true'">Mar</v-chip>
                                    <v-chip class="pointer custWidth" @click="Mar = true" outline v-if="Mar==false || Mar=='false'">Mar</v-chip>
                                </v-flex>
                                <v-flex class="text-sm-left">
                                    <v-chip color="primary" class="pointer custWidth" text-color="white" @click="Apr = false"  v-if="Apr==true || Apr=='true'">Apr</v-chip>
                                    <v-chip class="pointer custWidth" @click="Apr = true" outline v-if="Apr==false || Apr=='false'">Apr</v-chip>
                                </v-flex>
                                <v-flex class="text-sm-left">
                                    <v-chip color="primary" class="pointer custWidth" text-color="white" @click="May = false"  v-if="May==true || May=='true'">May</v-chip>
                                    <v-chip class="pointer custWidth" @click="May = true" outline v-if="May==false || May=='false'">May</v-chip>
                                </v-flex>
                                <v-flex class="text-sm-left">
                                    <v-chip color="primary" class="pointer custWidth" text-color="white" @click="Jun = false"  v-if="Jun==true || Jun=='true'">Jun</v-chip>
                                    <v-chip class="pointer custWidth" @click="Jun = true" outline v-if="Jun==false || Jun=='false'">Jun</v-chip>
                                </v-flex>
                                <v-flex class="text-sm-left">
                                    <v-chip color="primary" class="pointer custWidth" text-color="white" @click="Jul = false"  v-if="Jul==true || Jul=='true'">Jul</v-chip>
                                    <v-chip class="pointer custWidth" @click="Jul = true" outline v-if="Jul==false || Jul=='false'">Jul</v-chip>
                                </v-flex>
                                <v-flex class="text-sm-left">
                                    <v-chip color="primary" class="pointer custWidth" text-color="white" @click="Aug = false"  v-if="Aug==true || Aug=='true'">Aug</v-chip>
                                    <v-chip class="pointer custWidth" @click="Aug = true" outline v-if="Aug==false || Aug=='false'">Aug</v-chip>
                                </v-flex>
                                <v-flex class="text-sm-left">
                                    <v-chip color="primary" class="pointer custWidth" text-color="white" @click="Sep = false"  v-if="Sep==true || Sep=='true'">Sep</v-chip>
                                    <v-chip class="pointer custWidth" @click="Sep = true" outline v-if="Sep==false || Sep=='false'">Sep</v-chip>
                                </v-flex>
                                <v-flex class="text-sm-left">
                                    <v-chip color="primary" class="pointer custWidth" text-color="white" @click="Oct = false"  v-if="Oct==true || Oct=='true'">Oct</v-chip>
                                    <v-chip class="pointer custWidth" @click="Oct = true" outline v-if="Oct==false || Oct=='false'">Oct</v-chip>
                                </v-flex>
                                <v-flex class="text-sm-left">
                                    <v-chip color="primary" class="pointer custWidth" text-color="white" @click="Nov = false"  v-if="Nov==true || Nov=='true'">Nov</v-chip>
                                    <v-chip class="pointer custWidth" @click="Nov = true" outline v-if="Nov==false || Nov=='false'">Nov</v-chip>
                                </v-flex>
                                <v-flex class="text-sm-left">
                                    <v-chip color="primary" class="pointer custWidth" text-color="white" @click="Dec = false"  v-if="Dec==true || Dec=='true'">Dec</v-chip>
                                    <v-chip class="pointer custWidth" @click="Dec = true" outline v-if="Dec==false || Dec=='false'">Dec</v-chip>
                                </v-flex>
                            </v-layout>    

                            </v-flex> <!-- end of xs9 -->
                        </v-layout>

                    </v-flex>
                </v-layout>
            </v-card-text>
        </v-card>
        <v-card class="elevation-7" style="margin-top:30px" v-show="row == 'Recurring'">
            <v-card-title style="background:#494949;color:white;padding: 0px 7px;">
                <v-layout row wrap justify-start>
                    <v-flex xs10 offset-xs1>
                        <span style="float:left;font-size:30px">Range of Recurrence</span>
                    </v-flex>
                </v-layout>
            </v-card-title>
            <v-card-text>
                <v-layout row wrap>
                    <v-flex xs10 offset-xs1>
                      <v-layout row wrap>
                          <v-flex xs4>
                              <label style="float:left;padding: 15px 5px 0px;font-weight: bold;font-size:24px">End On</label>
                          </v-flex>
                          <v-flex xs4>
                              <v-radio-group v-model="EndDate" row>
                              <v-radio class="radioClass" color="red" label="No End Date" value="No End Date" style="margin-top: 7%;"></v-radio>
                              </v-radio-group>
                          </v-flex>
                          <v-flex xs4>
                               <label style="display: inline;float: left;margin-top:7%;font-weight: bold;font-size: 16px;">Day of month</label>
                               <v-text-field label="YY/MM/DD" style="width:50%;display:inline-block;" append-icon="fa-calendar-alt"></v-text-field>
                          </v-flex>
                      </v-layout>  
                    </v-flex>
                </v-layout>
            </v-card-text>
        </v-card>
        <v-layout row wrap mt-5>
            <v-flex xs12 class="text-xs-right" mr-2>
                <v-btn color="blue" style="color:white">
                    Save
                </v-btn>                    
                <v-btn color="blue"  style="color:white">
                    Cancel
                </v-btn>
            </v-flex>
        </v-layout>
    </v-container>
</template>
<script>
import Calender from '../../views/calender'
import config from '../../config.json'
var moment = require("moment-timezone");
import { post as postToServer } from './../../methods/serverCall.js';
import { get as getToServer } from './../../methods/serverCall.js';
import { ADD_DATASOURCE, DS_AND_DB_TYPES, CHECK_CONNECTION, UPDATE_DATASOURCE } from '../../data/url_constants.js'
import {SERVER_ERROR} from '../../data/client_message.js'
export default {
     name: 'Schedule',
     components: {
    'calender':Calender,
  },
  mounted () {
       this.getJobDetails()
    },
    data() {
      return {
        dayOfMonth:"Date of Month",
        sun:true,
        Mon:true,
        Tue:true,
        Wed:true,
        Thu:true,
        Fri:true,
        Sat:true,
        Jan:true,
        Feb:true,
        Mar:true,
        Apr:true,
        May:true,
        Jun:true,
        Jul:true,
        Aug:true,
        Sep:true,
        Oct:true,
        Nov:true,
        Dec:true,
        time: null,
        menu2: false,
        modal2: false,
        WeeklyArray: [],
        monthArray:[],
        row:'One Time',
        recurrence:'Weekly',
        week_array:['sun','mon','tue','wed','thu','fri','sat'],
        day_array:['01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17',
        '18','19','20','21','22','23','24','25','26','27','28','29','30','31','last'],
        day_of_week_array:['1st','2nd','3rd','4th','5th','last'],
        SchedulerName: "Untitled Document",
        SchedulerNameRules: [v => !!v || 'Scheduler Name is required.'],
        TimeZoneRules: [v => !!v || 'Time Zone is required.'],
        TimeZone: null,
        business_object: this.$route.params.process_doc,
        businessObjectRule: [v => !!v || 'Business Object Name is required.'],
        is_business_object: false,
        job_id: null,
        job_name: null,
        end_point: null,
        service_id: null,
        timeZoneItems: [{
          "value": "UTC",
          "text": "UTC"
        }],
        EndDate:null,
        jobObject:{
          "scheduled_datetime": null,
          "schedule_id":"",
          "params": {
          "name": "",
          "start_from": "",
          "start_time":{HH: '', mm: ''},
            // "process_definition_id":"",
            "end_point":"",
            "job_id": "",
            "job_name": "",
            "service_id": "",
            "client_id": "",
            "created_by": "",
            "is_recurring": 'false',
            "timezone": "",
            // "mode_of_execution":"proof",
            // "execution_environment":"",
            "recurring":{
              // "start_time":{HH: '', mm: ''},
              "recurrence_pattern":{
                "recurrence_pattern_type":"daily",
                "every_xth_days":"",
                "every_xth_weeks":"",
                "week_array":[],                
                "is_day_of_month":'true',
                "day_of_month":"",
                "which_day_of_week":"",
                "selected_week_day":"",
                "month_array":[]
              },
              "range_of_recurrence":{
                // "start_from":"",
                "end_on": "no_end",
                "end_after_times":"",
                "until_date":""
              }
            }
          }
        }
      }
    },
  methods: {
    setVisibility(){
          alert("Working");
      },

    untitle_job_details(){
      if (!this.SchedulerName.trim()){
        this.SchedulerName = 'Untitled Datasource'
      }
    },
      getJobDetails(){
        debugger
        this.productList = ["Reporting", "ErpDataCloud", "UserProvisioning", "SchedulerFrontend", "AuthorizationFrontend"]
      if(this.$route.params.process_doc && this.$route.params.service_id){
          this.jobObject.params.execution_environment = this.$route.params.process_doc.environmentName;
          this.jobObject.params.mode_of_execution = this.$route.params.process_doc.environmentMode;
          this.jobObject.params.service_id = this.$route.params.service_id;
          this.jobObject.params.job_name = this.$route.params.process_doc.process_definition_name; 
          this.jobObject.params.job_id = this.$route.params.process_doc.job_id;
          this.jobObject.params.process_definition_id = this.$route.params.process_doc.process_definition_id;
          this.jobObject.params.end_point = 'execute_job';
            // console.log(JSON.stringify(this.$route.params.process_doc));
      }
      else if (this.$route.params.business_object && this.$route.params.service_id){
        this.jobObject.params.is_business_object = true
        this.jobObject.params.job_id = this.$route.params.job_id;
        this.jobObject.params.job_name = this.$route.params.business_object
        this.jobObject.params.end_point = this.$route.params.end_point;
        this.jobObject.params.service_id = this.$route.params.service_id;
      }
      if(this.$route.params.type && this.$route.params.type == 'history' && this.$route.params.job){
        this.jobObject.params.type = 'history';
        this.jobObject.params.jobObject = this.$route.params.job;
        this.jobObject.schedule_id = this.jobObject.id;
        this.jobObject.params.is_recurring = "false";
      }
      else if(this.$route.params.business_object){
        this.is_business_object = true
      }

      var now = moment.utc();
      // get the zone offsets for this time, in minutes
      var UtcOffset = moment.tz.zone("UTC").utcOffset(now);

      var timezone = moment.tz.names();
        // debugger;
      for (var i = 0; i < timezone.length; i++) {
        var tz = {};
        var TzOffset = moment.tz.zone(timezone[i]).utcOffset(now);
        var hrs = (TzOffset - UtcOffset) / 60;
        var hrs_unsigned = Math.abs(hrs);
        var hr = Math.floor(hrs_unsigned);
        var min = (hrs_unsigned - hr) * 60;
        if (hrs_unsigned != 0)
          hr = hr * (hrs / hrs_unsigned);
        tz.value = timezone[i];

        tz.text = timezone[i] + " (" + hr + ":" + min + " UTC)";
        var array = $.grep(this.timeZoneItems, function (value) {
          return value.text.indexOf(" (" + hr + ":" + min + " UTC)") >= 0;
        });
        if (array.length <= 0)
          this.timeZoneItems.push(tz);
      }
    },
    getSaveObject(Object){
        let tempObject = cloneDeep(Object);
        if(tempObject.params.start_from){
          debugger;          
          tempObject.params.start_from = new Date(tempObject.params.start_from)
          var day = ("0" + tempObject.params.start_from.getDate()).slice(-2)
          var monthIndex = ("0"+(tempObject.params.start_from.getMonth()+1)).slice(-2)
          // monthIndex = monthIndex+1;
          var year = tempObject.params.start_from.getFullYear();
          tempObject.params.start_from = year+"-"+ monthIndex +"-"+ day;
        }
        if(tempObject.params.recurring.range_of_recurrence.until_date){
          tempObject.params.recurring.range_of_recurrence.until_date = new Date(tempObject.params.recurring.range_of_recurrence.until_date);
          var day = ("0" + tempObject.params.recurring.range_of_recurrence.until_date.getDate()).slice(-2)
          var monthIndex = ("0"+(tempObject.params.recurring.range_of_recurrence.until_date.getMonth()+1)).slice(-2)
          // monthIndex = monthIndex+1;
          var year = tempObject.params.recurring.range_of_recurrence.until_date.getFullYear();
          tempObject.params.recurring.range_of_recurrence.until_date = year+"-"+ monthIndex +"-"+ day;
        }
        return tempObject;
      },
      saveUserData() {
        let _this=this;
        this.SessionCheck()
        // console.log('IN ADD USER')
        this.IsErrorOccurred = false
        this.ShowErrorMessage = false
        var Authorization = this.$session.get('access_token')
        var clientId = this.$session.get('client_id')
        var user_id = this.$session.get('email')
        this.jobObject.params.client_id = clientId;
        this.jobObject.params.created_by = user_id;
        let inputParam = _this.getSaveObject(this.jobObject);
        postToServer(this, config.SCHEDULAR_URL + '/schedule_job', inputParam).then(response => {
          debugger;
          var data = response
          if (data) {
            this.sucessMessage = data.message;
            //  this.$message.success(data.message, 3000)
            setTimeout(function(){
              if (this.is_business_object)
                this.$router.push('/jobsrestoration')
              else
                this.$router.push('/processdefinitionlist');
            },3000);
            // this.$router.push('/userList')
          } else {
            console.log("Data in add user error message " + data)
            this.ShowErrorMessage = true
            this.ShowSuccessMessage = false;
            this.ErrorTitle = 'Error Occurred'
            this.ErrorMessage = data.message
            this.$message.error(data.message, 3000)
          }
        }, response => {
          console.log(response)
          var data = JSON.parse(response.bodyText)
          this.ShowSuccessMessage = false;
          this.ShowErrorMessage = true
          this.ErrorMessage = data.message
        }).catch(e => {
          console.log('error occured')
          console.log(e.error)
          this.ShowSuccessMessage = false;
          this.ShowErrorMessage = true
          this.ErrorTitle = 'Error Occured'
          this.ErrorMessage = 'Something went wrong.Try Again'
        })
      },
    updateUserData() {
        let _this = this;
        this.SessionCheck()
        // this.getSelectedRole()
        // this.getRolesUser()
        // this.getRoleName()job_id
        console.log('IN UPDATE USER')
        this.IsErrorOccurred = false
        this.ShowErrorMessage = false
        var Authorization = this.$session.get('access_token')
        var clientId = this.$session.get('client_id');
        _this.jobObject.id = this.$route.params.job_id;
        let inputParam = _this.getSaveObject(this.jobObject);
        this.$http.post(config.SCHEDULAR_URL + '/update_job', inputParam, {
          // emulateJSON: true,
          headers: {
            'Authorization': Authorization,
            'Content-Type': 'application/json'
          }
        }).then(response => {
          var data = response.body;
          // console.log(data)
          if (response.status === 200) {
              this.ShowSuccessMessage = true;
            this.sucessMessage = data.message;
            setTimeout(function(){
              _this.$router.push('/scheduledJobList');
            },2000);
          } else {
            this.ShowErrorMessage = true
            this.ErrorTitle = 'Error Occurred'
            this.ErrorMessage = 'Something went wrong.Try Again'
          }
        }, response => {
          //console.log(response)
          this.ShowSuccessMessage = false;
           var data = JSON.parse(response.bodyText)
          this.ShowErrorMessage = true
          this.ErrorMessage = data.message
        }).catch(e => {
          console.log('error occured')
          console.log(e.error)
          this.ShowErrorMessage = true
          this.ErrorTitle = 'Error Occured'
          this.ErrorMessage = 'Something went wrong.Try Again'
        })
      },
      save() {
        this.SessionCheck()
        if (this.$route.params.job_id && this.$route.params.type && this.$route.params.type == 'edit') {
          this.updateUserData()
        }else {
          this.saveUserData()
        }
      },
  }
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

