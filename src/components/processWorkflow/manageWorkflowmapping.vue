<template>
	<div id="add_workflow_template">
		<v-container grid-list-md text-xs-center>
			<ul class="breadcrumb">
				<li><a href="/">Home</a></li>
				<li><a href="/addworkflowmapping">Add Workflow Mapping Process</a></li>
			</ul>
			<v-form v-model="valid" ref="add_workflow_mapping_form" style="margin-top: 2px;">
				<v-card>
					<v-layout row wrap flex align-center justify-center>
						<v-flex xs6 class="text-xs-center">
							<v-layout row wrap>
								<v-flex xs11 pl-4 pr-4>
									<v-autocomplete clearable v-model="process_id" label="Select Process Name" :rules="processNameRules" required :items="ProcessList" item-text="process_name" item-value="id"></v-autocomplete>
								</v-flex>
								<v-flex xs11 pl-4 pr-4>
									<v-autocomplete clearable v-model="workflow_id" label="Select Workflow Name" :rules="workflowNameRules" required :items="WorkflowList" item-text="workflow_name" item-value="id"></v-autocomplete>
								</v-flex>
							</v-layout>
						</v-flex>
					</v-layout>
				</v-card>
				<v-layout row wrap mt-2>
					<v-flex xs12 class="text-xs-right">
						<v-btn color="primary" @click="submit" :loading="loading" :disabled="loading"  @click.native="loader = 'loading'">Save</v-btn>
						<v-btn color="primary" @click="clear" style="margin-right: 0px;">Cancel</v-btn>
					</v-flex>
				</v-layout>
			</v-form>
			<v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'>
				{{ snackbartext }}
			</v-snackbar>
		</v-container>
	</div>
</template>
<style scoped>
	.v-text-field.v-text-field--solo .v-input__control{
	min-height: 20px;
	}
</style>
<script>
	import config from '../../config.json'
	import { post as postToServer } from './../../methods/serverCall.js';
	import { get as getToServer } from './../../methods/serverCall.js';
	import {SERVER_ERROR} from '../../data/client_message.js'
	import {GET_ALL_PROCESS_LIST, GET_ALL_WORKFLOW_LIST, ADD_WORKFLOW_MAPPING, GET_WORKFLOW_MAPPING_DETAILS, WORKFLOW_MAPPING_LIST, UPDATE_WORKFLOW_MAPPING_DETAILS} from '../../data/url_constants.js'
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
			processNameRules:[
				v => !!v || 'Process Name is required'
			],
			workflowNameRules:[
				v => !!v || 'Workflow Name is required.'
			],
			ProcessList: [],
			WorkflowList: [{"id":"Select Workflow Name", "workflow_name":"Select Workflow Name"}],
			process_id : "",
			workflow_id : "",
			ShowErrorMessage:false,
			ErrorTitle:'',
			ErrorMessage:''
			}
		},
		mounted () {
			this.getProcessList(),
			this.getWorkflowList()
			if (this.$route.params.id) 
			{
				this.GetWorkflowMappingDetailsById()
			} 
		},
		methods: {
			submit () {
				if (this.$refs.add_workflow_mapping_form.validate()) {
					this.save()
				}
			},
			save () {	
				if (this.$route.params.id) 
				{
					this.updateWorkflowMappingData()
				} 
				else 
				{
					this.saveWorkflowMappingData()
				}
			},
			clear () {
				this.$refs.add_workflow_mapping_form.reset()
			},
			getProcessList () {
				var get_process_list_url = config.PROCESS_APPROVAL_URL + GET_ALL_PROCESS_LIST
				getToServer(this, get_process_list_url).then(response => {
					this.ProcessList = response
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
			getWorkflowList () {
				var client_id = this.$session.get('client_id')
				var get_workflow_list_url = config.PROCESS_APPROVAL_URL + GET_ALL_WORKFLOW_LIST + client_id
				getToServer(this, get_workflow_list_url).then(response => {
					this.WorkflowList = response
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
			saveWorkflowMappingData () {
				const l = this.loader
				this[l] = !this[l]
				var client_id = this.$session.get('client_id')
				var add_workflow_mapping_url = config.PROCESS_APPROVAL_URL + ADD_WORKFLOW_MAPPING
				var workflow_mapping_data = {
					'client_id': client_id,
					'process_id': this.process_id,
					'workflow_id': this.workflow_id
				}
				postToServer(this, add_workflow_mapping_url, workflow_mapping_data).then(addResponse  => {
						this.$router.push(WORKFLOW_MAPPING_LIST)
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
			GetWorkflowMappingDetailsById () {
			var get_workflow_mapping_url = config.PROCESS_APPROVAL_URL + GET_WORKFLOW_MAPPING_DETAILS + this.$route.params.id
			getToServer(this, get_workflow_mapping_url).then(response => {
				this.process_id = response.process_id
				this.workflow_id = response.workflow_id
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
			updateWorkflowMappingData () {
				const l = this.loader
				this[l] = !this[l]
				var client_id = this.$session.get('client_id')
				var update_data_url = config.PROCESS_APPROVAL_URL + UPDATE_WORKFLOW_MAPPING_DETAILS + this.$route.params.id
				var update_data =  {
				'client_id': client_id,
				'process_id': this.process_id,
				'workflow_id': this.workflow_id}
				postToServer(this, update_data_url, update_data).then(response => {
					this.$router.push(WORKFLOW_MAPPING_LIST)
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