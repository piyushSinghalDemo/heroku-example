<template>
  <div class="text-xs-center" v-if="showchip">
    <v-menu v-model="menu" :close-on-content-click="false" :nudge-width="400" offset-x left :absolute="true">
        <v-chip small slot="activator" :color="chipcolor">{{totalCount}}</v-chip>
      <v-card>
        <v-toolbar color="#262525;" dark>
          <v-icon color="red">warning</v-icon>
          <v-toolbar-title>Errors</v-toolbar-title>
        </v-toolbar>
        <v-list>
          <v-checkbox @change="showErrorMessage('all', highlightAll)" v-model="highlightAll" color="red" 
            label="Highlight All" class="customCheckbox"> </v-checkbox>
          <table border="0" class="table table-striped table-bordered table-fixed">
            <thead>
              <tr>
                <th> Type </th>
                <th> Message </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in inputResponse" :key="index">
                <td style="cursor:pointer" v-if="item.type === 'graph'"> Orphan Table/Link Without Join</td>
                <td style="cursor:pointer" v-else>{{item.type}}</td>                
                <td style="cursor:pointer;padding:0px">
                  <table border="0" class="table table-striped table-bordered table-fixed" style="margin:0px">
                    <tr v-for="(row, key) in item.rowArray" :key="key">
                      <td><v-checkbox @change="showErrorMessage(item.type, row.isChecked, row)" v-model="row.isChecked" color="red" 
                          :label="row.message" class="customCheckbox"> </v-checkbox></td>
                    </tr>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </v-list>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn :color="outlineColor" @click="menu = false" outline style="border-radius:10px">
            Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>
  </div>
</template>
<script>
import _ from 'lodash'
import { BTN_COLOR} from '../../data/macros.js'
  export default {
    data: () => ({
      outlineColor:BTN_COLOR,
      totalCount:0,
      highlightAll:false,
      showchip:true,
      fav: true,
      menu: false,
      message: false,
      hints: true,
      items: [],
      inputResponse:[],
      errorList:{step_data:{}},
      chipcolor:'green',
      def:{
        'Selection':{
          'filter':"setFilterSelError",
          'selection':"setFilterSelError",
          'graph':"setGraphError",
          'join':"setJoinError"
        },
        'Merge':{
          'selection':"setMergeStepSelectionError",
          'filter':"setMergeStepCriteriaError"
        },
        'Minus':{
          'selection':"setMergeStepSelectionError",
          'filter':"setMergeStepCriteriaError"
        },
        "Archival":{
          'filter':"setArchivalStepCriteriaError"
        }
      }
    }),
    props:{
      validation_response: Object,
      stepType: String,
      errorListCount:Number,
      showprocess:String,
    },
    watch:{
      errorListCount(newVal){

      },
      validation_response:{
        handler(newVal){
          // debugger;
          this.totalCount =0
          this.chipcolor ='green'
          if(_.isObject(newVal) && !_.isEmpty(newVal))
            this.setInputResponse(newVal.step_data);
        },
        deep:true
      },
      showprocess(newVal){
        // alert(newVal)
        this.showchip = true ? newVal === 'N' || newVal === false :false
      }
    },
    methods:{
      /**
        @param key will represent 'all, selection, graph'
        @param value will represent that checkbox value true,false
        @param rowObj will represent row object of that module(selection, criteria, graph) 
       */
      showErrorMessage(key, value, rowObj){
        // debugger;
        if(key == 'all'){
          this.setAllError(value);
        }else{
          this[this.def[this.stepType][key]](key, value, rowObj);
        }
      },
      setMergeStepSelectionError(key, value, rowObj){
            if(value){
              this.errorList.step_data[key] = this.errorList.step_data[key] ? this.errorList.step_data[key]:{};
            this.errorList.step_data[key][rowObj.rowIndex] = this.errorList.step_data[key][rowObj.rowIndex] ? 
                                              this.errorList.step_data[key][rowObj.rowIndex]:{};
            this.errorList.step_data[key][rowObj.rowIndex][rowObj.column] = rowObj.message;             
            }else{
              this.errorList.step_data[key][rowObj.rowIndex][rowObj.column] = undefined; 
            }
             this.$emit('set-error',this.errorList); 
      },
      setMergeStepCriteriaError(key, value, rowObj){
        if(value){
            this.errorList.step_data[key] = this.errorList.step_data[key] ? this.errorList.step_data[key]:{};
            this.errorList.step_data[key][rowObj.table_name] = this.errorList.step_data[key][rowObj.table_name] ? 
                                              this.errorList.step_data[key][rowObj.table_name]:{};
            this.errorList.step_data[key][rowObj.table_name][rowObj.rowIndex] = this.errorList.step_data[key][rowObj.table_name][rowObj.rowIndex] ? 
                                              this.errorList.step_data[key][rowObj.table_name][rowObj.rowIndex]:{};
            this.errorList.step_data[key][rowObj.table_name][rowObj.rowIndex][rowObj.column] = this.errorList.step_data[key][rowObj.table_name][rowObj.rowIndex][rowObj.column] ? 
                                              this.errorList.step_data[key][rowObj.table_name][rowObj.rowIndex][rowObj.column]:[];                                                                      
            this.errorList.step_data[key][rowObj.table_name][rowObj.rowIndex][rowObj.column].push(rowObj.message);                                  
        }else{
            this.errorList.step_data[key][rowObj.table_name][rowObj.rowIndex][rowObj.column] = undefined;       
        }
         this.$emit('set-error',this.errorList);
      },
      setJoinError(key, value, rowObj){
        if(value){
         this.errorList.step_data[key] = this.errorList.step_data[key] ? this.errorList.step_data[key]:{};
         this.errorList.step_data[key][rowObj.rowIndex] = this.errorList.step_data[key][rowObj.rowIndex] ? 
                                              this.errorList.step_data[key][rowObj.rowIndex]:{};
            this.errorList.step_data[key][rowObj.rowIndex][rowObj.column] = this.errorList.step_data[key][rowObj.rowIndex][rowObj.column] ?
                                                                     this.errorList.step_data[key][rowObj.rowIndex][rowObj.column]:{};
            
            this.errorList.step_data[key][rowObj.rowIndex][rowObj.column]=
                  this.validation_response['step_data'][key][rowObj.rowIndex][rowObj.column];
            if(this.validation_response['step_data']['link'])
                this.errorList.step_data['link'] = this.validation_response['step_data']['link'];
            
        }else{
           this.errorList.step_data[key][rowObj.rowIndex][rowObj.column] =  undefined;
           this.errorList.step_data['link'] = undefined;
        }
        this.$emit('set-error',this.errorList);
      },
      setGraphError(key, value, rowObj){
        if(value){
          this.errorList.step_data[key] = this.errorList.step_data[key] ? this.errorList.step_data[key]:{};
          this.errorList.step_data[key][rowObj.rowIndex] = this.errorList.step_data[key][rowObj.rowIndex] ? 
                                              this.errorList.step_data[key][rowObj.rowIndex]:[];
          this.errorList.step_data[key][rowObj.rowIndex].push(rowObj.message);                                    
        }else{
          let index = -1;
          this.errorList.step_data[key][rowObj.rowIndex].map((value, valueIndex)=>{
            if(value == rowObj.message){
              index = valueIndex
            }
          });
          if(index >= 0) 
            this.errorList.step_data[key][rowObj.rowIndex].splice(index, 1);
        }
        this.$emit('set-error',this.errorList);
      },
      setFilterSelError(key, value, rowObj){
         if(value){            
            this.errorList.step_data[key] = this.errorList.step_data[key] ? this.errorList.step_data[key]:{};
            this.errorList.step_data[key][rowObj.rowIndex] = this.errorList.step_data[key][rowObj.rowIndex] ? 
                                              this.errorList.step_data[key][rowObj.rowIndex]:{};
            this.errorList.step_data[key][rowObj.rowIndex][rowObj.column] = this.errorList.step_data[key][rowObj.rowIndex][rowObj.column] ?
                                                                     this.errorList.step_data[key][rowObj.rowIndex][rowObj.column]:{};
            this.errorList.step_data[key][rowObj.rowIndex][rowObj.column] =  rowObj.message;                                                      
          }else{
            this.errorList.step_data[key][rowObj.rowIndex][rowObj.column] =  undefined;
          }
          this.$emit('set-error',this.errorList);
      },
      setArchivalStepCriteriaError(key, value, rowObj){
        if(value){
            this.errorList.step_data.drv_table = this.errorList.step_data.drv_table ? this.errorList.step_data.drv_table:{};          
            this.errorList.step_data.drv_table[key] = this.errorList.step_data.drv_table[key] ? this.errorList.step_data.drv_table[key]:{};
            this.errorList.step_data.drv_table[key][rowObj.rowIndex] = this.errorList.step_data.drv_table[key][rowObj.rowIndex] ? 
                                              this.errorList.step_data.drv_table[key][rowObj.rowIndex]:{};
            this.errorList.step_data.drv_table[key][rowObj.rowIndex][rowObj.column] = this.errorList.step_data.drv_table[key][rowObj.rowIndex][rowObj.column] ?
                                                                     this.errorList.step_data.drv_table[key][rowObj.rowIndex][rowObj.column]:{};
            this.errorList.step_data.drv_table[key][rowObj.rowIndex][rowObj.column] =  rowObj.message;                                                      
          }else{
            this.errorList.step_data.drv_table[key][rowObj.rowIndex][rowObj.column] =  undefined;
          }
          // debugger;
          this.$emit('set-error',this.errorList);
      },
      setAllError(value){
        // debugger;
        this.resetAllCheckbox(value);
        if(value){
            this.errorList = this.validation_response;
          }else{
            this.errorList = {step_data:{}};
          }
          this.$emit('set-error',this.errorList);
      },
      resetAllCheckbox(value){
          this.inputResponse.map(module=>{
            module.rowArray.map(row=>{
              row.isChecked = value ? true : false;
            });
          })       
      },
      setInputResponse(obj){
        this.showchip = true
        let _this = this;
        _this.totalCount = 0;
        // alert(this.stepType);
        if(this.stepType == 'Selection'){
          this.setSelectionResponse(obj)
        }
        else if (this.stepType == "Archival"|| this.stepType == 'Purge' || this.stepType == 'Copy'){
          this.setArchivalResponse(obj);  
        }
        else if(this.stepType == 'Merge' || this.stepType == 'Minus'){
          this.setMergeResponse(obj);  
        }
        else if(this.stepType == 'Procedure'){
          this.setProcedureResponse(obj);
        }
          /**
           * count total error in a list to show a bedge 
           */
          
          this.inputResponse.map(obj=>{
            obj.rowArray.map(row=>{
              _this.totalCount += 1;
            })
            _this.chipcolor = 'green'
            if(_this.totalCount > 0)
              _this.chipcolor = 'red'
          })
          this.$emit('totalCount', _this.totalCount); 
        // console.log("Input Response:....."+JSON.stringify(_this.inputResponse));
      },
      setProcedureResponse(obj){
        let _this = this;
        _this.inputResponse=[];
        let tempObject = {type:'Selection',rowArray:[]};
          let colObject = { 'message':'Select Stored Procedure to execute','isChecked':false};
          tempObject.rowArray.push(_.cloneDeep(colObject));
          _this.inputResponse.push(_.cloneDeep(tempObject));
      },
      setArchivalResponse(obj){
        let _this = this;
        _this.inputResponse=[];
        if(obj.business_obj_id){
          let tempObject = {type:'Business Object',rowArray:[]};
          let colObject = { 'message':'Select Business Object','isChecked':false};
          tempObject.rowArray.push(_.cloneDeep(colObject));
          _this.inputResponse.push(_.cloneDeep(tempObject));
        }
        if(!obj.drv_table)
          return false
        let moduleArray = Object.keys(obj.drv_table);//Array of selection, join, graph, criteria key
        moduleArray && moduleArray.map(modString=>{ //modObj will ref key like selection
        if(modString == 'filter'){
          let rowArray = Object.keys(obj.drv_table[modString]);
          let tempObject = {type:modString,rowArray:[]};
            rowArray.map(row=>{
              if(!(typeof obj.drv_table[modString][row] == 'string')){ //sometime in graph getting key 'tree':'multiple tree found' on row level
                  let ColArray = Object.keys(obj.drv_table[modString][row]);
                    ColArray.map(column=>{
                      let message = "";
                      if(obj.drv_table[modString][row][column] instanceof Array){
                          message = obj.drv_table[modString][row][column].join("");
                      }else{
                        message = obj.drv_table[modString][row][column];
                      }
                      let colObject = {'rowIndex':row, 'column':column, 'message':message,'isChecked':false};
                        tempObject.rowArray.push(_.cloneDeep(colObject));
                    })
              }
            })
          _this.inputResponse.push(_.cloneDeep(tempObject));
        }
        else if (modString == 'select_table_list'){
          let tempObject = {type:'Driver table',rowArray:[]};
          let colObject = { 'message':'Select Driver table','isChecked':false};
          tempObject.rowArray.push(_.cloneDeep(colObject));
          _this.inputResponse.push(_.cloneDeep(tempObject));
        }
        });
      },
      setMergeResponse(obj){
        let moduleArray = Object.keys(obj);//Array of selection, join, graph, criteria key
        let _this = this;
        _this.inputResponse=[];
        moduleArray && moduleArray.map(modString=>{ //modObj will ref key like selection
          let tempObject = {type:modString,rowArray:[]};
          if(modString == 'filter'){
             let tableArray = Object.keys(obj[modString]);
             tableArray.map(table=>{
               let rowArray = Object.keys(obj[modString][table]);
               rowArray.map(row=>{
                 let columnArray = Object.keys(obj[modString][table][row]);
                 columnArray.map(column=>{
                   let message = obj[modString][table][row][column].join();
                   let colObject = {'rowIndex':row, 'column':column, 'message':message,'isChecked':false, table_name:table};
                    tempObject.rowArray.push(_.cloneDeep(colObject));
                 })
               });
             })
          }if(modString == 'selection'){
            let rowArray = Object.keys(obj[modString]);
            rowArray.map(row=>{
              let columnArray = Object.keys(obj[modString][row]);
              columnArray.map(column=>{
               let message = obj[modString][row][column];
               let colObject = {'rowIndex':row, 'column':column, 'message':message,'isChecked':false,};
                    tempObject.rowArray.push(_.cloneDeep(colObject)); 
              })
            })
          }if(modString == 'select_table_list'){
            let colObject = {'column':'selection_error', 'message':'Minimum 2 tables required to execute this step.'}
            tempObject.rowArray.push(_.cloneDeep(colObject)); 
          }
          _this.inputResponse.push(_.cloneDeep(tempObject));
        });
      },
      setSelectionResponse(obj){
        let moduleArray = Object.keys(obj);//Array of selection, join, graph, criteria key
        let _this = this;
        _this.inputResponse=[];
        moduleArray && moduleArray.map(modString=>{ //modObj will ref key like selection
          let rowArray = Object.keys(obj[modString]);
          let tempObject = {type:modString,rowArray:[]};
            rowArray.map(row=>{
              if(!(typeof obj[modString][row] == 'string')){ //sometime in graph getting key 'tree':'multiple tree found' on row level
                  let ColArray = Object.keys(obj[modString][row]);
                    ColArray.map(column=>{
                      let message = "";
                      if(obj[modString][row][column] instanceof Array){
                          message = obj[modString][row][column].join("");
                      }else{
                        message = obj[modString][row][column];
                      }
                      let colObject = {'rowIndex':row, 'column':column, 'message':message,'isChecked':false};
                      if(tempObject.type=='join'){
                        this.setJoinRsponse(tempObject, colObject);
                      }else{
                        tempObject.rowArray.push(_.cloneDeep(colObject));
                      }
                    })
              }
              else if (modString == 'selection')
              {
                let colObject = {'message':'Select atleast one column for data selection','isChecked':false};
                 tempObject.rowArray.push(_.cloneDeep(colObject));
              }
            })
            if(tempObject.rowArray.length > 0)
              _this.inputResponse.push(_.cloneDeep(tempObject));
        });
      },
      setJoinRsponse(tempObject, colObject){
        let joinObj = _.cloneDeep(colObject);
        if(colObject.message.jfrom){
          joinObj.message = colObject.message.jfrom;
          joinObj['jfrom'] = true;
          tempObject.rowArray.push(_.cloneDeep(joinObj));
        }
        if(colObject.message.jto){
           joinObj.message = colObject.message.jfrom;
          joinObj['jto'] = true;
          tempObject.rowArray.push(_.cloneDeep(joinObj));
        }
      }
    }
  }
</script>
<style scoped>
.customCheckbox >>> label{
    top: 3px !important;
    font-size:14px !important;
}
</style>
