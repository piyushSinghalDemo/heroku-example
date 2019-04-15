<template>
  	<div id="tasklist">
		<v-flex xs12>
		  	<v-card>
				<div class="inner-addon text-xs-right right-addon" style="margin-left:5px;">
				<div style="float:left;margin-top:7px;">
					<span style="color:rgba(0,0,0,0.54);font-weight:400;font-size:13px;"> Home /</span> 
						&nbsp;<span style="font-weight:400;font-size:15px;">Workflow</span>
					</div>

					<v-icon small class="glyphicon" style="color:#494949">
					fa-search
					</v-icon>
					<router-link :to="{ name: 'workflowide'}">
						<v-btn style="float: right;" color="primary" :loading="loading" :disabled="loading">Add Workflow</v-btn>
					</router-link>
					<input type="text" v-model="search" placeholder="Type your search here" class="form-control" style="width:30%;float: right;margin-right:5px;margin-top:5px;"/>
				</div>

				<v-data-table :headers="headers" :items="taskList" :search="search" rows-per-page-text ="Records per page" style="margin:5px;">
				<template slot="items" slot-scope="props" id="taskList">
				  	<td class="text-xs-left">{{ props.index + 1 }}</td>
				  	<td class="text-xs-left">{{ props.item.workflow_name }}</td>
				  	<td class="text-xs-left">{{ props.item.created_by }}</td>
				  	<td class="text-xs-left">{{ props.item.created_date }}</td>
				  	<td class="text-xs-left">
						<v-tooltip bottom >
              <v-icon slot="activator" class="iconFormat" >fa-copy</v-icon>
            <span>Copy</span>
            </v-tooltip>
						<router-link :to="{ name: 'workflowide', params: { workflow_id: props.item.id}}">
							<v-tooltip bottom>
                    <v-icon slot="activator" class="iconFormat">fa-edit</v-icon>
                    <span>Edit</span>
                </v-tooltip>
						</router-link>
						<v-tooltip bottom>
                <v-icon slot="activator" class="iconFormat">fa-trash-alt</v-icon>
                <span>Delete</span>
              </v-tooltip>
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
  	import {GET_PROCESS_WORKFLOW} from '../../data/url_constants.js'
  	import {SERVER_ERROR} from '../../data/client_message.js'
	export default {
		data () {
		  return {
			search: '',
			snackbar:false,
			snackbartext:'',
			snackbartimeout:5000,
			colorValue:'error',
			pagination: {},
			headers: [
			  { text: 'Sr.No.', value: 'index',sortable:false},
			  { text: 'Workflow Name', value: 'workflow_name' },
			  { text: 'Created By', value: 'created_by' },
			  { text: 'Created Date', value: 'created_date' },
			  { text: 'Action', value: 'actions',sortable: false}
			],
			taskList: []
		  }
		},
		mounted () {
	      this.getWorkflowList()
	    },
		methods:{
			getWorkflowList () {
			var user_id = this.$session.get('user_id')
			var get_workflow_list_url = config.PROCESS_APPROVAL_URL + GET_PROCESS_WORKFLOW + this.$session.get('client_id')
			getToServer(this, get_workflow_list_url).then(response => {
					this.taskList = response
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
