<template>
	<div id="tasklist">
		<v-flex xs12>
			<v-card>
				<div class="inner-addon text-xs-right right-addon" style="margin-left:5px;">
				<div style="float:left;margin-top:7px;">
					<span style="color:rgba(0,0,0,0.54);font-weight:400;font-size:13px;"> Home /</span> &nbsp;<span style="font-weight:400;font-size:15px;">Task</span>
					</div>
					<v-icon small class="glyphicon" style="color:#494949">
					fa-search
					</v-icon>
				<input type="text" v-model="search" placeholder="Type your search here" class="form-control" style="width:30%;float: right;margin-bottom:3px;margin-right:5px;margin-top:5px;"/>
				</div>
				<v-data-table :headers="headers" :items="tasklist" :search="search" rows-per-page-text ="Records per page" style="margin:5px;">
				<template slot="items" slot-scope="props">
					<td class="text-xs-left">{{ props.index + 1 }}</td>
					<td class="text-xs-left">{{ props.item.task_name }}</td>
					<td class="text-xs-left">{{ props.item.process_type }}</td>
					<td class="text-xs-left">{{ props.item.current_status }}</td>
					<td class="text-xs-left">{{ props.item.action_date }}</td>
					<td class="text-xs-left">{{ props.item.task_history }}</td>
					<td class="text-xs-left">
						<v-icon small class="mr-2" style="color:#494949">
						  fa-copy
						</v-icon>
						<v-icon small class="mr-2" style="color:#494949">            
						  fa-edit
						</v-icon>
						<v-icon small style="color:#494949">
						  fa-trash-alt
						</v-icon>
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
	import {TASK_TOKEN_VERIFY, UPDATE_TASK} from '../../data/url_constants.js'
	import {SERVER_ERROR} from '../../data/client_message.js'
	export default {
		data () {
			return {
				search: '',
				snackbar:false,
				snackbartext:'',
				snackbartimeout:5000,
				colorValue:'error',
				loader: "loading",
				loading: false,
				pagination: {},
				headers: [
					{ text: 'Sr.No.', value: 'index',sortable:false},
					{ text: 'Task Name11', value: 'task_name' },
					{ text: 'Process Type Name', value: 'process_type' },
					{ text: 'Current Status', value: 'current_status' },
					{ text: 'Action Date & Time', value: 'action_date' },
					{ text: 'Task History', value: 'task_history',sortable: false},
					{ text: 'Action', value: 'actions',sortable: false}
				],
				tasklist: []
			}
		},
		mounted () {
		  this.tokenverify()
		},
		methods: {
			tokenverify(){
				var token_verify_url = config.PROCESS_APPROVAL_URL +TASK_TOKEN_VERIFY + this.$route.query.token
				getToServer(this, token_verify_url).then(response => {
				var _this = this;
				var button_check_status =  false
				this.TaskList.push(data)
				this.TaskList.map(function(obj,index){
					if(obj.task_level == null && obj.current_state=='N/A' || obj.current_state=='')
					{
						obj.task_level = 0
					}
					if (obj.action == 'reject' &&  obj.task_level < obj.user_level)
					{
						var button_check_status = false
						obj.button_check = button_check_status;
					}else if(obj.task_level == obj.user_level-1 || obj.task_level == obj.user_level )
					{
						var button_check_status = true
						obj.button_check = button_check_status;
					}else{
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
			validateBeforeSubmit (e) {
				var instance = $('#update_task').parsley()
				if (instance.isValid() === true) 
				{
					this.update_task()
				}else{
					console.log(instance.isValid())
				}
			},
			update_task() {
			const l = this.loader
			this[l] = !this[l]
			if (this.task_action_type == 'accept')
			{
				var current_status = "accept"
			}
			else if (this.task_action_type == 'reject')
			{
				var current_status = "reject"
			}
			var update_task_url = config.PROCESS_APPROVAL_URL + UPDATE_TASK + this.task_obj_id
			var updated_data = {
				"task_id": this.task_id,
				"task_name":this.task_name,
				"process_name":this.process_name,
				"level":this.level,
				"client_id":this.client_id,
				"action" : current_status,
				"remark": this.reason,
				"user_name":this.user_name,
				"organization_name": this.organization_name
			}
			postToServer(this, update_task_url, updated_data).then(
				response => {
				var data = JSON.parse(response.bodyText);
				$("#task_reason").modal('hide');
				this.$router.push("/login")
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
