
<template>
    <v-container id="taskApproval" style="padding-top:0px;background:white" :style="{'height':cHeight}">
    <!-- height: {{cHeight}} -->
        <v-layout row wrap mr-1 ml-2>
            <v-flex class="text-xs-right" xs4 style="margin:auto">
                <ul class="breadcrumb">
                    <li>
                        <router-link to="/dashboard">Home</router-link>
                    </li>
                    <li>Manage Approval Task List</li>
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
	import config from '../../config.json'
	import { post as postToServer } from './../../methods/serverCall.js';
	import { get as getToServer } from './../../methods/serverCall.js';
	import {TASK_TOKEN_VERIFY, UPDATE_SERVICE_WORKFLOW} from '../../data/url_constants.js'
	import {SERVER_ERROR} from '../../data/client_message.js'
	import dataTable from '@/views/dataTable/datatable.vue'
	import {
    CLIENT_SIDE,
    SERVER_SIDE
} from '@/data/macros.js'
	export default {

		data () {
			return {
				cHeight:"500px",
				search: '',
				snackbar:false,
				snackbartext:'',
				snackbartimeout:5000,
				colorValue:'error',
				loader: "loading",
				loading: false,
				pagination: {},
			
				TaskList: [],
				node_id: null,
				workflow_master_cloned_id: null,
				object_id: null,
				servie_request_id: null,
				reason: null,
				dialog: false,
				dialog2: false,
				valid: '',
				client_id: null,
				accepted: false,
				is_blanket_approval: false,
				task_name: null,
				reasonRules:[
				v => !!v || 'User comments is required'
            	],
            	 tableList: {
                headers: [
					{ text: 'Request For', value: 'requester_desc' },
					{ text: 'Description', value: 'request_desc' },
					{ text: 'Current Status', value: 'request_status'},
					{ text: 'Requested By', value: 'created_by' },
					{ text: 'Requested Date', value: 'created_date' }
                ],
                actions: [{'text':'revoke_request','key':"show_ar_btn","cmpValue":true},
                          {'text':'accept','key':"show_ar_btn","cmpValue":true} 
                ], //if we need conditional action in row then provide key
                sorting_type: CLIENT_SIDE,
                filterType: CLIENT_SIDE,
                paginationType: CLIENT_SIDE,
                total_count: 0,
                rows: []
                
            },
			}
		},
		components: {
	        'vc-data-table': dataTable,
	        
	    },
		mounted () {
		  this.cHeight = window.innerHeight-70 +'px';
		  this.tokenverify()
		},
		methods: {
			update_request_submit () {
				if (this.$refs.update_task_form.validate()) {
					this.update_task()
				}
			},
			tokenverify(){
				var token_verify_url = config.PROCESS_APPROVAL_URL +TASK_TOKEN_VERIFY + this.$route.query.token
				getToServer(this, token_verify_url, true).then(response => {
				var _this = this;
				var button_check_status =  false
				this.TaskList.push(response)
				debugger
				this.tableList.rows = this.TaskList
				this.node_id = response['node_id']
				this.workflow_master_cloned_id = response['workflow_master_cloned_id']
				this.object_id = response['object_id']
				this.object_name = response['object_name']
				this.user_name = response['user_name']
				this.user_id = response['user_id']
				this.client_name = response['client_name']
				this.node_id_from_email = response['node_id_from_email']
				this.is_blanket_approval = response['is_blanket_approval']
				this.tableList.rows.map(function(obj,index){
					obj.button_check = true
					obj.is_blanket_approval = obj.is_blanket_approval
					// if( obj.current_state=='N/A' || obj.current_state=='')
					// {
					// 	obj.task_level = 0
					// }
					// if (obj.action == 'reject')
					// {
					// 	var button_check_status = false
					// 	obj.button_check = button_check_status;
					// }else if(obj.task_level == obj.user_level-1 || obj.task_level == obj.user_level )
					// {
					// 	var button_check_status = true
					// 	obj.button_check = button_check_status;
					// }else{
					// 	var button_check_status = false
					// 	obj.button_check = button_check_status;
					// 	}  
					})  
				}).catch(error_response => {
				if(error_response){
					this.snackbar = true
					this.colorValue = 'error'
					this.snackbartext = error_response;
				}
				else {
					this.snackbar = true
					this.colorValue = 'error'
					this.snackbartext = SERVER_ERROR;
					}
				});
			},
			validateBeforeSubmit (e) {
				var instance = $('#update_task').parsley()
				if (instance.isValid() === true) 
				{
					this.update_task()
				}else{
					console.log(instance.isValid())
				}
			},
			onAccept(record){
				debugger
	        	this.task_name = record.object_name
	        	this.dialog = true
	            this.record = record;
	            this.RequestUpdate(record,'accept');
	        },
	        onRevokeRequest(record){
	        	debugger
	        	this.task_name = record.object_name
	        	this.dialog = true
	            this.record = record;
	            this.RequestUpdate(record,'reject');
	        },
			RequestUpdate (req_obj, type) {
				if(type == 'accept'){
					this.accepted = true
				}else if(type == 'blanket_approved'){
					this.is_blanket_approval = true
				}
				this.reason = '',
				this.servie_request_id = req_obj.id,
				this.client_id = req_obj.client_id,
				this.workflow_name = req_obj.workflow_name,
				this.workflow_master_cloned_id = req_obj.workflow_master_cloned_id,
				this.object_id = req_obj.object_id
				this.object_name = req_obj.object_name
				this.process_name = req_obj.process_name
				this.task_action_type = type
				this.user_name = req_obj.user_name
				this.requester_code = req_obj.requester_code
				this.created_by = req_obj.created_by
				this.created_date = req_obj.created_date
			},
			update_task() {
			const l = this.loader
			this[l] = !this[l]
			if (this.task_action_type == 'accept' || this.is_blanket_approval)
			{
				var current_status = "accepted"
			}
			else if (this.task_action_type == 'reject')
			{
				var current_status = "rejected"
			}
			var update_task_url = config.PROCESS_APPROVAL_URL + UPDATE_SERVICE_WORKFLOW + this.servie_request_id
			var updated_data = {
				"action": current_status,
				"remark": this.reason,
				"client_id":this.client_id,
				"user_name":this.user_name,
				"user_id":this.user_id,
				"client_name": this.client_name,
				"node_id_from_email": this.node_id_from_email,
				"workflow_master_cloned_id": this.workflow_master_cloned_id,
				"object_id": this.object_id,
				"object_name": this.object_name,
				"is_blanket_approval": this.is_blanket_approval,
				"requester_code": this.requester_code,
				"workflow_name": this.workflow_name,
				"created_by": this.created_by,
				"created_date": this.created_date,
			}
			debugger
			postToServer(this, update_task_url, updated_data, true).then(
				response => {
				this.dialog = false
				this.dialog2 = false
				this.snackbar = true
				this.colorValue = 'success'
				this.snackbartext = response;
				this[l]  = false
				this.loader = null
				// var data = JSON.parse(response.bodyText);
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
			MessageClosed(MessageType){
				this.ShowErrorMessage=false
				this.ErrorMessage=''
				this.ShowSuccessMessage= false
			},
		}
	}
</script>
<style>

.v-datatable thead th.column {
	cursor: pointer;
	outline: 0;
	color: white;
	background-color:#494949;
}

.theme--light .v-datatable thead th.column.sortable:hover {
	color: white;

}
.theme--light .v-datatable thead th.column.sortable.active
{
  color:white;
}

.theme--light .v-datatable thead th.column.sortable.active i{
font-weight:bold;
color: white;
}


.v-datatable thead th.column.sortable:focus i, .v-datatable thead th.column.sortable:hover i {
	opacity: .6;
}


.theme--light .v-datatable thead th.column.sortable i {
	font-weight:bold;
	color: white;
}
tr:nth-child(even) {background-color: #E8E8E8;}
/* tr:hover td {background:#A9A9A9;} */
.theme--light .v-datatable .v-datatable__actions {
  color:rgba(0,0,0,0.87);
}
.theme--light .v-chip {
  background:#FFFFFF;
}
/* enable absolute positioning */
.inner-addon { 
   position: relative; 
}

/* style icon */
.inner-addon .glyphicon {
  position: absolute;
  padding: 10px;
  pointer-events: none;
}

/* align icon */
.right-addon .glyphicon { right: 0px;}

</style>
