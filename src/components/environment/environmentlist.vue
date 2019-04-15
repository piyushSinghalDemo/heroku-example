<template>
  <div id="environmentlist">
    <v-flex xs12>
      <v-card>
        <div class="inner-addon text-xs-right right-addon" style="margin-left:5px;">
          <div style="float:left;margin-top:7px;">
          <span style="color:rgba(0,0,0,0.54);font-weight:400;font-size:13px;"> Home /</span> &nbsp;<span style="font-weight:400;font-size:15px;">Environment</span>
        </div>
           <v-icon small class="glyphicon" style="color:#494949">
                  fa-search
            </v-icon>
          <input type="text" v-model="search" placeholder="Type your search here" class="form-control" style="width:30%;float: right;margin-bottom:3px;margin-right:5px;margin-top:5px;"/>
        </div>       
        <v-data-table 
          :headers="headers"
          :items="environmentlist"
          :search="search"
          rows-per-page-text ="Records per page" style="margin:5px;">
          <template slot="items" slot-scope="props">
            <td class="text-xs-left">{{ props.index + 1 }}</td>
            <td class="text-xs-left">{{ props.item.type }}</td>
            <td class="text-xs-left">{{ props.item.name }}</td>
            <td class="text-xs-left">{{ props.item.environment_database_type }}</td>
            <td class="text-xs-left">{{ props.item.databases_locations }}</td>
            <td class="text-xs-left">
              <router-link :to="{ name: 'manageenvironment', params: { environment_id: props.item.id, type:'copy' }}">
                <v-tooltip bottom >
                  <v-icon slot="activator" class="iconFormat" >fa-copy</v-icon>
                <span>Copy</span>
                </v-tooltip>
              </router-link>
              <router-link :to="{ name: 'manageenvironment', params: { environment_id: props.item.id, type:'edit' }}">
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
  import { get as getToServer } from './../../methods/serverCall.js';
  import config from '../../config.json'
  import {} from '../../data/client_message.js'
  import {ENVIRONMENTLIST_BY_CLIENT} from '../../data/url_constants.js'
  export default {
    data () {
      return {
        search: '',
        pagination: {},
        headers: [
          { text: 'No.', value: 'index',sortable:false},
          { text: 'Environment Type', value: 'type' },
          { text: 'Name', value: 'name' },
          { text: 'Database Type', value: 'dbtype' },
          { text: 'Database Location', value: 'location' },
          { text: 'Actions', value: 'actions',sortable: false}
        ],
        environmentlist: []
      }
    },
    mounted (){
      this.get_environment_by_client_id()
    },
    methods:{
      //
      get_environment_by_client_id(){
        var environment_list_by_client_endpoint = config.ENVIRONMENT_API_URL+ENVIRONMENTLIST_BY_CLIENT+ this.$session.get('client_id')
        getToServer(this, environment_list_by_client_endpoint).then(envirnentResponse => {
            this.environmentlist = envirnentResponse             
        });
      }
    }
  }
</script>

<style>

/* .v-datatable thead th.column {
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
tr:hover td {background:#A9A9A9;}
.theme--light .v-datatable .v-datatable__actions {
  color:rgba(0,0,0,0.87);
}
.theme--light .v-chip {
  background:#FFFFFF;
} */
/* enable absolute positioning */
/* .inner-addon { 
   position: relative; 
} */

/* style icon */
/* .inner-addon .glyphicon {
  position: absolute;
  padding: 10px;
  pointer-events: none;
} */

/* align icon */
/* .right-addon .glyphicon { right: 0px;} */

</style>
