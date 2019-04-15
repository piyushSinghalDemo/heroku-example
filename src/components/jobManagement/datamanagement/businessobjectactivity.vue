  <template>
    <div>
      <v-layout row wrap pl-4 class="breadcrumbBackground">
        <v-flex xs8 style="margin:auto">
          <v-layout row wrap>
            <v-flex xs12 pl-3>
              <ul class="breadcrumb">
                <li>
                  <router-link to="/dashboard">Home</router-link>
                </li>
                <li>Business Object Activity</li>
                <li>
                  <select v-model="Environment" v-on:change="getAllActivities"
                  style="-webkit-appearance: menulist;" autofocus ref="envname">
                  <option :value="{}">Select Environment</option>
                  <option v-for="(env, index) in EnvironmentList" :value="env" :key="index">{{env.name}}</option>
                </select> 
              </li>
              <!-- <li>
                <select v-model="BusinessObject" v-on:change="getAllArchieves" 
                style="-webkit-appearance: menulist;">
                <option :value="{}">Select Business Object</option>
                <option v-for="(bo, index) in BusinessObjectList" :value="bo" :key="index">{{bo.business_object_name}}</option>
              </select> 
            </li>              -->               
          </ul>
        </v-flex>
      </v-layout>                
    </v-flex>
    <v-flex xs4 text-xs-right pr-4 pb-1 style="">                
    </v-flex>
    <v-flex>
      <v-dialog v-model="filter_dialog" width="920" scrollable style="overflow-y:none" persistent>
        <v-flex>
          <v-card class="rounded-card" style="height: 425px;">
            <v-toolbar dark dense>
              <v-flex class="text-md-center">Mode & Filter
                <v-icon class="text-lg-left" @click="filter_dialog = false" style="color:#dedede;height:22px;float:right">fa-times-circle</v-icon>
              </v-flex>
            </v-toolbar>
            <v-layout  style="width:90%;">
              <v-flex xs3>
                <v-layout  style="width:90%;">
                  <v-flex  pa-2 xs4 style="text-align: left;">
                    <label  class="v-label" style="margin-top: 30%;text-align: left;">Activity: 
                    </label>
                  </v-flex>
                  <v-flex xs8>
                    <label  class="v-label" style="margin-top: 18%;text-align: left;"><b>{{activity_type}}</b>
                    </label>
                  </v-flex>
                </v-layout>
              </v-flex>
              <v-flex xs3>
                <v-layout  style="width:90%;">
                  <v-flex  pa-2 xs4 style="text-align: left;">
                    <label  class="v-label" style="margin-top: 30%;text-align: left;">Selected: 
                    </label>
                  </v-flex>
                  <v-flex xs8>
                    <label  class="v-label" style="margin-top: 18%;text-align: left;"><b>{{selectedRows.length}} </b>
                    </label>
                  </v-flex>
                </v-layout>
              </v-flex>
              <v-flex xs6>
                <v-layout  style="width:90%;" v-show="!is_enquiry">
                  <v-flex  pa-2 xs4 style="text-align: left;">
                    <label  class="v-label" style="margin-top: 15%;text-align: left;">Select Mode: 
                    </label>
                  </v-flex>
                  <v-flex xs8>
                    <v-radio-group v-model="ExecutionMode" row>
                      <v-radio class="radioClass" :color="colorCode" label="Proof" value="proof"></v-radio>
                      <v-radio class="radioClass" :color="colorCode" label="Final" value="final"></v-radio>
                    </v-radio-group>
                  </v-flex>
                </v-layout>
              </v-flex>
            </v-layout>
            <v-flex pa-2 xs12 style="height: 225px; overflow-y: scroll;" id="step_detail_table">
              <criteria filtertablename="Catalog" :columns_for_filter="filter_rows_list" :column_name_list="avlColumnList"
              @savedata="saveCriteria" @new="add_new_filter_row" @delete="delete_filter_row"></criteria>
            </v-flex>

            <!-- <v-btn color="success" large block v-on:click="filter_dialog = false" style="margin-bottom: 0px;">Submit</v-btn> -->
            <!-- <vc-button type="button" @click="closeFilterPanel" itemText="Submit Button"></vc-button> -->
            <v-layout row wrap mr-4 mt-3>
              <v-flex xs12 class="text-xs-right" mr-1>
                <v-btn :color="outlineColor" @click="validateFilter('job')" outline style="border-radius:10px" v-show="!is_enquiry">
                  Run Job
                </v-btn>
                <v-btn :color="outlineColor" @click="validateFilter('schedule')" outline style="border-radius:10px" v-show="!is_enquiry">
                  Schedule Job
                </v-btn>    
                <v-btn :color="outlineColor" @click="ShowData" outline style="border-radius:10px" v-show="is_enquiry">
                  Show Data
                </v-btn>                 
                <v-btn :color="outlineColor"  outline style="border-radius:10px" @click="onCancel()">
                  Cancel
                </v-btn>
              </v-flex>
              <v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'>
                {{ snackbartext }}
              </v-snackbar>
            </v-layout>
          </v-card>
        </v-flex>
      </v-dialog>
    </v-flex>
  </v-layout>
  <vc-data-table :data="tableList"  @onRestore="onRestore" @onSelectedRows="onSelectedRows" @onDispose="onDispose" @onEnquiry="onEnquiry" :loader="loader" @filterData="filterData" @onpagination="onPagination"  @sortBy="sortBy"></vc-data-table>
  <!-- <v-btn outline color="indigo" @click="PerformOps('R')"  style="float:left;border-radius:10px">Restore</v-btn>
    <v-btn outline color="indigo" @click="PerformOps('D')"  style="float:left;border-radius:10px">Dispose</v-btn> -->

    <v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'>
      {{ snackbartext }}
    </v-snackbar>
    <loading-panel :loader="loader"></loading-panel>
  </div>
  </template>
  <script>
  import moment from 'moment'
  import config from './../../../config.json'
  import { get as getToServer, deleteFromServer, post as postToServer } from './../../../methods/serverCall.js';
  import {SERVER_ERROR} from './../../../data/client_message.js'
  import {ACTIVITY_TYPE_RESTORE,ACTIVITY_TYPE_SELECTIVE_RESTORE, ACTIVITY_TYPE_DISPOSE, BULK_RESTORE, ACTIVITY_TYPE_SELECTIVE_DISPOSE} from './../../../data/job_management.js'
  import {GET_ALL_ENV, GETALLACTIVITIES, CREATE_NEW_JOB,GETBUSINESS_OBJECT_BY_ENV,VALIDATE_ACTIVITY_FILTER} from './../../../data/url_constants.js';
  import {CLIENT_SIDE, SERVER_SIDE} from './../../../data/macros.js'
  import cloneDeep from 'lodash/cloneDeep';
  import orderBy from 'lodash/orderBy';
  import _ from 'lodash'
  import dataTable from './../../../views/dataTable/datatable.vue'
  import loadingPanel from './../../../views/loading.vue'
  import {mapActions} from 'vuex'
  import Criteria from "@/views/criteria.vue";
  import {
    COLOR_CODE, BTN_COLOR
  } from "@/data/macros.js";
  import {JOB_MANAGEMENT_SERVICE,EXECUTE_ACTION} from "../../../data/macros.js"
  import getUserRole from '../../../methods/GetUserRole.js'
  import {getEnvironmentList} from '../../../methods/EnvironmentList.js'

  // import dummyData from './tableData.js'
  // import data from './metaData.js'
  export default {
    // name: 'ClientJobListNew',
    data: function () {
      return {
        colorCode:COLOR_CODE,
        outlineColor:BTN_COLOR,
        showfailed_reason:false,
        job_list: [],
        selected_process_definition:'',
        live_satus: [],
        job_failed_reason:'',
        tableList: {
          headers: [
          { text: 'Activity ID', value:'activity_id', width: '130px', sortable: false,align:'right'},
          { text: 'Business Object', value: 'business_object_name', width: '200px', cssClass:'w16'},
          { text: 'Ver', value: 'bo_revision', width: '80px' ,align:'right'},
          { text: 'Activity' , value: "activity", width: '140px'}, 
          { text: 'Job Id' , value: "job_id", width: '120px',align:'right'},
          { text: 'Driver Count', value: 'driver_table_count', width: '150px',align:'right', cssClass:'w16'},
          { text: 'Performed By' , value: "created_by", width: '180px', cssClass:'w16'}, 
          { text: 'Performed Date', value: 'activity_date', width: '200px', cssClass:'w16'},
          { text: 'Performed Time', value: 'activity_time', width: '200px', cssClass:'w16'},
          ],
          actions:[],
          sorting_type: SERVER_SIDE,
          filterType: SERVER_SIDE,
          paginationType: SERVER_SIDE,
          total_count: 0,
          rows: [],
          select_rows:true
        },
        sorting : config.SORTING_TYPE,
        envIpJson : {
          "filter": [],
          "sort": {
            "column": "",
            "type": ""
          },
          "page": 1,
          "page_size": 10
        },
        filterType: SERVER_SIDE,
        paginationType: SERVER_SIDE,
        auto_increment_id:0,
        snackbar:false,
        snackbartext:'',
        snackbartimeout:5000,
        colorValue:'success',  
        ExecutionMode: 'proof',          
        valid:true,
        loader:false,
        Environment:{},
        EnvironmentList:[],
        Jobid_List :[],
        timer_timespan :3000,
        selectedRows:[],
        BusinessObject:{},
        BusinessObjectList:[],
        filter_dialog:false,
        avlColumnList:[],
        filter_rows_list:[],
        catalog_table_name:'',
        activity_type:'',
        pd_revisions:'',
        filter_column_tbl_obj: {
          s_parentheses: "",
          column_name: "",
          operators: "",
          v_type: "Value",
          value1: "",
          value2: "",
          e_parentheses: "",
          table_name:""
        },
        userRole:{},
        is_enquiry:false,
        current_row:{},
        enquery_activity_type:ACTIVITY_TYPE_RESTORE,
        step_list:['Archival','Purge','Copy'],
        is_action:false,
      }
    },
    components: {
      'vc-data-table': dataTable,
      'loading-panel':loadingPanel,   
      criteria: Criteria, 
    },
    mounted() {
     this.avlColumnList = []
     this.selectedRows = []
     this.catalog_table_name =''

     this.userRole = this.$session.get('user_role_mapping');
     this.tableList.actions = [
     {'text':'restore','key':"activity",'cmpValue':"Archival",role:this.userRole.is_superadmin || getUserRole(this.userRole,JOB_MANAGEMENT_SERVICE,EXECUTE_ACTION)},
            // {'text':'selectiverestore','key':""},
            {'text':'dispose','key':"activity",'cmpValue':"Archival",role:this.userRole.is_superadmin || getUserRole(this.userRole,JOB_MANAGEMENT_SERVICE,EXECUTE_ACTION)},
            {'text':'enquiry','key':"",selectType:"multiple"},
            ]
            var env_value = this.$session.get('selected_env')
            if( env_value && env_value.id != '0' && env_value.id !='all_env'){
              this.Environment = this.$session.get('selected_env')
              // this.getAllBusinessObjects()
            }
    // this.BusinessObject = bo_value
    this.getAllActivities(this.envIpJson)
    // var bo_value= this.$session.get('selected_bo')
    // if(bo_value){
    //   this.BusinessObject = bo_value
    //   this.getAllArchieves()
    // }
    // this.getAllArchieves();
    // alert(this.$route.path)
    getEnvironmentList(this);
    this.focus_env()
    },
    beforeDestroy() {
    },
    methods: {
      ...mapActions(['setBOActivityData']),

      focus_env(){
        if(this.$refs.envname.$el)
          this.$refs.envname.$el.focus()
        else this.$refs.envname.focus()
      },
      hideLoader(){
        let _this = this;
        setTimeout(function(){
          _this.loader = false; 
        },500);
      },

      
          getAllActivities (envIpJson) {
             let _this = this;
            let inputJson = this.envIpJson;
            this.$store.state.boActivityData = []
            this.tableList.rows = []

            if(!this.Environment.id)
              return false
            // if(!this.BusinessObject.business_object_id)
            //   return false
            this.loader = true;
            _this.$session.set('selected_env', this.Environment)
            _this.$session.set('selected_bo', this.BusinessObject)
            var env_id = this.Environment.id;
            var client_id = this.$session.get('client_id')
            var data = {"client_id": client_id,
                        "env_id": env_id,
                        "filter": inputJson.filter,
                        "page": inputJson.page,
                        "page_size": inputJson.page_size,
                        "sort": inputJson.sort}
            postToServer(this, config.ENGINE_API_URL + GETALLACTIVITIES, data).then(response => {
              var data = response
              if(data){
                _this.activity_list = data.result;
                var total_count = data.total
                _this.tableList.rows =  _this.activity_list
                 this.tableList.total_count = total_count;
              }
              _this.hideLoader();
            }).catch(CurrentJobError => {
              _this.hideLoader();
              if(CurrentJobError){
                _this.loader = null
                _this.snackbar = true
                _this.colorValue = 'error'
                _this.snackbartext = CurrentJobError;
              }
              else {
                _this.snackbar = true
                _this.colorValue = 'error'
                _this.snackbartext = SERVER_ERROR;
              }
            })

          },
          filterData(filterArray){
            let _this = this;
            let inputJson = _this.envIpJson;
            inputJson.filter=[];
            _.set(inputJson, 'page', 1);
            filterArray.map((obj, index)=>{
              obj.stringArray.map((stringObj, stringIndex)=>{
                if(obj.value.split('.')[1]){
                  var value = obj.value.split('.')[1]
                }else{
                  var value = obj.value.split('.')[0]
                }
                let temp = {"column":value,"value": String(stringObj.text).trim()};
                inputJson.filter.push(cloneDeep(temp));
              })
            });
            this.getAllActivities(inputJson)
          },
          onPagination(page, perPage) {
            let _this = this;
            let inputJson = _this.envIpJson;
            inputJson.page = page;
            inputJson.page_size = perPage;
            this.getAllActivities(inputJson);
          },
          sortBy: function (key, sortingType) {
                let _this = this;
                if(!key || !sortingType)
                    return 

                let inputJson = _this.envIpJson;
                inputJson.sort.column = key;
                inputJson.sort.type = sortingType;
                this.getAllActivities(inputJson)
            },
          onRestore: function(record) { 
            this.PerformOps('R')
          },
          onSelectedRows(selectedRows){
            this.selectedRows = selectedRows;
            console.log(this.selectedRows)
          },
          onDispose: function(record) { 
            this.PerformOps('D')
          },
          onEnquiry: function(record){
            this.is_action = true
            this.current_row = record[0]
            console.log(record)
            this.activity_type ='Enquiry'
            if(_.uniq(_.map(record,'business_object_id')).length >1){
              alert('Select same business object.')
              return false
            }
            this.enquery_activity_type = this.current_row.activity
            if (this.step_list.indexOf(this.current_row.activity) >= 0) {
              this.is_action = false
            }
            this.PerformOps('E') 
          },
          
          getAllBusinessObjects(){
            let _this = this;
            this.avlColumnList = []
            this.catalog_table_name =''
            this.selectedRows =[]
            this.tableList.rows = []
            this.BusinessObjectList=[]
            this.BusinessObject ={}
            if(!this.Environment)
              return false
        // this.getAllArchieves()
        _this.$session.set('selected_env', this.Environment)
        
        var env_id = this.Environment.id;
        getToServer(this, config.ENGINE_API_URL + GETBUSINESS_OBJECT_BY_ENV+'/'+env_id).then(response => {
          this.BusinessObjectList = response
        }).catch(CurrentJobError => {
          _this.hideLoader();
          if(CurrentJobError){
            _this.loader = null
            _this.snackbar = true
            _this.colorValue = 'error'
            _this.snackbartext = CurrentJobError;
          }
          else {
            _this.snackbar = true
            _this.colorValue = 'error'
            _this.snackbartext = SERVER_ERROR;
          }
        })
      },
      GetData(){
        var client_id = this.$session.get('client_id')
        // get policy_details 
        var activity_ids = _.map(this.selectedRows,'activity_id')
        var filter_data = cloneDeep(this.filter_rows_list)
        if(filter_data.length === 1 && (!filter_data[0].column_name ||!filter_data[0].operator))
          filter_data = []
        if(filter_data.length >= 1){
          // FILTER MEANS SELECTIVE ACTION AND BASED ON BUTTON CLICK WE DECIDE RESTORE OR DISPOSE
          if(this.activity_type === ACTIVITY_TYPE_RESTORE)
            this.activity_type = ACTIVITY_TYPE_SELECTIVE_RESTORE
          else
            this.activity_type = ACTIVITY_TYPE_SELECTIVE_DISPOSE
        }
        return {
          'client_id': client_id,
          'process_definition_id': this.process_definition_id,
          'process_definition_name': this.process_definition_name,
          'created_by': this.$session.get('email'),
          'activity_ids':activity_ids,
          'activity_type': this.activity_type,
          'execution_environment': this.Environment.id,
          'mode_of_execution':this.ExecutionMode,
          'exe_type':'on_demand',
          'filter_data':filter_data,
          'table_name':this.catalog_table_name,
          'pd_revision':this.pd_revision,
        }

      },
      CreateNewJob(){
        var data = this.GetData()
        if(this.ExecutionMode === 'final' && (this.activity_type === ACTIVITY_TYPE_DISPOSE || this.activity_type === ACTIVITY_TYPE_SELECTIVE_DISPOSE)){
          var record = this.current_row
          // dont allow to user to dispose record if can dispose date > current date
          var current_date= moment().format('YYYY/MM/DD')
          if(record.can_dispose_on && current_date < record.can_dispose_on){
            alert('You cannot perform dispose operation beacuse current date is less than can dispose date')
            return false
          }
        }
        console.log(data)
        postToServer(this, config.ENGINE_API_URL + CREATE_NEW_JOB, data).then(response => {
          if (response) {
            this.ShowErrorMessage=false;
            this.ShowSuccessMessage = true;
            this.sucessMessage = response.body;

          }}).catch(ProcessDefError => {
            if(ProcessDefError){
              this.loader = null 
              this.snackbar = true
              this.colorValue = 'error'
              this.snackbartext = ProcessDefError;
            }
            else {
              this.snackbar = true
              this.colorValue = 'error'
              this.snackbartext = SERVER_ERROR;
            }
          })
          setTimeout(() => this.$router.push('/currentjoblist'), 1000);

        },

        CreateScheduleJob(){
         var data = this.GetData()
         data['is_one_time_schedule'] =true
         data['is_restored'] = true
         data['exe_type']='on_schedule'
         this.$router.push({'name' : 'schedulejob', 'params' : { schedule_data: data, type:'new', service_id:config.ENGINE_SERVICE_ID, end_point: config.END_POINT_FOR_SCHEDULER}});
       },
       ShowData(){
        var record = this.current_row
        var filter_data = cloneDeep(this.filter_rows_list)
        if(filter_data.length === 1 && (!filter_data[0].column_name ||!filter_data[0].operator))
          filter_data = []
        this.$router.push({ name: 'showacitvitydata', params: {'activity_ids':_.map(this.selectedRows,'activity_id'),'is_action':this.is_action,'table_name':record.catalog_table_name,'env_id':this.Environment.id,'env_name':this.Environment.name,'bo_name':record.business_object_name,'activity':this.enquery_activity_type,'filter_data':filter_data,'unique_identifiers':record.unique_identifiers}});
      },
      PerformOps(type){
        this.is_enquiry = false
        this.disable_final_mode = false
        this.ExecutionMode = 'proof'
        if(this.selectedRows.length <=0){
          alert('select atleast on record')
          return
        }
        this.avlColumnList = []
        this.catalog_table_name =''
        var record = this.selectedRows[0]
        this.current_row = record
        for (var i = 0; i< record.unique_identifiers.length; i++) {
          this.avlColumnList.push(record.unique_identifiers[i])
        }
        console.log(this.avlColumnList)  
        this.catalog_table_name = this.selectedRows[0].catalog_table_name
        this.process_definition_id = this.selectedRows[0].business_object_id
        this.process_definition_name = this.selectedRows[0].business_object_name
        this.pd_revision = this.selectedRows[0].business_object_revision
        if(type==='R')
          this.activity_type = ACTIVITY_TYPE_RESTORE
        else if(type ==='D')
          this.activity_type = ACTIVITY_TYPE_DISPOSE
        
        else if (type === 'E'){
          this.is_enquiry = true
          this.activity_type = 'Enquiry'
        }
        // this.filter_rows_list = this.avlColumnList 
        if(!this.filter_rows_list.length)
          this.add_new_filter_row()
        this.filter_dialog =true           
      },
      add_new_filter_row() {
        var current_filter_length = this.filter_rows_list.length;
        if (current_filter_length > 0) {
          if (!this.filter_rows_list[current_filter_length - 1]["operation"])
            this.filter_rows_list[current_filter_length - 1]["operation"] = false;
        }
        var obj = cloneDeep(this.filter_column_tbl_obj);
        obj["id"] = this.get_new_id();
        obj["table_name"] = this.catalog_table_name
        this.filter_rows_list.push(obj);
      },
      delete_filter_row(idx) {
        var current_filter_length = this.filter_rows_list.length;
        if (current_filter_length > 1 && current_filter_length - 1 === idx)
          delete this.filter_rows_list[idx - 1]["operation"];
        this.filter_rows_list.splice(idx, 1);
        if (this.filter_rows_list.length === 0) {
          var obj = cloneDeep(this.filter_column_tbl_obj);
          this.filter_rows_list.push(obj);
        }
      },
      saveCriteria(columns_for_filter) {
        this.filter_rows_list = columns_for_filter;
        console.log('filters', this.filter_rows_list)
      },
      get_new_id() {
        return ++this.auto_increment_id;
      },
      onCancel(){
        this.filter_dialog = false
      },
      validateFilter(call_type){
        if(this.filter_rows_list.length === 1)
        {
          if(this.filter_rows_list[0].column_name === "")
          {
            if(call_type === 'job')
              return this.CreateNewJob()
            else
              return this.CreateScheduleJob()
          }
        }

        var filter_json = {'filter_data':this.filter_rows_list}
        postToServer(this, config.VALIDATION_URL + VALIDATE_ACTIVITY_FILTER, filter_json).then(response => {
          console.log(response)
          if (response) {
           if(typeof response == 'string')
           {
            this.snackbar = true
            this.colorValue = 'error'
            this.snackbartext = response;
          }
          else{
            var empty_json ={}
            if(typeof response =='object' && response.filter_data){
              this.snackbar = true
              this.colorValue = 'error'
              this.snackbartext = 'Please specify valid filter';
            }
            else{
             if(call_type === 'job')
              this.CreateNewJob()
            else
              this.CreateScheduleJob()
          }
        }}}).catch(ProcessDefError => {})
      }
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

  /* tr:nth-child(even) {background-color: #E8E8E8;}
  .blurOpacity{
    opacity: 0;
  }
  .showInput {
    visibility: inherit !important;
    width: 50% !important;
  }

  .srch-ip {
    width: 0px;
    background: white;
    color: black;
    float: right;
    transition: all 1s;
    visibility: hidden;
  }

  table {
    border: 2px solid grey;
    border-radius: 3px;
    background-color: #fff;
    cursor: pointer;
  }

  thead {
    line-height: 30px;
    transition: all 10s;
  }

  th {
    background-color: grey;
    color: rgba(255, 255, 255, 0.66);
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  th.active {
    color: #fff;
  }

  th.active .arrow {
    opacity: 1;
  }

  .arrow {
    display: inline-block;
    vertical-align: middle;
    width: 0;
    height: 0;
    margin-left: 5px;
    opacity: 0.66;
  }

  .arrow.asc {
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-bottom: 4px solid #fff;
  }

  .arrow.dsc {
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 4px solid #fff;
  }

  .srch-icon {
    font-size: 16px;
    color: white;
    float: right;
    margin-top: 4%;
  } */
  </style>
