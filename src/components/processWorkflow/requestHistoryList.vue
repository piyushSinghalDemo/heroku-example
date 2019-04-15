<template>
	<div id="tasklist">
		<v-flex xs12>
			<v-card>
				<div class="inner-addon text-xs-right right-addon" style="margin-left:5px;">
					<div style="float:left;margin-top:7px;">
						<span style="color:rgba(0,0,0,0.54);font-weight:400;font-size:13px;"> Home /</span> &nbsp;<span style="font-weight:400;font-size:15px;">Task History</span>
					</div>
				</div>
				<v-flex xs12 ml-2>
					<table cellpadding="0" cellspacing="0" border="0" class="table table-striped table-bordered" style="text-align: left;">
						<tbody>
							<tr>
								<td>Task Name</td><td>{{task_name}}</td>
							</tr>
							<tr>
								<td>Process Name</td><td>{{process_type_name}}</td>
							</tr>
							<tr>
								<td>Current Status</td><td>{{current_status}}</td>
							</tr>
						</tbody>
					</table>
				</v-flex>
				<v-data-table :headers="headers" :items="TaskHistoryList" :search="search" rows-per-page-text ="Records per page" style="margin:5px;">
					<template slot="items" slot-scope="props" id="taskList">
						<td class="text-xs-left">{{ props.index + 1 }}</td>
						<td class="text-xs-left">{{ props.item.action_by }}</td>
						<td class="text-xs-left">{{ props.item.level }}</td>
						<td class="text-xs-left">{{ props.item.action }}</td>
						<td class="text-xs-left">{{ props.item.action_date }}{{ props.item.time_zone_preference }}</td>
						<td class="text-xs-left">{{ props.item.remark }}</td>
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
	import { get as getToServer } from './../../methods/serverCall.js';
	import {SERVER_ERROR} from '../../data/client_message.js'
	import {GET_TASK_HISTORY} from '../../data/url_constants.js'
	var moment = require("moment-timezone")
  export default {
	data () {
	return {
		search: '',
		snackbar:false,
		snackbartext:'',
		snackbartimeout:5000,
		colorValue:'error',
		TaskHistoryList :[],
		task_name :'',
		current_status:'',
		process_type_name:'',
		headers: [
			{ text: 'Sr.No.', value: 'index',sortable:false},
			{ text: 'Approver Name', value: 'action_by' },
			{ text: 'Approver Level', value: 'level' },
			{ text: 'Action', value: 'action' },
			{ text: 'Action Date & Time', value: 'action_date',sortable: false},
			{ text: 'Remark', value: 'remark'}
		]	
		}
	},
	mounted () {
		this.task_name=this.$route.params.task_name
		this.process_type_name=this.$route.params.process_type_name
		this.current_status=this.$route.params.current_status
		if (this.$route.params.task_id) 
		{
			this.GetTaskHistory()
		} 
	},
	methods: {
		GetTaskHistory()
		{
			var time_zone = this.$session.get('time_zone_preference')
			var get_task_history_url = config.PROCESS_APPROVAL_URL + GET_TASK_HISTORY + this.$route.params.task_id
			getToServer(this, get_task_history_url).then(response => {
			this.TaskHistoryList = []
			this.TaskHistoryList = response
			data.map(function(obj, index){
				var dummyDate = moment(new Date(obj.action_date)).tz(time_zone).format('YYYY-MM-DD | HH:mm:ss');
				response[index].action_date = dummyDate;
				response[index].time_zone_preference = moment().tz(time_zone).format('zz');
				});
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
		}
	}
  }
</script>