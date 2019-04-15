<template>
    <v-flex xs12 id="criteria_output_panel" class="lowerrow" style="overflow:auto;">
                <!-- {{columns_for_filter}} -->
        <table border="0" class="table table-striped table-bordered table-fixed" 
            id="filter_column_table" style="table-layout:fixed">
            <thead>
                <tr>
                    <th style="width:30px"></th>
                    <th style="width:70px">(</th>
                    <th style="width:125px" v-if="filtertablename && filtertablename.length <=15">{{filtertablename || 'Column name'}}</th>
                     <th style="width:125px" :title="filtertablename" v-else>{{getFilterTableName(filtertablename) || 'Column name'}}</th>
                    <th style="width:90px">Operator</th>
                    <th style="width:150px"><span v-if="isBetween">From Value</span><span v-else> Value</span></th>
                    <th style="width:150px" v-if="isBetween">To Value</th>
                    <th style="width:70px">)</th>
                    <th style="width:90px">Operation</th>
                    <th style="width:90px">Action</th>
                </tr>
                </thead>
                <draggable v-model="columns_for_filter" :element="'tbody'">
                <tr v-for="(filter_c, idx) in columns_for_filter" :key="idx">
                    <td class="handle" style="max-width: 30px;">::</td>
                    <td >
                        <v-autocomplete :items="start_parentheses_list" v-model="filter_c.s_parentheses" hide-details
                            item-text="value" placeholder="Parentheses" style="padding:0px" @change="savedata()" clearable hide-details></v-autocomplete>
                    </td>
                    <td :class="{highlight_tbl:filter_c.error_list && filter_c.error_list.column_name}" :title="filter_c.error_list && filter_c.error_list.column_name">
                        <v-autocomplete :items="column_name_list" v-model="filter_c.column_name" item-text="column_name" style="padding:0px" :title="filter_c.column_name"
                            placeholder="Column name" @change="resetIsDrvTable(filter_c.column_name, idx)" hide-details></v-autocomplete>
                        <input type="hidden" v-model="filter_c.is_drv_table">
                    </td>
                    <td :class="{highlight_tbl:filter_c.error_list && filter_c.error_list.operator}" :title="filter_c.error_list && filter_c.error_list.operator">
                        <v-autocomplete :items="filter_operators" item-text="name" item-value="id" v-model="filter_c.operator"
                            @change="findBetween(filter_c)" placeholder="Operator" style="padding:0px" hide-details></v-autocomplete>
                    </td>
                    <td>
                        <v-layout row>
                            <v-flex xs10 pl-3>
                                <v-text-field v-model="filter_c.value1" :disabled="filter_c.operator == '_in_' || filter_c.operator == '_is_n_'  
                                    || filter_c.operator == '_is_nt_n_' || filter_c.operator == '_n_in_'" 
                                    placeholder="Value" @blur="savedata()" solo hide-details></v-text-field>
                            </v-flex>
                            <v-flex xs2>
                                <span @click="changeValueType(idx, 'value1', 'v_type1',filter_c.operator)" class="valueType"><i class="fa fa-edit"></i></span>
                            </v-flex>
                        </v-layout>
                    </td>
                    <td v-if="isBetween">
                        <v-layout row v-if="filter_c.operator == '_bet_'">
                            <v-flex xs10 pl-3>
                                <v-text-field v-model="filter_c.value2" placeholder="Value"
                                    @blur="savedata()" :disabled="filter_c.v_type2 !== 'Value'" solo hide-details></v-text-field>
                            </v-flex>
                            <v-flex xs2>
                                <span @click="changeValueType(idx, 'value2', 'v_type2',filter_c.operator)" class="valueType"><i class="fa fa-edit"></i></span>
                            </v-flex>
                        </v-layout>
                    </td>
                    <td id="value_data">
                        <v-autocomplete :items="end_parentheses_list" v-model="filter_c.e_parentheses" hide-details
                            placeholder="Parentheses" style="padding:0px" @change="savedata()" clearable></v-autocomplete>
                    </td>
                    <td>
                        <toggle-button v-if="columns_for_filter.length-1 != idx" :labels="{checked: 'OR', unchecked: 'AND'}"
                            style="margin-top:12%" v-model="filter_c.operation" :sync="true" :width="60" :color="{checked: '#75C791', unchecked: '#75C791', disabled: '#CCCCCC'}"
                            @change="savedata()" />
                    </td>
                    <td>
                        <v-icon @click="add_new_filter_row()" v-if="(idx+1) == columns_for_filter.length" style="color:#494949; margin-right: 10px;font-size:20px;margin-top:8px;" title="Add New Filter">fa-plus-square</v-icon>
                        <v-icon @click="delete_filter_row(idx)" style="color:#494949;font-size:20px;margin-top:8px;" title="Delete Filter">fa-trash-alt</v-icon>
                    </td>
                </tr>
                </draggable>
        </table>
        <v-dialog persistent v-model="valuetype" width="400" style="overflow-y:none;background:white">
            <value-type @close="closeValuePanel" :valuetype="valuetype" @saveValue="saveValue" 
               :columns_for_filter="columns_for_filter" :criteriaRowIndex="criteriaRowIndex" :policy_list="policy_list" 
               :showpolicies="showpolicies" :column_name_list="column_name_list" :currentKey="currentKey" 
               :currentValueTypeKey="currentValueTypeKey" :criteriaoperator='currentOperator' :parentsteptype="parentsteptype"></value-type>
        </v-dialog>
    </v-flex>
</template>
<script>
import ValueType from './ValueType'
import {JOIN_OPERATOR_ARRAY_JSON,JOIN_TYPE,AGGREGATE_FUNCTIONS, FLITER_JOIN_OPERATOR_ARRAY_JSON,GRAPH_TABLE_ERROR_MESSAGES} from '@/methods/flowcharts/constants.js'
import draggable from 'vuedraggable'
export default {
      data () {
        return {
            v_type:"Value",
            criteriaRowIndex:0,
            currentKey:'',
            currentValueTypeKey:'',
            currentOperator:'',
            valuetype:false,
            start_parentheses_list: [{'value':'('}, {'value':'(('}, {'value':'((('}, {'value':'(((('}],
            end_parentheses_list: [')', '))', ')))', '))))'],
            filter_operators:FLITER_JOIN_OPERATOR_ARRAY_JSON,
            isBetween:false,
        }
      },
      components:{
          'value-type':ValueType,
          draggable
      },
     props:{filtertablename:String,columns_for_filter: Array, column_name_list: Array, policy_list: Array, showpolicies: Boolean,parentsteptype:String},
          watch:{
              columns_for_filter:{
                  handler(newVal){
                    //   debugger;
                      this.findBetween();
                  },
                  deep:true
              },
              column_name_list:{
                handler(newVal){
                    //   debugger;
                      this.column_name_list=newVal
                  },
                  deep:true
              }
          },
     methods:{
         closeValuePanel(){
             this.valuetype = false;
         },
         saveValue(value, columns_for_filter, v_type){
            //  debugger;
             this.v_type = v_type;  
             this.columns_for_filter = columns_for_filter;
             this.columns_for_filter[this.criteriaRowIndex][this.currentKey] = value;
             this.columns_for_filter[this.criteriaRowIndex][this.currentValueTypeKey] = v_type;
             this.savedata();
         },
         changeValueType(index, key, v_type_Key,operator){
             this.valuetype = true;
             // this.currentValueTypeKey = "Value"
             this.criteriaRowIndex = index;
             this.currentKey = key;
             this.currentValueTypeKey = v_type_Key;
             this.currentOperator = operator
         },
         resetIsDrvTable(c_name, idx){
            for(var i=0;i< this.column_name_list.length;i++){
                if(this.column_name_list[i][c_name]){
                this.columns_for_filter[idx].is_drv_table = this.column_name_list[i][c_name]
                break;
                }else{
                this.columns_for_filter[idx].is_drv_table = false
                }
            }
            this.savedata()
        },
        findBetween(obj){
            let _this = this;
            _this.isBetween = false;
            _this.columns_for_filter && _this.columns_for_filter.map(obj=>{
                if(obj.operator == '_bet_') 
                _this.isBetween = true;
            });
            if(obj){
               // obj.value1 = "";
               // obj.value2 = "";
            }
            this.savedata();
        },
        add_new_filter_row(){
             this.$emit('new');
        },
        delete_filter_row(idx){
            this.$emit('delete', idx);
        },
        savedata(){
            // If user perform filter columns up down then its create an bug.
            // Bug is that operation key doesnot work with drag drop. its values not get change
            // delete operation key from last filter
            var last_index = this.columns_for_filter.length
            if(last_index>0){
              delete this.columns_for_filter[last_index-1].operation
            }
            // Asign operation key to all filter who has not operation key
            // -2 because we are not going to append operation for last one
            for (var i = last_index - 2; i >= 0; i--) {
              if(!this.columns_for_filter[i].operation)
                this.columns_for_filter[i]["operation"] = false
            }
            this.$emit('savedata',this.columns_for_filter);
        },
        getFilterTableName(filtertablename)
        {
          if (!filtertablename)
            return false
          return filtertablename.substring(0,12) + '...'
        },
    }
}
</script>
