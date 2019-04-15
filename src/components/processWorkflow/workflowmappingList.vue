<template>
	<div id="tasklist">
		<v-flex xs12>
			<v-card>
				<div class="inner-addon text-xs-right right-addon" style="margin-left:5px;">
					<div style="float:left;margin-top:7px;">
						<span style="color:rgba(0,0,0,0.54);font-weight:400;font-size:13px;"> Home /</span> &nbsp;<span style="font-weight:400;font-size:15px;">Workflow Mapping List</span>
					</div>
					<v-icon small class="glyphicon" style="color:#494949">
					fa-search
					</v-icon>
					<input type="text" v-model="search" placeholder="Type your search here" class="form-control" style="width:30%;float: right;margin-bottom:3px;margin-right:5px;margin-top:5px;"/>
				</div>
				<v-data-table :headers="headers" :items="workflow_apping_list" :search="search" rows-per-page-text ="Records per page" style="margin:5px;">
					<template slot="items" slot-scope="props" id="workflow_apping_list">
						<td class="text-xs-left">{{ props.index + 1 }}</td>
						<td class="text-xs-left">{{ props.item.process_name }}</td>
						<td class="text-xs-left">{{ props.item.workflow_name }}</td>
						<td class="text-xs-left">
							<table bordered>
								<thead>
									<tr>
										<th>Sr. No</th>
										<th>Approver name</th>
									</tr>
								</thead>
								<tbody>
									<tr v-for="i in props.item.workflow_level_list">
										<td>{{i.level}}</td>
										<td>{{i.approver_name}}</td>
									</tr>
								</tbody>
							</table>
						</td>
						<td class="text-xs-left">

							<v-icon small class="mr-2" style="color:#494949">
							  fa-copy
							</v-icon>
							<router-link :to="{ name: 'editWorkflowMapping', params: { id: props.item.id}}">
								<v-icon small class="mr-2" style="color:#494949">fa-edit</v-icon>
							</router-link>
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
	import { get as getToServer } from './../../methods/serverCall.js';
	import {SERVER_ERROR} from '../../data/client_message.js'
	import {GET_PROCESS_WORKFLOW_MAPPING} from '../../data/url_constants.js'

  export default {
	data () {
	  return {
		search: '',
		snackbar:false,
		snackbartext:'',
		snackbartimeout:5000,
		colorValue:'error',
		pagination: {},
		workflow_apping_list: [],
		headers: [
		  { text: 'Sr.No.', value: 'index',sortable:false},
		  { text: 'Process Name', value: 'process_name' },
		  { text: 'Workflow Name', value: 'workflow_name' },
		  { text: 'Approver Details', value: 'workflow_level_list'},
		  { text: 'Action', value: 'actions',sortable: false}
		]
	  }
	},
	mounted () {
		this.getWorkflowMappingList()
	},
	methods: {
		getWorkflowMappingList () {
		var get_workflow_mapping_url = config.PROCESS_APPROVAL_URL +GET_PROCESS_WORKFLOW_MAPPING + this.$session.get('client_id')
		getToServer(this, get_workflow_mapping_url).then(response => {
				this.workflow_apping_list = response
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
	}
  }
</script>