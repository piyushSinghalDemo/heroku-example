<template>
	<div id="PolicyList">
		<v-flex xs12>
			<v-card>
				<div class="inner-addon text-xs-right right-addon" style="margin-left:5px;">
					<div style="float:left;margin-top:7px;">
						<span style="color:rgba(0,0,0,0.54);font-weight:400;font-size:13px;"> Home /</span> &nbsp;<span style="font-weight:400;font-size:15px;">Policy List</span>
					</div>
					<div style="float:right;margin-top:7px;">
						<router-link :to="{ name: 'ManagePolicy'}">
							<v-btn color="primary" :loading="loading" :disabled="loading"  @click.native="loader = 'loading'">Add New Policy</v-btn>
						</router-link>
					</div>
				</div>
				<v-data-table :headers="headers" :items="AllPolicyList" :search="search" rows-per-page-text ="Records per page" style="margin:5px;">
					<template slot="items" slot-scope="props" id="PolicyList">
						<td class="text-xs-left">{{ props.index + 1 }}</td>
						<td class="text-xs-left">{{ props.item.policy_name }}</td>
						<!-- <td class="text-xs-left">{{ props.item.policy_type }}</td> -->
						<!-- <td class="text-xs-left">{{ props.item.policy_type_name }}</td> -->
						<!-- <td class="text-xs-left">{{ props.item.value }}</td> -->
						<td class="text-xs-left">{{ props.item.created_by }}</td>
						<td class="text-xs-left">{{ props.item.created_date }}</td>
						<td class="text-xs-left">
							<router-link :to="{ name: 'editPolicyDetails', params: { policy_id: props.item.id}}">
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
	import {GET_ALL_POLICY_LIST} from '../../data/url_constants.js'
	var moment = require("moment-timezone")
  export default {
	data () {
	return {
		search: '',
		loader: "loading",
		loading: false,
		snackbar:false,
		snackbartext:'',
		snackbartimeout:5000,
		colorValue:'error',
		AllPolicyList :[],
		headers: [
			{ text: 'Sr.No.', value: 'index',sortable:false},
			{ text: 'Policy Name', value: 'policy_name' },
			// { text: 'Policy Value Type', value: 'policy_type' },
			// { text: 'Policy Type', value: 'policy_type' },
			// { text: 'Policy Type', value: 'policy_type' },
			{ text: 'Created by', value: 'created_by' },
			{ text: 'Created Date', value: 'created_date' },
			{ text: 'Action', value: 'action' }
		]	
		}
	},
	mounted () {
		this.GetPolicyList()
	},
	methods: {
		GetPolicyList()
		{
			var client_id = this.$session.get('client_id')
			var get_all_policy_list_url = config.POLICY_URL + GET_ALL_POLICY_LIST + client_id
			getToServer(this, get_all_policy_list_url).then(response => {
			this.AllPolicyList = response
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