<template>
    <v-container style="padding-top:0px;">
        <v-layout row wrap mr-1 ml-2>
            <v-flex class="text-xs-right" xs4 style="margin:auto">
                <ul class="breadcrumb">
                    <li>
                        <router-link to="/dashboard">Home</router-link>
                    </li>
                    <li>My Approvals</li>
                </ul>
            </v-flex>
            <v-flex xs8>
            </v-flex>
        </v-layout>
        <vc-data-table :data="tableList" @onAccept="onAccept" @onRevokeRequest="onRevokeRequest"></vc-data-table>
        <v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'>
            {{ snackbartext }}
        </v-snackbar>
            <v-dialog v-model="dialog" width="300">
               <v-form v-model="valid" ref="update_task_form">
                <v-flex>
                    <v-card class="rounded-card">
                        <v-toolbar dark dense absolute style="height:25%">
                            <v-flex class="text-md-center">Task Name: {{task_name}}</v-flex>
                        </v-toolbar>
                        <v-flex class="text-md-center"></v-flex>
                        <v-flex>
                            <v-form class="text-center">
                                <v-container fluid grid-list-md>
                                    <v-flex  style="margin-top:12%">
                                        <v-text-field label="User comments" v-model="reason" :rules="reasonRules" required></v-text-field>
                                    </v-flex>
                                    <v-btn color="success" large block @click="update_request_submit" :loading="loading" :disabled="loading"  @click.native="loader = 'loading'">
                                        Submit
                                    </v-btn>
                                </v-container>
                            </v-form>
                        </v-flex>
                    </v-card>
                </v-flex>
		       </v-form>
            </v-dialog>
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
    GET_ALL_TASK_DETAILS, UPDATE_TASK_DETAILS, GET_ALL_APPROVALS
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
                actions: [{'text':'revoke_request','key':"show_ar_btn","cmpValue":true, selectType:"single"},
                          {'text':'accept','key':"show_ar_btn","cmpValue":true, selectType:"single"}
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
        update_request_submit () {
			if (this.$refs.update_task_form.validate()) {
				this.update_task()
			}
		},
		update_task() {
			const l = this.loader
			this[l] = !this[l]
			var user_id = this.$session.get('user_id') 
			if (this.task_action_type == 'accept' || this.task_action_type == 'blanket_approved')
				{
					var current_status = "accepted"
				}
			else if (this.task_action_type == 'reject')
				{
					var current_status = "rejected"
				}
			var update_task_url = config.PROCESS_APPROVAL_URL + UPDATE_TASK_DETAILS + this.task_obj_id

			var updated_data = {
				"action": current_status,
				"remark": this.reason,
				"client_id": this.$session.get('client_id'),
				"user_name":this.user_name,
				"user_id":this.user_id,
				"client_name": this.client_name,
				"node_id_from_email": this.node_id,
				"workflow_master_cloned_id": this.workflow_master_cloned_id,
				"object_id": this.object_id,
				"is_blanket_approval": this.is_blanket_approval,
				"remark": this.reason,
				"workflow_name": this.workflow_name
			}
			postToServer(this, update_task_url, updated_data).then(response =>{
				this.dialog = false
			this.ShowSuccessMessage=true
			this.ShowErrorMessage=false
			this.SuccessMessage=response.current_state
			this.snackbar = true
				this.colorValue = 'success'
				this.snackbartext = response;
				this.getRequestList()
			}).catch(error_response => {
			if(error_response){
				this.snackbar = true
				this.colorValue = 'error'
				this.snackbartext = error_response;
				this[l]  = false
				this.loader = null
			}
			else {
				this.snackbar = true
				this.colorValue = 'error'
				this.snackbartext = SERVER_ERROR;
				this[l]  = false
				}
			});
		},
        onAccept(record){
        	this.task_name = record.task_name
        	this.dialog = true
            this.record = record;
            this.RequestUpdate(record,'accept');
        },
        onRevokeRequest(record){
        	this.task_name = record.task_name
        	this.dialog = true
            this.record = record;
            this.RequestUpdate(record,'reject');
        },
        onRequestHistory(record){
        	this.$router.push({ name: 'requesthistory', params: { request_id: record.id, current_status:  record.request_status, object_name: record.object_name}})
        },
        getRequestList () {
				var Authorization = this.$session.get('access_token')
				var user_id = this.$session.get('user_id')
				var user_process_details = this.$session.get('user_process_details')
				var user_name = this.$session.get('email')
				var get_task_list_url = config.PROCESS_APPROVAL_URL + GET_ALL_APPROVALS + user_name
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
		},
		RequestUpdate (task_obj, type) {
			this.reason = '',
			this.task_obj_id = task_obj.id,
			this.node_id = task_obj.recent_node_id
			this.task_name = task_obj.object_name,
			this.is_blanket_approval = task_obj.is_blanket_approval,
			this.created_by = task_obj.created_by
			this.task_action_type = type
			this.current_state = task_obj.current_state
			this.requester_code = task_obj.requester_code
			this.workflow_master_cloned_id = task_obj.workflow_master_cloned_id
			this.object_name = task_obj.object_name
			this.user_name = task_obj.user_name
			this.user_id = task_obj.user_id
			this.client_name = task_obj.client_name
			this.object_id = task_obj.object_id
		},
    }
}
</script>
<style scoped>

</style>