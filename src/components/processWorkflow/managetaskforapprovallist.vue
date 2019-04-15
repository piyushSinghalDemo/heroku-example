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
						<td class="text-xs-left">{{ props.item.task_name }}</td>
						<td class="text-xs-left">{{ props.item.process_name }}</td>
						<td class="text-xs-left">{{ props.item.current_state }}</td>
						<td class="text-xs-left">{{ props.item.action_date }} {{ props.item.time_zone_preference }}</td>
						<td class="text-xs-left">
							<router-link :to="{ name: 'taskhistory', params: { task_id: props.item.id, task_name: props.item.task_name, process_type_name: props.item.process_name, current_status:  props.item.current_state}}">
								<a  style="cursor: pointer;">History</a>
							</router-link>
						</td>
						<td class="text-xs-left">
							<v-form v-model="valid" ref="update_task_form">
								<v-dialog v-model="dialog" width="400">
									<v-btn slot="activator" color="primary" v-show="props.item.button_check==true" dark @click="TaskUpdate(props.item,'accept')">Accept</v-btn>
									<v-btn slot="activator" color="error" v-show="props.item.button_check==true" dark @click="TaskUpdate(props.item,'reject')">Reject</v-btn>
									<v-btn slot="activator" color="error" v-show="props.item.is_blanket_approval=='True'" dark @click="RequestUpdate(props.item,'blanket_approved')">Blanket Approve</v-btn>

									<!-- <v-flex class="text-sm-right">
										<v-icon class="text-lg-left" @click="dialog = false" style="color:#dedede; height: 22px">fa-times-circle</v-icon>
									</v-flex> -->
									<v-flex>
										<v-card class="rounded-card">
											<v-toolbar dark dense absolute style="height:25%">
												<v-flex class="text-md-center">Task Name: {{props.item.task_name}}</v-flex>
											</v-toolbar>
											<!-- <v-container grid-list-md align-content-space-around> -->
											<v-flex class="text-md-center"></v-flex>
											<v-flex>
												<v-form class="text-center">
													<v-container fluid grid-list-md>
														<v-flex  style="margin-top:12%">
															<v-text-field label="Reason" v-model="reason" :rules="reasonRules" required></v-text-field>
														</v-flex>
														<v-btn color="success" large block @click="update_task_submit" :loading="loading" :disabled="loading"  @click.native="loader = 'loading'">
															Submit
														</v-btn>
													</v-container>
												</v-form>
											</v-flex>
										</v-card>
									</v-flex>
								</v-dialog>
								<!-- <v-dialog v-model="dialog" persistent max-width="500px">
									<v-btn slot="activator" color="primary" v-show="props.item.button_check==true" dark @click="TaskUpdate(props.item,'accept')">Accept</v-btn>
									<v-btn slot="activator" color="error" v-show="props.item.button_check==true" dark @click="TaskUpdate(props.item,'reject')">Reject</v-btn>
									<v-card>
										<v-card-title style="font-size: 20px;">Task Name: {{props.item.task_name}}</v-card-title>
										<v-divider></v-divider>
										<span class="headline" mt-4></span>
										<v-container grid-list-md>
											<v-layout wrap>
												<v-flex xs12 sm6 md6>
													<v-text-field label="Reason" v-model="reason" required :rules="reasonRules" style="font-size: 12px;"></v-text-field>
												</v-flex>
											</v-layout>
										</v-container>
										<v-divider></v-divider>
										<v-card-actions>
								            <v-spacer></v-spacer>
								            <v-btn color="blue darken-1" flat @click.native="dialog = false">Close</v-btn>
											<v-btn color="blue darken-1" flat @click="update_task_submit" :loading="loading" :disabled="loading"  @click.native="loader = 'loading'">Save</v-btn>
								        </v-card-actions>
									</v-card>
								</v-dialog> -->
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
					{ text: 'Task Name', value: 'task_name' },
					{ text: 'Process Type Name', value: 'process_name' },
					{ text: 'Current Status', value: 'current_state' },
					{ text: 'Action Date & Time', value: 'action_date' },
					{ text: 'Task History', value: 'task_history',sortable: false},
					{ text: 'Action', value: 'actions',sortable: false}
				],
				reasonRules:[
					v => !!v || 'Reason is required'
				],
			}
		},
		mounted () {
		  this.getTaskList()
		},
		methods: {
			getTaskList () {
				debugger
				var Authorization = this.$session.get('access_token')
				var user_id = this.$session.get('user_id')
				var user_process_details = this.$session.get('user_process_details')
				var user_name = this.$session.get('email')
				var button_check_status =  false
				var get_task_list_url = config.PROCESS_APPROVAL_URL + GET_ALL_TASK_DETAILS + user_name
				getToServer(this, get_task_list_url).then(response => {
					var _this = this
					this.TaskList = response
					debugger
					this.TaskList.map(function(obj,index){
						obj.is_blanket_approval = obj.is_blanket_approval
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
						if(obj.task_level == null && obj.current_state=='N/A' || obj.current_state=='')
						{
							obj.task_level = 0
						}
						if (obj.action == 'reject' &&  obj.task_level < obj.user_level)
						{
							var button_check_status = false
							obj.button_check = button_check_status;
						}  
						else if(obj.task_level == obj.user_level-1 || obj.task_level == obj.user_level )
						{
						var button_check_status = true
						obj.button_check = button_check_status;
						}              
						else
						{
						var button_check_status = false
						obj.button_check = button_check_status;
						}  
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
			TaskUpdate (task_obj, type) {
				this.reason = '',
				this.task_obj_id = task_obj.id,
				this.task_name = task_obj.task_name,
				this.task_id = task_obj.task_id,
				this.process_workflow_id = task_obj.process_workflow_id,
				this.level = task_obj.level
				this.task_action_type = type
				this.process_name = task_obj.process_name
			},
		  	update_task_submit () {
				if (this.$refs.update_task_form.validate()) {
					this.update_task()
				}
			},
			update_task() {
				const l = this.loader
				this[l] = !this[l]
				var user_id = this.$session.get('user_id') 
				if (this.task_action_type == 'accept')
					{
						var current_status = "accept"
					}
				else if (this.task_action_type == 'reject')
					{
						var current_status = "reject"
					}
				var update_task_url = config.PROCESS_APPROVAL_URL + UPDATE_TASK_DETAILS + this.task_obj_id
				var update_data = {
					"task_name": this.task_name,
					"process_name": this.process_name,
					"client_id": this.$session.get('client_id'),
					"action" : current_status,
					"remark": this.reason
					}
				postToServer(this, update_task_url, update_data).then(response =>{
				this.ShowSuccessMessage=true
				this.ShowErrorMessage=false
				this.SuccessMessage=response.current_state

				this.dialog = false
				this.getTaskList()
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