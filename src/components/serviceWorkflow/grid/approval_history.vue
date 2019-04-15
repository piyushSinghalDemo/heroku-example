<template>
    <v-container style="padding-top:0px;">
        <v-layout row wrap mr-1 ml-2>
            <v-flex class="text-xs-right" xs4 style="margin:auto">
                <ul class="breadcrumb">
                    <li>
                        <router-link to="/dashboard">Home</router-link>
                    </li>
                    <li>Approval Request History List</li>
                </ul>
            </v-flex>
            <v-flex xs8>
            </v-flex>
        </v-layout>
        <vc-data-table :data="tableList" @onRequestHistory="onRequestHistory" @filterData="filterData" @onpagination="onPagination" @sortBy="sortBy"></vc-data-table>
        <v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'>
            {{ snackbartext }}
        </v-snackbar>
    </v-container>
</template>
<script>
import moment from 'moment'
import config from '../../../config.json'
import {
    get as getToServer,
    post as postToServer
} from '../../../methods/serverCall.js';
import {
    SERVER_ERROR
} from '../../../data/client_message.js'
import {
    GET_ALL_TASK_DETAILS, UPDATE_TASK_DETAILS, GET_ALL_APPROVALS_HISTORY
} from '../../../data/url_constants.js';
import {
    CLIENT_SIDE,
    SERVER_SIDE
} from '../../../data/macros.js'
import cloneDeep from 'lodash/cloneDeep';
import orderBy from 'lodash/orderBy';
import _ from 'lodash'
import dataTable from '../../../views/dataTable/datatable.vue'

// import dummyData from './tableData.js'
// import data from './metaData.js'
export default {
    name: 'ManageTaskApprovalList',
    data: function () {
        return {        
            tableList: {
                headers: [
					{ text: 'Request For', value: 'requester_desc' },
					{ text: 'Description', value: 'request_desc' },
					{ text: 'Current Status', value: 'request_status', width:'20%'},
					{ text: 'Requested By', value: 'created_by', width:'20%' },
					{ text: 'Requested Date', value: 'timezone_aware_created_date',dataType:'date', width:'20%' },
                    { text: 'Requested Time', value: 'timezone_aware_created_time',dataType:'date', width:'20%' }
                ],
                actions: [{'text':'request_history','key':"", selectType:"single"}], //if we need conditional action in row then provide key
                sorting_type: SERVER_SIDE,
                filterType: SERVER_SIDE,
                paginationType: SERVER_SIDE,
                total_count: 0,
                rows: [],
                select_rows:true,
                syncHeaderScroll:false,
            },
            snackbar: false,
            snackbartext: '',
            snackbartimeout: 5000,
            colorValue: 'success',
            valid: true,
            loading: false,
			dialog: false,
			task_name: '',
			search: '',
			pagination: {},
			TaskList : [],
			ShowSuccessMessage: false,
			ErrorMessage:'',
			SuccessMessage:'',
			ShowErrorMessage:false,
			reason : '',
			task_name : '',
			task_obj_id:'',
			task_id: '',
			process_workflow_id: '',
			level: '',
			task_action_type : '',
			process_name : '',
            is_process : false,
            reasonRules:[
				v => !!v || 'Reason is required'
            ],
            record:{},
            envIpJson : {
              "filter": [],
              "sort": {
                  "column": "",
                  "type": ""
              },
              "page": 1,
              "page_size": 10
            },
            loader:false,
            
        }
    },
    components: {
        'vc-data-table': dataTable,
    },
    mounted() {
         this.getRequestList(this.envIpJson)
    },
    methods: {
        onRequestHistory(record){
        	this.$router.push({ name: 'requesthistory', params: { request_id: record.id, current_status:  record.request_status, object_name: record.object_name}})
        },
        getRequestList (envIpJson) {
            let inputJson = this.envIpJson;

			var user_process_details = this.$session.get('user_process_details')
			var user_name = this.$session.get('email')
            debugger
            var input_json = {
              "user_name":user_name,
              "filter": inputJson.filter,
              "page": inputJson.page,
              "page_size": inputJson.page_size,
              "sort": inputJson.sort,
            }
			var get_task_list_url = config.PROCESS_APPROVAL_URL + GET_ALL_APPROVALS_HISTORY
			postToServer(this, get_task_list_url, input_json).then(response => {
				var _this = this
				_this.tableList.rows = response.result
                _this.tableList.total_count = response.total;
				_this.tableList.rows.map(function(obj,index){
					if (obj.action_date!=null)
					{
						var dummyDate = moment(new Date(obj.action_date)).tz(_this.$session.get('time_zone_preference')).format('YYYY-MM-DD | HH:mm:ss');
						response[index].action_date = dummyDate
						response[index].time_zone_preference = moment().tz(_this.$session.get('time_zone_preference')).format('zz')
					}
					else{
						response[index].action_date = ''
						response[index].time_zone_preference = ''
					} 
				})
			}).catch(error_response => {
			if(error_response){
				// this.snackbar = true
				// this.colorValue = 'error'
				// this.snackbartext = error_response;
			}
			else {
				// this.snackbar = true
				// this.colorValue = 'error'
				// this.snackbartext = SERVER_ERROR;
				}
			});
		},
        filterData(filterArray){
            let _this = this;
            let inputJson = _this.envIpJson;
            inputJson.filter=[];
            debugger
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
            // debugger
            this.getRequestList (inputJson)
        },
        onPagination(page, perPage) {
            let _this = this;
            let inputJson = _this.envIpJson;
            inputJson.page = page;
            inputJson.page_size = perPage;
            this.getRequestList (inputJson)
        },
        sortBy: function (key, sortingType) {
            let _this = this;
            if(!key || !sortingType)
                return 

            let inputJson = _this.envIpJson;
            inputJson.sort.column = key;
            inputJson.sort.type = sortingType;
            this.getRequestList(inputJson);
        },
    }
}
</script>
<style scoped>

</style>