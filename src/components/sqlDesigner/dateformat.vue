<template>
  <!-- <v-container grid-list-md> -->
    <v-card class="rounded-card">
      <v-form ref="form" lazy-validation @submit.prevent="dateselection()">
        <v-toolbar dark dense>
          <v-flex class="text-md-center">Dates
            <v-icon class="text-lg-left" @click="hideDateformatDlg" style="color:#dedede;height:22px;float:right">
              fa-times-circle</v-icon> 
          </v-flex>
        </v-toolbar>
        <v-card-text xs12 sm6>
          <!-- <span class="headline" ml-0>Dates</span> -->
          <v-layout>
            <v-flex xs1 pt-4>
              <p class="text-sm-left"><b>Formats: </b></p>
            </v-flex>
            <v-flex xs6 style="margin-left:2%;">
              <v-autocomplete autocomplete :items="date_format_list" item-text="name" item-value="id"  v-model="selectedFormat" style="margin-left:8%;" @input="changeValue" hide-details></v-autocomplete>
            </v-flex>
            <v-flex xs4 style="text-align:left;margin-left:2%;">
                  <label style="margin-top:15%;">Example: </label>{{item}}
                </v-flex>
          </v-layout>

          <v-layout row wrap v-if="showpolicies">
            <v-flex xs1 style="margin-left:2%;">
              <v-radio-group row v-model="v_type" @change="resetValue" hide-details>
                <v-radio class="radioClass" :color="checkboxColor" label="Policy:" value="Policy"></v-radio>
              </v-radio-group>
            </v-flex>
            <v-flex xs6>
              <v-layout wrap>
                    <v-autocomplete clearable style="margin-left:12%;margin-right:1%;" v-model="selected_policy" :items="new_policy_list" item-text="new_policy_name" item-value="new_policy_name" :disabled="v_type=='Date'" return-object hide-details></v-autocomplete>
              </v-layout>
            </v-flex>
          </v-layout>

          <v-layout row wrap>
            <v-flex xs1 style="margin-left:2%;">
              <v-radio-group row v-model="v_type" @change="resetValue" hide-details>
                <v-radio class="radioClass" :color="checkboxColor" label="Date:" value="Date"></v-radio>
              </v-radio-group>
            </v-flex>
            <v-flex xs6 style="margin-left:5%;margin-right:1%;">
                  <v-menu ref="modal" :close-on-content-click="false"  v-model="modal" :nudge-right="40" lazy transition="scale-transition"
                  offset-y full-width max-width="290px" min-width="290px" :disabled="v_type=='Policy'">
                  <v-text-field slot="activator" v-model="dateFormatted" label="Date" hint="YYYY-MM-DD format"
                  persistent-hint prepend-icon="event" @blur="date = parseDate(dateFormatted)" :disabled="v_type=='Policy'" style="margin-right:12%;"></v-text-field>
                  <v-date-picker v-model="date" no-title @input="modal = false" :disabled="v_type=='Policy'"></v-date-picker>
                </v-menu>
            </v-flex>
          </v-layout>
      </v-card-text>
      <!-- <v-btn color="success" large block v-on:click="dateselection()" style="margin-bottom: 0px;">Submit</v-btn> -->
      <vc-button type="submit" itemText="Submit"></vc-button>
    </v-form>
  </v-card>  
  <!-- </v-container> -->
</template>
<script>
import { post as postToServer } from './../../methods/serverCall.js';
const cloneDeep = require('clone-deep');
import {GET_POLICY_DETAILS} from '../../data/url_constants.js'
import { get as getToServer } from './../../methods/serverCall.js';
import config from '../../config.json'
import moment from 'moment'
import _ from 'lodash'
import {CHECKBOX_COLOR} from '@/data/macros.js'
import vcButton from '@/views/button.vue'
export const DATE_TYPE_ARRAY = [{"name":'Database Date',"id":'YYYY-MM-DD'},{"name":'JDE Julian',"id": 'JUL'}, {"name":'CCYYMMDD',"id" : 'CCYYMMDD'}, {"name":'Century Only',"id": 'CC'}, {"name":'Year Only',"id": 'YY'}, {"name":'Month Only',"id":'MM'}, {"name":'YYDDD',"id": 'YYDDD'}];
export default {

  data () {
    return {
      checkboxColor:CHECKBOX_COLOR,
      v_type:"Policy",
      date_format_list: DATE_TYPE_ARRAY,
      item: "",
      modal: false,
      date: null,
      dateFormatted: null,
      selected_date: '',
      selected_policy:'',
      policy_value_list:[],
      data_to_pass:{},
      selectedFormat: 'YYYY-MM-DD',
      policy_sub_type:'Archival policy',
      new_policy_list:[]
    }
  },
  components:{'vc-button':vcButton},
  mounted() {
    var todays_date = moment(String(new Date()))
    this.item = todays_date.format(this.selectedFormat);
  },
  props:['dateformatobj','policies',"showpolicies","parentsteptype"],
  watch: {
    showpolicies(newvalue){
      if(!newvalue)
        this.v_type = "Date"
    },
    policies(newvalue){
      this.new_policy_list = []
      for (var i = 0; i <= newvalue.length - 1; i++) {
        if(this.parentsteptype!="purge"){
          var arc_policy = cloneDeep(newvalue[i])
          arc_policy["new_policy_name"] = arc_policy["bus_name"]+".Archival policy"
          arc_policy["policy_sub_type"] ="Archival policy"
          this.new_policy_list.push(arc_policy)
        }
        if(this.parentsteptype!="archival"){
          var ret_policy = cloneDeep(newvalue[i])
          ret_policy["new_policy_name"] = ret_policy["bus_name"]+".Retention policy"
          ret_policy["policy_sub_type"] ="Retention policy"
          this.new_policy_list.push(ret_policy)
        }
      }
    },
    date (val) {
      this.dateFormatted = this.formatDate(this.date)
    },
    dateformatobj(newvalue){
      this.selected_date=''
      this.selected_policy=''
      this.selectedFormat = 'YYYY-MM-DD'
      this.dateFormatted = ''
      if(newvalue){
        var data_to_pass = cloneDeep(newvalue)
        if(data_to_pass["format"]){
          this.selectedFormat=data_to_pass["format"]
          this.changeValue(data_to_pass["format"])
        }
        if(data_to_pass["is_policy"]){
          this.get_policy_details_by_name(data_to_pass["policy_name"],data_to_pass["policy_sub_type_name"])
      }
      else{
         this.dateFormatted = data_to_pass["actual_date"]
         this.selected_date = data_to_pass["value"]
        }
        if(!this.selected_date && this.showpolicies && !this.selected_policy && this.new_policy_list.length === 1)
          this.selected_policy = this.new_policy_list[0]
        //debugger;
        this.v_type = data_to_pass["policy_type"] ? data_to_pass["policy_type"]:'Policy';
        if(!this.showpolicies)
          this.v_type ="Date"
      }
    }
  },
  methods: {
    resetValue(){
      this.selected_policy = "";
    },
    get_policy_details_by_name(name,sub_type_name){
      this.selected_policy = _.find(this.new_policy_list,{"new_policy_name":name+"."+sub_type_name})
    },
    formatDate (date) {
      if (!date) return null
        return date
      //   const [year, month, day] = date.split('-')
      // return `${year}-${month}-${day}`
    },
    parseDate (date) {
      if (!date) return null

        const [month, day, year] = date.split('/')
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    },
    getString: function(dt_string) {
      var date = moment(String(new Date(dt_string)))
      return date.format('YYYY-MM-DD');
    },
    hideDateformatDlg(){
      this.$emit('close')
    },
    changeValue: function(newValue) {
      var todays_date = moment(String(new Date()))
      if(newValue == "CC"){
        var year = todays_date.year().toString().substr(0,2)
        this.item = parseInt(year);
      }else if(newValue == "CCYYMMDD"){
        var year = todays_date.year().toString().substr(0,2)
        var cc_value = parseInt(year);
        var formated_date = todays_date.format("YYMMDD");
        this.item = cc_value.toString()+formated_date
      }else if(newValue == ""){
        this.item = ''
      }else{
        this.item = todays_date.format(newValue);
      }
    },
    dateselection(){
      var format = this.selectedFormat
      var date = moment(this.dateFormatted)
      if(format == "CC"){
        var year = date.year().toString().substr(0,2)
        this.selected_date = parseInt(year);
      }else if(format == "CCYYMMDD"){
        var year = date.year().toString().substr(0,2)
        var cc_value = parseInt(year);
        var formated_date = date.format("YYMMDD");
        this.selected_date = cc_value.toString()+formated_date
      }else if(format == "" || format == null){
        this.selected_date = ''
      }else{
        this.selected_date = date.format(format);
      }
      var data_to_pass={}
      data_to_pass["format"] = this.selectedFormat
      if(this.selected_policy){
        data_to_pass["is_policy"] = true
        data_to_pass["policy_name"] = this.selected_policy.bus_name
        data_to_pass["value"] = this.selectedFormat + "["+this.selected_policy.new_policy_name +["]"]
        data_to_pass["policy_sub_type_name"] = this.selected_policy.policy_sub_type
        data_to_pass["bo_id"] = this.selected_policy.bus_id
        data_to_pass["bo_name"] = this.selected_policy.bus_name
      }
      else{
        data_to_pass["actual_date"] = this.dateFormatted
        data_to_pass["value"] = this.selected_date
      }
      data_to_pass["policy_type"] = this.v_type;
      this.$emit('submit-date',data_to_pass)

    },
  }
}
</script>
<style type="text/css">
.v-radio label{
  font-size: 15px;
}
.v-radio i{
  font-size: 20px;
}
</style>


