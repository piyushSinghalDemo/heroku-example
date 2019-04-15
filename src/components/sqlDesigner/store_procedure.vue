<template>
  <v-flex id="mainflex">
    <v-card class="rounded-card">
      <!-- <div style="text-align: left;margin-left:1%;margin-right:1%">
        <span style="color:rgba(0,0,0,0.54);font-weight:400;font-size:13px;"> Home /</span> &nbsp;<span style="color:rgba(0,0,0,0.54);font-weight:400;font-size:13px;">Process Designer /</span>&nbsp;
        <span style="color:rgba(0,0,0,0.54);font-weight:400;font-size:13px;">{{storedproceduredigramobj.diagram_name}} /</span>&nbsp;<span style="font-weight:400;font-size:15px;"><input type="text" v-model="stepname" readonly/></span> 
        <span style="font-weight:400;font-size:13px;margin-left:5px;" v-bind:class="{errorcls:is_error_occured , successcls:!is_error_occured}">{{'('+savedstatus + ')'}}</span>
        <span style="font-weight:400;font-size:13px;margin-left:5px;" :style="{'color': colorCode}">{{datasource_error}}</span> 
        <v-icon style="font-size:20px;float:right;" @click="savedata(true)" title='close'>far fa-times-circle</v-icon>
        <span style="font-size:13px;float:right;color:rgba(0,0,255,1)" @click="validatestepdata()"><input type="button" value="Validate"/></span>
      </div> -->
      <v-layout row wrap pr-4 mb-2  class="breadcrumbBackground">
          <v-flex xs9 pl-4 style="text-align:left;margin:auto">
            <ul class="breadcrumb" style="display:inline-flex;">
              <li><a @click="savedata(true)">{{env_name}} </a></li>
              <li><a @click="savedata(true)"> {{storedproceduredigramobj.diagram_name}} </a></li>
              <li><input type="text" v-model="stepname" readonly/></li>
            </ul>
            <span style="font-weight:400;font-size:13px;margin-left:5px;" v-bind:class="{errorcls:is_error_occured , successcls:!is_error_occured}">{{'('+savedstatus + ')'}}</span>
          <span style="font-weight:400;font-size:13px;margin-left:5px;" :style="{'color': colorCode}">{{datasource_error}}</span> 
          </v-flex>
          <v-flex xs3>
            <v-icon style="font-size:20px;float:right;" @click="savedata(true)" title='close'>far fa-times-circle</v-icon>
            <span style="font-size:13px;float:right;{'color': colorCode};margin-right:5px;">
         <v-progress-circular :width="3" v-if="validateProgress" :size="30" color="blue" indeterminate></v-progress-circular>
          <showerrorlisttemplate :validation_response="validation_response" stepType="Procedure"
            @set-error="setError" :showprocess="validateProgress ? 'Y':'N'"></showerrorlisttemplate></span>
            <span class="v-align" style="font-size:13px;float:right;{'color': colorCode}" @click="validatestepdata()">
         <input type="button" value="Validate"/>
        </span>
          </v-flex>
		  </v-layout>
      <div style="width:99%;margin-left:7px; margin-top: 10px;">
        <div id="table_list_panel" class="upperrow" style="width:25%;overflow: hidden;" ref="table_list_panel_ref">
          <div style="height:90%;overflow:auto;">
            <v-flex pa-4>
              <v-autocomplete placeholder="Select Procedure Name" :items="store_procedure_list" @change="addParamsRow"
               v-model="procedure_name" :loading="loading" cache-items :search-input.sync="search" hide-no-data></v-autocomplete>               
            </v-flex>
            <v-flex  pa-4>
              <v-checkbox color="red" label="Run On Target ?" v-model="run_on_target"
              class="customCheckbox" @change="savedata()">
            </v-checkbox>
            </v-flex>
          </div>
        </div>
        <div id="selection_panel" class="upperrow" style="width:75%;" ref="selection_panel_ref"> 
          <h5 style="margin-top:-10px;margin-left:5px;z-index:222;position:absolute;background:white;" >Stored Procedure Parameters</h5>
          <span style="float:right;margin-top:-23px;margin-left:19%;position:absolute;background:white;">
          </span>
          <table v-if="params_row_list" border="0" class="table table-striped table-bordered" id="param_table" style="margin-top: 3%;margin-left: 1%;">
            <thead>
              <tr>
                <th>Parameter Name</th>
                <th>Type</th>
                <th>Input/Output</th>
                <th>Value Type</th>
                <th>Value</th>
              </tr>
            </thead>
            <tr v-for="(item, idx) in params_row_list">
              <td class="text-xs-left" v-model="item.Parameter_name">{{item.Parameter_name}}</td>
              <td class="text-xs-left" v-model="item.Type">{{item.Type}}</td>
              <td class="text-xs-left" v-model="item.Is_output">{{item.Is_output}}</td>
              <td>
                <toggle-button @change="open_env_variable_dialog(idx, item.is_env_value)" 
                v-if="item.Type != 'date'" :labels="{checked: 'env_var', unchecked: 'value'}" :value="item.is_env_value" v-model="item.is_env_value" :sync="true" :width="80"/>
              </td>
              <td class="text-xs-left" v-model="item.has_default_value">

                <v-tooltip bottom>
                  <input slot="activator" type="number" pattern="/^-?\d+\.?\d*$/" onKeyPress="if(this.value.length==4) return false;" v-if="item.Type === 'int' && (item.is_env_value === false ||  !item.is_env_value)" v-model="item.value" :rules="[v => item.has_default_value || !!v || 'Value is required']" class="form-control" placeholder="Value"/>
                  <input slot="activator" type="text" v-if="item.Type === 'varchar'  && (item.is_env_value === false ||  !item.is_env_value)" :maxlength="item.Length" name="title" v-model="item.value" :rules="[v => item.has_default_value || !!v || 'Value is required']" required="required" class="form-control" placeholder="Value">

                  <input slot="activator" v-if="item.Type != 'varchar' && item.Type != 'int' && item.Type != 'date' && (item.is_env_value === false ||  !item.is_env_value)" :maxlength="item.Length" class="form-control" v-model="item.value" placeholder="Value"/>

                  <span>Value must be less than {{item.Length}} characters</span>
                </v-tooltip>
                <input slot="activator" v-if="item.Type === 'int' && item.is_env_value === true" class="form-control" v-model="item.value" placeholder="Value" readonly="readonly" v-on:dblclick="getEnvVariableData(idx)" />

                <input slot="activator" v-if="item.Type === 'varchar' && item.is_env_value === true" class="form-control" v-model="item.value" placeholder="Value" readonly="readonly" v-on:dblclick="getEnvVariableData(idx)"/>

                <input slot="activator" v-if="item.Type != 'varchar' && item.Type != 'int' && item.is_env_value === true" class="form-control" v-model="item.value" placeholder="Value" readonly="readonly" v-on:dblclick="getEnvVariableData(idx)"/>

                <input v-model="item.value" v-if="item.Type === 'date' && (item.is_env_value === false ||  !item.is_env_value)" @click="datePicker(idx)" placeholder="Value" class="form-control"/>

                <input slot="activator" v-if="item.Type === 'date' && item.is_env_value === true" class="form-control" v-model="item.value" placeholder="Value" readonly="readonly" v-on:dblclick="getEnvVariableData(idx)"/>
                <v-dialog v-if="item.Type === 'date'" v-model="dateformat_dialog" width="600" height="500" style="overflow-y:none">
                  <dateformat :dateformatobj='dateformatobj' @submit-date="getdate(idx, ...arguments)" @close="close_date_format_popup"></dateformat>
                </v-dialog>
              </td>
            </tr>
          </table>
        </div>   
      </div>      
    </v-card>
    <v-dialog v-model="env_var_dialog" id="env_var_dialog" width="600" persistent>
      <v-flex>
        <v-card class="rounded-card">
          <v-toolbar dark dense>
           <v-flex class="text-md-left">Environment Variables</v-flex>
           <v-spacer></v-spacer>
           <v-icon @click="cancelDialog" style="cursor:pointer">close</v-icon>
         </v-toolbar>
         <!-- <v-container grid-list-md align-content-space-around> -->
           <v-form ref="form" v-model="valid" lazy-validation>
            <v-container grid-list-md align-content-space-around>
              <v-layout raw wrap>
                <v-flex pl-5>
                  <v-radio-group v-model="variable" @change="showTempTablesValue" column > 
                    <v-radio label="Process id" value="process_id"></v-radio>
                    <v-radio label="Mode" value="mode"></v-radio>
                    <v-radio label="Temp table name" value="temp_table_name"></v-radio>
                  </v-radio-group>
                  <v-autocomplete v-if="show_temp_table_list === true || temp_table != ''" placeholder="Select Temp Table Name" 
                   :items="cells_name_list"  :rules="tempTableRules" v-model="temp_table" required></v-autocomplete>
                </v-flex>
              </v-layout>
              <v-btn color="success" large block v-on:click="close_env_dialog()" style="margin-bottom: 0px;">Submit</v-btn>
            </v-container>
          </v-form>
        </v-card>
      </v-flex>
    </v-dialog>
  </v-flex>        
</template>
<script>
const joint = require('jointjs')
const cloneDeep = require('clone-deep');
import {COLOR_CODE} from '@/data/macros.js'
import moment from 'moment'
import {getStoredProcedureList, getStoredProcedureDetails} from "../../methods/agent_api_call.js"
import dateformat from './dateformat.vue'
import {validate_process_def_json} from "../../methods/call_validation.js"
import showerrorlisttemplate from './showerrorlisttemplate.vue'
  import {VALIDATION_IN_RPOCESS_MESSAGE} from '../../methods/flowcharts/constants.js'
export default {
  components:{
    dateformat,
    showerrorlisttemplate,
  },
  data () {
    return {
      colorCode:COLOR_CODE,
      search: null,
      valid: true,
      loading:false,
      run_on_target:false,
      editable: true,
      tempTableRules:[
        v => !!v || 'Temp Table is required',
      ],
      // search: '',
        // stepname:this.storedproceduredigramobj.cell_name,
        stepname: '',
        selection_graph: new joint.dia.Graph,
        params_row_list: [],
        store_procedure_list: [],
        default_store_procedure_list: [],
        table_list:[],
        connection_str:"",
        schema:"",
        dateformat_dialog: false,
        procedure_name: '',
        validateProgress:false,
        add_row_func: true,
        procedure_param_dict:{},
        env_id: '',
        cells_name_list: '',
        env_var_dialog: false,
        variable: 'process_id',
        temp_table: '',
        show_temp_table_list: false,
        value_index: '',
        cell_id: '',  
        filter_popup_index:'',
        dateformatobj:{},
        savedstatus:'edited',
        is_error_occured:false,
        datasource_error:'',
        env_name: this.$session.get('selected_env').name,
        validation_response:{},
      }
    },
    props:['storedproceduredigramobj','savedatastatus','iserroroccured','datasourceerror'],
    watch: {
      search (val) {
        val && val !== this.procedure_name && this.querySelections(val)
      },
      datasourceerror(newvalue){
      this.datasource_error =newvalue
    },
       savedatastatus(newvalue,oldvalue){
      this.savedstatus = newvalue
      },
      iserroroccured(newvalue,oldvalue){
        this.is_error_occured =newvalue
      },
      setError(errorList){
      let _this = this;
      // _this.Remove_Error_List();
      // _this.Perform_Validation(errorList);
    },
      storedproceduredigramobj(newvalue,o){
        this.validation_response ={}
        //Code to bind error message if user perform validation at flowchart level
        var flowchart_errors = this.$store.state.errorList
        if(flowchart_errors && flowchart_errors[newvalue.stepId]){
            this.validation_response = flowchart_errors[newvalue.stepId];
          }

        console.log(newvalue)
          this.stepname = newvalue.cell_name

          if(newvalue.cell_id){
            this.cell_id = newvalue.cell_id
          }else{
            this.cell_id = ''
          }
          if(newvalue.cells_name_list){
            this.cells_name_list = newvalue.cells_name_list
          }else{
            this.cells_name_list = []
          }
          if(newvalue.tables_detail){
            this.store_procedure_list = newvalue.tables_detail.store_procedure_list
            this.default_store_procedure_list = newvalue.tables_detail.default_store_procedure_list
            this.schema= newvalue.tables_detail.schema
            this.default_table_list = newvalue.tables_detail.default_table_list
          }else{
            this.store_procedure_list = []
            this.default_store_procedure_list = []
            schema = []
            default_table_list: []
          }
          if (newvalue.env_id){
            this.env_id = newvalue.env_id
          }else{
            this.env_id = 0
          }
          if(newvalue.step_data && newvalue.step_data.name){
            this.add_row_func = false
            var step_name = newvalue.step_data.name.replace(' ', '');
            var cell_id = this.cell_id
            if(cell_id && !(cell_id in this.procedure_param_dict)){
              this.procedure_param_dict[cell_id] = []
              this.procedure_param_dict[cell_id].push({'procedure_name': newvalue.step_data.procedure_name, 'params_list': newvalue.step_data.params})
            }
            if(newvalue.step_data.procedure_name){
              this.stepname = newvalue.step_data.procedure_name
              this.procedure_name = newvalue.step_data.procedure_name
            }
            else{
              this.stepname = 'Procedure'
              this.procedure_name = ''
            }
            if(newvalue.step_data.params){
              this.params_row_list = newvalue.step_data.params

            }else{
              this.params_row_list = []
            }
            if(newvalue.step_data.run_on_target)
              this.run_on_target = newvalue.step_data.run_on_target
          }
          else{
            this.params_row_list = []
            // this.stepname = ''
            this.procedure_name = ''
          }
        },
        stepname(newvalue){
          if(newvalue === '')
            this.stepname = 'Procedure'
          this.savedata(false)
        },
        params_row_list(newvalue){
          this.savedata()
        },
        run_on_target(newvalue){
          this.savedata(false)
        }
      },
      mounted() {
        let _this = this

      },
      computed: {
        listString() {
          return JSON.stringify(this.list, null, 2);
        },
      },
      methods:{
        cancelDialog(){
          this.params_row_list[this.value_index].is_env_value = false;
          this.env_var_dialog = false;
        },
        querySelections (v) {
            this.loading = true
            this.getProcedureList(v);
        },
        getProcedureList(procedure_search_string){
          var _this = this
          getStoredProcedureList(_this, _this.env_id, procedure_search_string).then(tableResponse =>{
            const latest_store_procedure_list = tableResponse.result.map(x => x.trim());
            _this.store_procedure_list = latest_store_procedure_list
            _this.loading = false;
          }).catch(errorResponse => {});
        },
        close_env_dialog(){
          /* if(this.variable == 'temp_table_name' && !this.temp_table){
            this.$toasted.error("Select any Temp table name");
          } */
          if (this.$refs.form.validate()) {
            if(this.variable == 'temp_table_name'){
              this.params_row_list[this.value_index].value = this.temp_table
            }else{
              this.params_row_list[this.value_index].value = this.variable
            }
            this.env_var_dialog = false
            this.temp_table = ''
            this.variable = 'process_id'
            this.show_temp_table_list = false
          }
        },
        getEnvVariableData(index){
          this.value_index = index
          this.env_var_dialog = true
          var var_name = this.params_row_list[index].value
          if(var_name == 'process_id' || var_name == 'mode'){
            this.variable = this.params_row_list[index].value
            this.show_temp_table_list = false
            this.temp_table = ''
          }else{
            this.variable = 'temp_table_name'
            this.temp_table = this.params_row_list[index].value
          }
        },
        open_env_variable_dialog(index, value){
          if(this.params_row_list[index].is_env_value){
            this.temp_table = ''
            this.variable = 'process_id'
            this.show_temp_table_list = false;
            this.env_var_dialog = true;
            this.value_index = index
            this.params_row_list[index]['value'] = ''
          }else{
            this.params_row_list[index].value = ''
          }
        },
        showTempTablesValue(e){
          if(e == 'temp_table_name'){
            this.show_temp_table_list = true
          }else{
            this.show_temp_table_list = false
          }
        },
        addParamsRow(event){
          var _self = this
          var step_name = _self.stepname.replace(' ', '');
          var cell_id = _self.cell_id
          var procedure_name = event.trim()
          this.stepname = procedure_name
          if(_self.procedure_param_dict && cell_id in _self.procedure_param_dict){
            let isProcedureNameExists = _self.procedure_param_dict[cell_id].map(a=>a.procedure_name).includes(procedure_name)
            if(isProcedureNameExists){
              for (var i = 0; i < _self.procedure_param_dict[cell_id].length; i++) {
                if(_self.procedure_param_dict[cell_id][i].procedure_name == procedure_name){
                 _self.params_row_list = _self.procedure_param_dict[cell_id][i].params_list
                 break;
               }
             }
           }else{
            getStoredProcedureDetails(_self, procedure_name, _self.env_id).then(tableColumnResponse=> {
              _self.params_row_list = tableColumnResponse.result;
              if(!_self.procedure_param_dict[cell_id]){
                _self.procedure_param_dict[cell_id] = []
              }
              _self.procedure_param_dict[cell_id].push({'procedure_name': procedure_name, 'params_list': tableColumnResponse.result})
            }).catch();
          }
        }else{
          getStoredProcedureDetails(_self, procedure_name, _self.env_id).then(tableColumnResponse=> {
            _self.params_row_list = tableColumnResponse.result;
            if(!_self.procedure_param_dict[cell_id]){
              _self.procedure_param_dict[cell_id] = []
            }
            _self.procedure_param_dict[cell_id].push({'procedure_name': procedure_name, 'params_list': tableColumnResponse.result})
          }).catch();
        }
      },
      datePicker(idx){
        this.filter_popup_index = idx
        var date_details = this.params_row_list[idx].datedetails
        if(date_details)
          this.dateformatobj = cloneDeep(date_details)
        else
          this.dateformatobj ={}
        this.dateformat_dialog = true
      },
      getdate(index,data){
        index = this.filter_popup_index
        var date_data = cloneDeep(data)
        this.params_row_list[index].value = date_data["value"]
        this.params_row_list[index].datedetails = date_data
        this.dateformat_dialog = false
      },
      getdata(){
        var _this =this
        this.is_error_occured =false
        var data = {'stepname':_this.stepname,
        'step_data':{'name': _this.stepname, 'procedure_name': _this.procedure_name,  'params':this.params_row_list,"run_on_target":this.run_on_target}
      }
      return data
    },
    setError(){

    },
    savedata(is_close){
      this.env_name = this.$session.get('selected_env').name
      let _this = this
      this.savedstatus = "edited"
      console.log(_this.selection_graph.toJSON())
      var data = this.getdata()
      console.log("data",data)
      _this.$emit('update-object',data,is_close)
    },
    
    close_date_format_popup(){
    this.dateformat_dialog = false
  },
    validatestepdata(){

      var _this = this
      if(_this.validateProgress){
          alert(VALIDATION_IN_RPOCESS_MESSAGE)
          return false
        }
      _this.validateProgress=true;
      var data = this.getdata()
      data['step_type'] ='Procedure'
      data['env_id'] = this.env_id
      data['steps_details'] = this.cells_name_list

        // this.$toasted.error('No Procedure Name found');
      validate_process_def_json(this, data).then(validation_response => {
        _this.validateProgress=false;
        this.validation_response = validation_response ;
         this.$store.state.errorList[this.storedproceduredigramobj.stepId] = validation_response
      },error=>{
         _this.validateProgress = false;
       })
    },
  }
}
</script>
<style scoped>
.customCheckbox >>> label{
  top: 5px !important;
}
.vue-js-switch {
  margin-top: 7px;
}
.container .v-input{
  width: 50%;
}
.v-switch-core{

}
.v-autocomplete.v-input{
  margin:0px;
}
.upperrow{
  display:inline-block;
  height:400px;
  overflow: auto;
  border:1px solid grey;
}

.lowerrow{
  display:block;
  height:200px;
  overflow: auto;
  /* border:1px solid grey; */

}

#mainflex{
  background-color:grey;
}

.list_items {
  height:30px;
}
table.v-table thead tr, table.v-table tbody tr{
  height: 38px;
}
.sticky {
  position: absolute;
}
#param_table .v-select__slot{
  margin-bottom: -6px;
}
#param_table td{
  font-size: 13px;
}
#param_table .v-input__slot{
  font-size: 14px;
  margin-bottom: -8px;
  margin-top: -5px;
}
#param_table .v-input__append-inner i{
  font-size: 15px;
}
#param_table .v-text-field{
  margin-bottom: -15px;
}
#param_table .v-text-field__slot{
  width: 65px;
}
#param_table .v-text-field__slot{
  margin-top: -5px;
}
.v-radio label{
  font-size: 15px;
}
.v-radio i{
  font-size: 20px;
}
.v-dialog__activator{
  margin-top: -10px;
}
.v-messages__message{
  margin-top: 11px;
}
</style>