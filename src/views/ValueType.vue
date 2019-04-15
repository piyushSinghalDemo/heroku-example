<template>
    <v-card class="rounded-card">
        <v-toolbar dark dense>
            <v-flex class="text-md-center">Value Type
                <v-icon class="text-lg-left" @click="hideValueformatDlg" style="color:#dedede;height:22px;float:right">
                    fa-times-circle</v-icon>
            </v-flex>
        </v-toolbar>
        <v-card-text>
            <v-form ref="form" lazy-validation>
                <v-layout>
                    <v-flex xs3 style="min-height:263px;border-right: 02px dashed;">
                        <v-radio-group @change="resetValue" column v-model="v_type" style="margin-right: 20%;">
                            <v-radio class="radioClass" :color="checkboxColor" label="Value" value="Value"></v-radio>
                            <v-radio class="radioClass"
                                :disabled="columns_for_filter && columns_for_filter[criteriaRowIndex] && (columns_for_filter[criteriaRowIndex].operator == '_in_' || columns_for_filter[criteriaRowIndex].operator == '_n_in_')"
                                :color="checkboxColor" label="Column" value="Column"></v-radio>
                            <v-radio class="radioClass"
                                :disabled="columns_for_filter && columns_for_filter[criteriaRowIndex] && (columns_for_filter[criteriaRowIndex].operator == '_in_' || columns_for_filter[criteriaRowIndex].operator == '_n_in_')"
                                :color="checkboxColor" label="Date" value="Date"></v-radio>
                        </v-radio-group>
                    </v-flex>
                    <v-flex xs9>

                        <v-text-field
                            v-show="columns_for_filter && columns_for_filter[criteriaRowIndex] && 
                    columns_for_filter[criteriaRowIndex].operator !== '_in_' && columns_for_filter[criteriaRowIndex].operator !== '_n_in_'"
                            v-model="value" v-if="v_type === 'Value'" multiple placeholder="Value" solo
                            style="margin-top:16px;margin-left:5px;"></v-text-field>
                        <v-combobox multiple v-show="columns_for_filter && columns_for_filter[criteriaRowIndex] && 
                        (columns_for_filter[criteriaRowIndex].operator == '_in_' 
                        || columns_for_filter[criteriaRowIndex].operator == '_n_in_')" v-if="v_type === 'Value'"
                            v-model="select" label="Values" append-icon small-chips deletable-chips class="tag-input"
                            :search-input.sync="search" @keyup.tab="updateTags" @paste="updateTags">
                        </v-combobox>
                        <!-- <v-text-field v-model="value" v-if="v_type === 'Date'" @click="datePicker()" placeholder="Value"
                        solo></v-text-field> -->
                        <v-layout row wrap v-if="v_type === 'Date'" style="margin-top:16px">
                            <v-flex xs11 offset-xs1>
                                <v-autocomplete autocomplete :items="date_format_list" label="Formats" item-text="name"
                                    item-value="id" v-model="selectedFormat" persistent-hint :hint="item"
                                    style="width:95%" @input="changeValue"></v-autocomplete>
                                <v-layout row wrap style="margin:0px" v-if="showpolicies">
                                    <v-flex xs3 style="margin-left:2%;">
                                        <v-radio-group row v-model="dateType" @change="resetPolicyValue" hide-details>
                                            <v-radio class="radioClass" :color="checkboxColor" label="Policy:"
                                                value="Policy"></v-radio>
                                        </v-radio-group>
                                    </v-flex>
                                    <v-flex xs8>
                                        <v-layout wrap>
                                            <v-autocomplete clearable style="margin-left:12%;margin-right:1%;"
                                                v-model="selected_policy" :title="selected_policy.new_policy_name" :items="new_policy_list"
                                                item-text="new_policy_name" item-value="new_policy_name"
                                                :disabled="dateType=='Date'" return-object hide-details>
                                            </v-autocomplete>
                                        </v-layout>
                                    </v-flex>
                                </v-layout>
                                <v-layout row wrap style="margin:0px">
                                    <v-flex xs3 style="margin-left:2%;">
                                        <v-radio-group row v-model="dateType" @change="resetPolicyValue" hide-details>
                                            <v-radio class="radioClass" :color="checkboxColor" label="Date:"
                                                value="Date"></v-radio>
                                        </v-radio-group>
                                    </v-flex>
                                    <v-flex xs8 style="margin-left:5%;margin-right:1%;">
                                        <!-- <v-menu ref="modal" :close-on-content-click="false"  v-model="modal" :nudge-right="40" 
                                    lazy transition="scale-transition" :return-value.sync="dateFormatted"
                                offset-y full-width max-width="290px" min-width="290px" :disabled="dateType=='Policy'">
                                <v-text-field slot="activator" v-model="dateFormatted" label="Date" hint="YYYY-MM-DD format"
                                persistent-hint prepend-icon="event" :disabled="dateType=='Policy'" 
                                style="margin-right:12%;"></v-text-field>
                                <v-date-picker v-model="dateFormatted" no-title @input="modal = false" :disabled="dateType=='Policy'"></v-date-picker>
                                </v-menu> -->
                                        <calender :input="dateFormatted" :disabled="dateType=='Policy'"
                                            @update="setDate(...arguments)" style="width:90%"> </calender>
                                    </v-flex>
                                </v-layout>

                            </v-flex>

                        </v-layout>
                        <v-autocomplete v-if="v_type === 'Column'" label="Select Column" :items="column_name_list"
                            v-model="value" item-text="column_name" style="margin-top:5px;margin-left:5px;"></v-autocomplete>
                        <v-dialog persistent v-model="dateformat_dialog" width="600" height="500"
                            style="overflow-y:none">
                            <dateformat :dateformatobj='dateformatobj' @submit-date="getdate" :policies="policy_list"
                                @close="close_date_format_popup" :showpolicies="showpolicies"
                                :parentsteptype="parentsteptype"></dateformat>
                        </v-dialog>

                    </v-flex>
                </v-layout>
            </v-form>
        </v-card-text>
        <v-card-actions>
            <vc-button type="button" itemText="Save" @click.native="savedata()" style="position: absolute;
                                bottom: 7px;right: 25%;"></vc-button>
        </v-card-actions>
    </v-card>
</template>
<script>
import dateformat from '@/components/sqlDesigner/dateformat.vue'
import moment from 'moment'
import cloneDeep from 'lodash/cloneDeep'
import {CHECKBOX_COLOR} from '@/data/macros.js'
import vcButton from '@/views/button.vue'
import Calender from '@/views/calender'
import _ from 'lodash'
export const DATE_TYPE_ARRAY = [{"name":'Database Date',"id":'YYYY-MM-DD'},{"name":'JDE Julian',"id": 'JUL'}, {"name":'CCYYMMDD',"id" : 'CCYYMMDD'}, {"name":'Century Only',"id": 'CC'}, {"name":'Year Only',"id": 'YY'}, {"name":'Month Only',"id":'MM'}, {"name":'YYDDD',"id": 'YYDDD'}];
export default {
     data () {
        return {
            date: null,
            dateFormatted: null,
            modal: false,
            checkboxColor:CHECKBOX_COLOR,
            search: "", //sync search
            select:[],
            dateformat_dialog:false,
            value:"",
            selected_date: '',
            v_type:"Value",
            dateType:"Policy",
            date_format_list: DATE_TYPE_ARRAY,
            selectedFormat: 'YYYY-MM-DD',
            dateformatobj:{},
            item: "",
            new_policy_list:[],
            selected_policy:'',
        }
        },
        mounted(){
            this.v_type = "Value";
            var todays_date = moment(String(new Date()))
            this.item = todays_date.format(this.selectedFormat);
        },
        components:{dateformat, 'vc-button':vcButton,'calender':Calender,},
        props:{columns_for_filter: Array, column_name_list: Array, criteriaRowIndex: Number, 
                policy_list: Array, showpolicies: Boolean, currentKey: String, currentValueTypeKey: String,
                criteriaoperator:String,parentsteptype:String, valuetype:Boolean},

         watch: {
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
                    this.dateType = data_to_pass["policy_type"] ? data_to_pass["policy_type"]:'Policy';
                    if(!this.showpolicies)
                    this.dateType ="Date"
                }
            }, 
            policy_list(newvalue){
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
             columns_for_filter:{
                 handler(newVal, oldVal) {                  
                        if(newVal[this.criteriaRowIndex] && this.criteriaRowIndex >=0 && this.currentKey){
                            this.value = newVal[this.criteriaRowIndex][this.currentKey];
                            if(newVal[this.criteriaRowIndex].operator ==  '_in_' || newVal[this.criteriaRowIndex].operator ==  '_n_in_'){
                                 if(newVal[this.criteriaRowIndex] && newVal[this.criteriaRowIndex][this.currentValueTypeKey])
                                    this.v_type = newVal[this.criteriaRowIndex][this.currentValueTypeKey]

                                this.select = newVal[this.criteriaRowIndex][this.currentKey]
                            }
                        }
                    },
                    deep: true,
            },
            criteriaRowIndex(newVal){
                if(newVal >=0 && this.currentKey ){
                    if(this.columns_for_filter[this.criteriaRowIndex] && this.columns_for_filter[this.criteriaRowIndex][this.currentValueTypeKey])
                     this.v_type = this.columns_for_filter[this.criteriaRowIndex][this.currentValueTypeKey];
                    else
                     this.v_type = 'Value';

                     if(this.columns_for_filter[this.criteriaRowIndex].operator === '_in_' || this.columns_for_filter[this.criteriaRowIndex].operator === '_n_in_'){
                        this.select = this.columns_for_filter[this.criteriaRowIndex][this.currentKey];
                     }
                     else{
                        this.value = this.columns_for_filter[this.criteriaRowIndex][this.currentKey];
                     }
                }
            },
            valuetype(newVal){
                if(newVal && this.columns_for_filter[this.criteriaRowIndex] && this.columns_for_filter[this.criteriaRowIndex][this.currentValueTypeKey]){
                    this.v_type = this.columns_for_filter[this.criteriaRowIndex][this.currentValueTypeKey];
                }
                if(this.v_type == 'Date'){
                    this.setDateType();
                }
            },
            'currentKey'(newVal){
                 if(newVal && this.columns_for_filter[this.criteriaRowIndex])
                     this.value = this.columns_for_filter[this.criteriaRowIndex][newVal];
                    if(this.columns_for_filter[this.criteriaRowIndex].operator === '_in_' || this.columns_for_filter[this.criteriaRowIndex].operator === '_n_in_'){
                        this.select = this.columns_for_filter[this.criteriaRowIndex][newVal];
                     }
             },
             'currentValueTypeKey'(newVal){
                this.v_type = "Value"
                // debugger;
                 if(newVal && this.columns_for_filter[this.criteriaRowIndex] && this.columns_for_filter[this.criteriaRowIndex][newVal])
                    this.v_type = this.columns_for_filter[this.criteriaRowIndex][newVal];
             },
             'criteriaoperator'(newVal){
                if(newVal && this.columns_for_filter[this.criteriaRowIndex] && this.columns_for_filter[this.criteriaRowIndex][this.currentValueTypeKey])
                     this.v_type = this.columns_for_filter[this.criteriaRowIndex][this.currentValueTypeKey];
             }
         },       
         methods:{
             setDate(param){
                this.dateFormatted = param; 
                this.date = this.parseDate(this.dateFormatted);
            },
             parseDate (date) {
                if (!date) return null
                    // debugger;
                    const [month, day, year] = date.split('-')
                let data = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                return data;
            },
              resetPolicyValue(){
                this.selected_policy = "";
              },
              get_policy_details_by_name(name,sub_type_name){
                this.selected_policy = _.find(this.new_policy_list,{"new_policy_name":name+"."+sub_type_name})
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
              updateTags() {
                    this.$nextTick(() => {
                        if(this.search);
                        this.select.push(...this.search.split(","));
                        this.$nextTick(() => {
                        this.search = "";
                        });
                    });
                },
             resetValue(){
                 this.value = "";
                //  debugger;
                 if(this.v_type == 'Date')
                    this.datePicker();
             },
             close_date_format_popup(){
                this.dateformat_dialog = false
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
                    data_to_pass["policy_value"] = this.selected_policy.new_policy_name
                }
                else{
                    data_to_pass["actual_date"] = this.dateFormatted
                    data_to_pass["value"] = this.selected_date
                }
                data_to_pass["policy_type"] = this.dateType;
                // this.$emit('submit-date',data_to_pass)
                this.getdate(data_to_pass);
             },
             setPolicy(policy){
                 this.selected_policy = _.find(this.new_policy_list, ['new_policy_name',policy]);
             },
             setDateType(){
                 let index = this.criteriaRowIndex;
                 if(this.currentValueTypeKey == 'v_type1'){
                     this.dateType = this.columns_for_filter[index].datedetails1['policy_type'];
                     this.selectedFormat = this.columns_for_filter[index].datedetails1['format'];
                     this.changeValue(this.selectedFormat);
                     if(this.dateType == 'Policy'){
                         this.setPolicy(this.columns_for_filter[index].datedetails1['policy_value']);
                         this.dateFormatted ='';
                     }else{
                         this.selected_policy = '';
                         this.dateFormatted = this.columns_for_filter[index].datedetails1['actual_date'];
                     }   
                 }                       
                else if(this.currentValueTypeKey == 'v_type2'){
                    this.dateType = this.columns_for_filter[index].datedetails2['policy_type'];
                    this.selectedFormat = this.columns_for_filter[index].datedetails2['format'];   
                    if(this.dateType == 'Policy'){
                         this.setPolicy(this.columns_for_filter[index].datedetails2['policy_value']);
                         this.dateFormatted ='';
                     }else{
                         this.selected_policy = '';
                         this.dateFormatted = this.columns_for_filter[index].datedetails2['actual_date'];
                     }
                }                                
             },
             getdate(data){
                    let index = this.criteriaRowIndex;    
                    var date_data = cloneDeep(data);
                    // this.columns_for_filter[index].value = date_data["value"];
                    this.value = cloneDeep( date_data["value"]);
                    this.columns_for_filter[index][this.currentKey] = this.value
                    if(this.currentValueTypeKey == 'v_type1')
                        this.columns_for_filter[index].datedetails1 = date_data;
                    else if(this.currentValueTypeKey == 'v_type2')   
                        this.columns_for_filter[index].datedetails2 = date_data;
                    // this.savedata();
                    // this.dateformat_dialog = false
            },
             datePicker(){
                // this.filter_popup_index = idx
                //;
                if(this.currentValueTypeKey == 'v_type1'){
                    var date_details = this.columns_for_filter[this.criteriaRowIndex].datedetails1;
                }
                if(this.currentValueTypeKey == 'v_type2'){
                    var date_details = this.columns_for_filter[this.criteriaRowIndex].datedetails2;
                }
                if(date_details)
                    this.dateformatobj = cloneDeep(date_details);
                else
                    this.dateformatobj ={}
                // this.dateformat_dialog = true
             },
             hideValueformatDlg(){
                    this.$emit('close');
             },
             async savedata(){
                //  debugger;
                 if(this.v_type == 'Date')
                   await this.dateselection();

                if(this.columns_for_filter[this.criteriaRowIndex].operator !== '_in_' && this.columns_for_filter[this.criteriaRowIndex].operator !== '_n_in_'){
                    this.$emit('saveValue', this.value, this.columns_for_filter, this.v_type);
                }
                else{
                     this.updateTags()
                     this.$emit('saveValue', this.select, this.columns_for_filter, this.v_type);
                 }
                 this.hideValueformatDlg();
             }
         }
}
</script>

<style>
.tag-input span.v-chip {
  background-color: #1976d2;
  color: #fff;
}
</style>
