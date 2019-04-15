<template>
	<div id="add_workflow_template">
		<v-container grid-list-md text-xs-center>
			<ul class="breadcrumb">
			  <li>
				  <router-link to="/">Home</router-link>
				</li>
			  <li>
				  <router-link to="/addworkflowroute">Add Workflow Route</router-link>
			  </li>
			  <li><span style="font-weight:400;font-size:15px;"><input type="text" v-model='workflow_name'/></span></li>
			</ul>
			<v-form v-model="valid" ref="add_workflow_template_form" id="add_workflow_template_form">
				<v-card>
					<v-layout row wrap flex align-center justify-center>
						<v-flex xs6 class="text-xs-center">
							<v-layout row wrap v-for="(row, index) in rows">
								<v-flex xs11 pl-4 pr-4>
									<v-autocomplete
									:items="UsersList"
									item-text="username"
									v-model="row.approver_name"
									required
									:rules="[v => !!v || 'Approver '+ (index+1)+' is required.']" required
									:label="'Select Approver '+(index+1)"
									:id="'approver_name_'+(index+1)" ref="'approver_name_'+(index+1)"
									v-on:change="ValidateUser()" :disabled="disabled == 1 ? true : false" clearable @click:clear="clearMessage(row.approver_name)"></v-autocomplete>
								</v-flex>
								<v-flex xs1>
									<v-btn v-show='index > 0' name="remove" id="remove" color="error" v-on:click="removeElement(row);" >Remove</v-btn>
								</v-flex>
							</v-layout>
						</v-flex>
					</v-layout>
				</v-card>
				<v-layout row wrap mt-2>
					<v-flex xs12 class="text-xs-right">
						<v-btn color="primary" v-on:click="add_approver">Add Another Approver</v-btn>
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
	#adduser .v-input--checkbox, label {
	margin-top:2%;
	}
	#add_workflow_template_form .v-card{
		margin-top: 7px;
	}
</style>
<script>
	import config from '../../config.json'
	import { post as postToServer } from './../../methods/serverCall.js';
	import { get as getToServer } from './../../methods/serverCall.js';
	import {GET_ALL_ACTIVE_USERS_LIST, WORKFLOW_TEMPLATE_LIST, GET_WORKFLOW_TEMPLATE_DETAILS, UPDATE_WORKFLOW_TEMPLATE} from '../../data/url_constants.js'
	import {SERVER_ERROR} from '../../data/client_message.js'
	import orderBy from 'lodash/orderBy'
	export default {
	  data () {
		  return {
			disabled: 0,
			snackbar:false,
			snackbartext:'',
			snackbartimeout:5000,
			colorValue:'error',
			loader: "loading",
			loading: false,
			workflow_name: 'Untitled Workflow name',
			rows: [
				{ approver_name: ''},
			  ],
			valid: true,
			approver_name: null,
			UsersList: [],
			workflowNameRules:[
			  v => !!v || 'Workflow Name is required'
			],
			levelRules:[
			  v => !!v || 'This value is required.'
			],
		  }
		},
		mounted () {
			this.getUserList()
			if (this.$route.params.workflow_id) 
			{
				this.GetWorkflowDetailsById()
			}
			this.sort_approver_name();
		},
		
		methods: {
			submit () {
				if (this.$refs.add_workflow_template_form.validate()) {
					this.save()
				}
			},
			save () {	
				if (this.$route.params.workflow_id) 
				{
				  this.updateworkflowRoute()
				} 
				else 
				{
				  this.addworkflowRoute()
				}
			},
			clear () {
				this.ShowErrorMessage = false
				this.$refs.add_workflow_template_form.reset()
				this.reset_approver()
			},
			add_approver: function() {
				this.rows.push({});
			},
			removeElement: function (row) 
			{
				this.enable_removed_approver(row.approver_name);
				var index = this.rows.indexOf(row);
				this.rows.splice(index, 1);
			},
			enable_removed_approver(approver_name){
				for (var each in this.UsersList)
				{
					if (this.UsersList[each].username == approver_name)
					{
						this.UsersList[each]["disabled"] = 0;
					}
				}
				this.sort_approver_name()
			},
			sort_approver_name(){
				this.UsersList = orderBy(this.UsersList, 'disabled','asc');
				console.log(JSON.stringify(this.UsersList));
			},
			reset_approver(){
				for (var each in this.UsersList)
				{
					this.UsersList[each]["disabled"] = 0;
				}
			},
			clearMessage (approver_name) {
				this.enable_removed_approver(approver_name);
			},
			getUserList (){
				var client_id = this.$session.get('client_id')
				var get_user_url = config.USER_PROVISION_URL + GET_ALL_ACTIVE_USERS_LIST + client_id
				getToServer(this, get_user_url).then(response => {
					var user_details = response
					for (var i = 0; i< user_details.length; i++)
						{
							var updated_dict = user_details[i]
							updated_dict['disabled'] = 0
							this.UsersList.push(updated_dict)
							
						};
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
			ValidateUser()
			{
				this.reset_approver()
				for (var each in this.UsersList)
				{
					for (var row in this.rows){
						if (this.UsersList[each].username == this.rows[row].approver_name)
						{
							this.UsersList[each]["disabled"] = 1;
						}
					}
						
				}
				this.sort_approver_name()
			},
			addworkflowRoute(){
				const l = this.loader
				this[l] = !this[l]
				var client_id = this.$session.get('client_id')
				for (let i=0; i<this.rows.length; i++)
				{
					this.$set(this.rows[i], 'level', i+1);
				}
				var workflow_data = {
					'client_id': client_id,
					'workflow_level_list': this.rows,
					'workflow_name': this.workflow_name
				}
				var add_workflow_template_end_point = config.PROCESS_APPROVAL_URL + '/workflow/add'
				postToServer(this, add_workflow_template_end_point, workflow_data).then(addResponse  => {
						this.$router.push(WORKFLOW_TEMPLATE_LIST)
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
			GetWorkflowDetailsById () {
				var get_workflow_url = config.PROCESS_APPROVAL_URL + GET_WORKFLOW_TEMPLATE_DETAILS + this.$route.params.workflow_id
				getToServer(this, get_workflow_url).then(response => {
					if(this.$route.params.workflow_id){
						this.workflow_name = response.workflow_name.trim()
						this.rows = response.workflow_level_list
					}
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
			updateworkflowRoute () {
				const l = this.loader
				this[l] = !this[l]
				var client_id = this.$session.get('client_id')
				var user_id = this.$session.get('user_id')
				var update_workflow_url = config.PROCESS_APPROVAL_URL + UPDATE_WORKFLOW_TEMPLATE + this.$route.params.workflow_id
				var update_data = {
					'client_id': client_id,
					'workflow_level_list': this.rows,
					'workflow_name': this.workflow_name}
				postToServer(this, update_workflow_url, update_data).then(response => {
					this.$router.push(WORKFLOW_TEMPLATE_LIST)
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
			}
		}
	}
</script>