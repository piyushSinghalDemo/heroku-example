<template>
    <v-container style="padding-top:0px;">
        <v-layout row wrap mr-1 ml-2>
            <v-flex class="text-xs-right" xs4 style="margin:auto">
                <ul class="breadcrumb">
                    <li>
                        <router-link to="/dashboard">Home</router-link>
                    </li>
                    <li>Task History</li>
                    <li>{{workflow_name}}</li>
                    <li>{{current_status}}</li>
                </ul>
            </v-flex>
            <v-flex xs8>
            </v-flex>
        </v-layout>
        <vc-data-table :data="tableList"></vc-data-table>
        
        <v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'>
            {{ snackbartext }}
        </v-snackbar>
    </v-container>
</template>
<script>
	import config from '../../config.json'
	import { get as getToServer } from './../../methods/serverCall.js';
	import {SERVER_ERROR} from '../../data/client_message.js'
	import {GET_REQUEST_HISTORY} from '../../data/url_constants.js'
	import {
    CLIENT_SIDE,
    SERVER_SIDE} from '@/data/macros.js'
	import dataTable from '../../views/dataTable/datatable.vue'
	var moment = require("moment-timezone")
  export default {
	data () {
	return {
		search: '',
		snackbar:false,
		snackbartext:'',
		snackbartimeout:5000,
		colorValue:'error',
		task_name :'',
		current_status:'',
		workflow_name:'',
              tableList: {
                headers: [
					{ text: 'Approver Name', value: 'action_by' },
					{ text: 'Action', value: 'action' },
					{ text: 'Action Date', value: 'timezone_aware_action_date',sortable: false},
					{ text: 'Action Time', value: 'timezone_aware_action_time',sortable: false},
					{ text: 'Remark', value: 'remark'}
                ],
                // actions: ['edit','execute','publish'],
                actions:[],//if we need conditional action in row then provide key
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
		this.workflow_name=this.$route.params.object_name
		this.current_status=this.$route.params.current_status
		if (this.$route.params.request_id) 
		{
			this.GetRequestHistory()
		} 
	},
	methods: {
		GetRequestHistory()
		{
			var time_zone = this.$session.get('time_zone_preference')
			var get_request_history_url = config.PROCESS_APPROVAL_URL + GET_REQUEST_HISTORY + this.$route.params.request_id
			getToServer(this, get_request_history_url).then(response => {
			debugger
			this.tableList.rows = response
			// this.tableList.rows.map(function(obj, index){
			// 	var dummyDate = moment(new Date(obj.action_date)).tz(time_zone).format('YYYY-MM-DD | HH:mm:ss');
			// 	this.tableList.rows[index].action_date = dummyDate;
			// 	this.tableList.rows[index].time_zone_preference = moment().tz(time_zone).format('zz');
			// 	});
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
		}
	}
  }
</script>