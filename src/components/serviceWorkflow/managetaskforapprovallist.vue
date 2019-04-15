<template>
	<div id="tasklist">
		<v-flex xs12>
			<v-card>
				<div class="inner-addon text-xs-right right-addon" style="margin-left:5px;">
					<div style="float:left;margin-top:7px;">
						<span style="color:rgba(0,0,0,0.54);font-weight:400;font-size:13px;"> Home /</span> &nbsp;<span style="font-weight:400;font-size:15px;">Manage Approval Task List</span>
					</div>
					<v-icon small class="glyphicon" style="color:#494949">
						fa-search
					</v-icon>
					<input type="text" v-model="search" placeholder="Type your search here" class="form-control" style="width:30%;float: right;margin-bottom:3px;margin-right:5px;margin-top:5px;"/>
				</div>
				<v-data-table :headers="headers" :items="TaskList" :search="search" rows-per-page-text ="Records per page" style="margin:5px;">
					<template slot="items" slot-scope="props">
						<td class="text-xs-left">{{ props.index + 1 }}</td>
						<td class="text-xs-left">{{ props.item.requester_type }}</td>
						<td class="text-xs-left">{{ props.item.object_name }}</td>
						<td class="text-xs-left">{{ props.item.request_status }}</td>
						<td class="text-xs-left">{{ props.item.created_by }} {{ props.item.time_zone_preference }}</td>
						<td class="text-xs-left">{{ props.item.created_date }} {{ props.item.time_zone_preference }}</td>
						<td class="text-xs-left">
							<router-link :to="{ name: 'requesthistory', params: { request_id: props.item.id, current_status:  props.item.request_status, workflow_name: props.item.workflow_name}}">
								<a style="cursor: pointer;">History</a>
							</router-link>
						</td>
						<td class="text-xs-left" style="">
							<v-form v-model="valid" ref="update_task_form">
								<v-dialog v-model="dialog" width="300">
									<v-btn slot="activator" color="primary" v-show="props.item.show_ar_btn==true" dark @click="RequestUpdate(props.item,'accept')">Accept</v-btn>
									<v-btn slot="activator" color="error" v-show="props.item.show_ar_btn==true" dark @click="RequestUpdate(props.item,'reject')">Reject</v-btn>
									<v-flex>
										<v-card class="rounded-card">
											<v-toolbar dark dense absolute style="height:25%">
												<v-flex class="text-md-center">Task Name: {{props.item.task_name}}</v-flex>
											</v-toolbar>
											<v-flex class="text-md-center"></v-flex>
											<v-flex>
												<v-form class="text-center">
													<v-container fluid grid-list-md>
														<v-flex  style="margin-top:12%">
															<v-text-field label="Reason" v-model="reason" :rules="reasonRules" required></v-text-field>
														</v-flex>
														<v-btn color="success" large block @click="update_request_submit" :loading="loading" 
															:disabled="loading"  @click.native="loader = 'loading'">
															Submit
														</v-btn>
													</v-container>
												</v-form>
											</v-flex>
										</v-card>
									</v-flex>
								</v-dialog>
							</v-form>
							<v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'>
								{{ snackbartext }}
							</v-snackbar>
						</td>
					</template>
					<v-alert slot="no-results" :value="true" color="error" icon="warning">
						Your search for "{{ search }}" found no results.
					</v-alert>
				</v-data-table>
			</v-card>
		</v-flex>
	</div>
</template>
<script>
	import config from '../../config.json'
	import { post as postToServer } from './../../methods/serverCall.js';
	import { get as getToServer } from './../../methods/serverCall.js';
	import {SERVER_ERROR} from '../../data/client_message.js'
	import {GET_ALL_TASK_DETAILS, UPDATE_TASK_DETAILS} from '../../data/url_constants.js'
	var moment = require("moment-timezone")
	export default {
		data () {
			return {
				snackbar:false,
				snackbartext:'',
				snackbartimeout:5000,
				colorValue:'error',
				loader: "loading",
				loading: false,
				valid: true,
				dialog: false,
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
				headers: [
					{ text: 'Sr.No.', value: 'index',sortable:false},
					{ text: 'Request For', value: 'requester_type' },
					{ text: 'Object name', value: 'object_name' },
					{ text: 'Current Status', value: 'request_status'},
					{ text: 'Requested By', value: 'created_by' },
					{ text: 'Requested Date', value: 'created_date' },
					{ text: 'Request History', value: 'request_history',sortable: false},
					{ text: 'Action', value: 'actions',sortable: false}
				],
				reasonRules:[
					v => !!v || 'Reason is required'
				],
			}
		},
		mounted () {
		  this.getRequestList()
		},
		methods: {
			getRequestList () {
				var Authorization = this.$session.get('access_token')
				var user_id = this.$session.get('user_id')
				var user_process_details = this.$session.get('user_process_details')
				var user_name = this.$session.get('email')
				var get_task_list_url = config.PROCESS_APPROVAL_URL + GET_ALL_TASK_DETAILS + user_name
				getToServer(this, get_task_list_url).then(response => {
					var _this = this
					this.TaskList = response
					this.TaskList.map(function(obj,index){
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
				this.task_name = task_obj.workflow_name,
				this.is_blanket_approval = task_obj.is_blanket_approval,
				this.created_by = task_obj.created_by
				this.task_action_type = type
				this.current_state = task_obj.current_state
				this.requester_code = task_obj.requester_code
				this.workflow_master_cloned_id = task_obj.workflow_master_cloned_id
				this.workflow_name = task_obj.workflow_name
				this.user_name = task_obj.user_name
				this.user_id = task_obj.user_id
				this.client_name = task_obj.client_name
				this.object_id = task_obj.object_id
			},
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
						var current_status = "accept"
					}
				else if (this.task_action_type == 'reject')
					{
						var current_status = "reject"
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
		}
	}
</script>
<style scoped>
.rounded-card{
    border-radius:5px;
}

.step-title-color{
    color:  #000000;
    text-decoration-color: "white"
}
</style>