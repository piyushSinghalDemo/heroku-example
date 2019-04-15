<template>
    <v-container style="padding-top:0px;">
        <v-layout row wrap mr-1 ml-2>
            <v-flex class="text-xs-right" xs4 style="margin:auto">
                <ul class="breadcrumb">
                    <li>
                        <router-link to="/dashboard">Home</router-link>
                    </li>
                    <li>Manage Approval Request List</li>
                </ul>
            </v-flex>
            <v-flex xs8>
            </v-flex>
        </v-layout>
        <vc-data-table :data="tableList" @onCancelRequest="onCancelRequest"></vc-data-table>
        
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
    GET_ALL_TASK_DETAILS, CANCEL_REQUEST
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
                actions: [{'text':'cancel_request','key':"show_cancel_req", "cmpValue":true, selectType:"single"}, 
                ], //if we need conditional action in row then provide key
                sorting_type: CLIENT_SIDE,
                filterType: CLIENT_SIDE,
                paginationType: CLIENT_SIDE,
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
            record:{}
            
        }
    },
    components: {
        'vc-data-table': dataTable,
    },
    mounted() {
         this.getRequestList()
    },
    methods: {
        onCancelRequest(record){
			var client_id = this.$session.get('client_id')
			var data = {'client_id': client_id, 'request_id': record.id}
			var cancel_req_url = config.PROCESS_APPROVAL_URL + CANCEL_REQUEST
			postToServer(this, cancel_req_url, data).then(response => {
				if(response){
					this.snackbar = true
					this.colorValue = 'success'
					this.snackbartext = response;
					this.getRequestList()
				}
			}).catch(error_response => {
			if(error_response){
			}
			else {
				}
			});
        },
        getRequestList () {
			var user_name = this.$session.get('email')
			var get_task_list_url = config.PROCESS_APPROVAL_URL + GET_ALL_TASK_DETAILS + user_name
			getToServer(this, get_task_list_url).then(response => {
				var _this = this
				_this.tableList.rows = response
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
		}
    }
}
</script>
<style scoped>

</style>