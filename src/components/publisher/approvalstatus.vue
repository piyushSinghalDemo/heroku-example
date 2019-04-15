<template>
	<div>
		<v-layout row wrap pl-4 class="breadcrumbBackground">
            <v-flex xs8 style="margin:auto">
                <v-layout row wrap>
                    <v-flex xs12 pl-3>
                         <ul class="breadcrumb">
                            <li>
                              <router-link to="/dashboard">Home</router-link>
                              </li>
                            <li><router-link to="/publish_history">Publish History</router-link></li>
                            <li to="/publish_history">Object {{object_name}} From {{from_env}} To {{to_env}} Env</li>
                            <li>Approval Status</li>
                          </ul>
                    </v-flex>
                     
                </v-layout>
                
            </v-flex>
            <v-flex xs4 text-xs-right pr-4 pb-1 style="">
               
            </v-flex>
        </v-layout>
		<v-flex>
                <graphtemplate :showminimap=true :showzoom=true datatype="WF" :graphtemplatedata="graphtemplatedata"></graphtemplate>

                 <loading-panel :loader="loader"></loading-panel>
        <v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'
        >
        {{ snackbartext }}
      </v-snackbar>
        </v-flex>
	</div>
</template>
<script>
import config from '../../config.json'
import { get as getToServer, post as postToServer } from './../../methods/serverCall.js';
import { SERVER_ERROR } from '../../data/client_message.js';
import loadingPanel from './../../views/loading.vue'
import graphtemplate from '../templates/graph_template.vue'
import { PUBLISH_HISTORY, PUBLISH_HISTORY_CANCEL_REQUEST} from '@/data/url_constants.js';
  export default {
    name: "PublishHistory",
    components: {
      'loading-panel':loadingPanel,
      graphtemplate 
    },
    data () {
      return {
      	object_name:this.$route.params.objectName,
      	from_env:this.$route.params.fromEnv,
      	to_env:this.$route.params.toEnv,
      	graphtemplatedata:{},
      	snackbar:false,
        snackbartext:'',
        snackbartimeout:4000,
        colorValue:'error',
        loader:false,
      }
    },
    mounted() {
    	this.object_name = this.$route.params.objectName
    	this.from_env = this.$route.params.fromEnv
      	this.to_env = this.$route.params.toEnv
    	var approval_request_id = this.$route.params.approval_request_id
    	this.showStatus(approval_request_id)
    },
    methods: {
      hideLoader(){
            let _this = this;
            setTimeout(function(){
                  _this.loader = false; 
              },500);
     },
     showStatus(approval_request_id){
            this.graphtemplatedata = {"service_id":config.PROCESS_APPROVAL_URL, "endpoint":'/request/live_status/'+approval_request_id}
        }, 
    }
  }
</script>
<style>
.iconFormat{
    margin-right: 5px;
    cursor: pointer;
}
</style>

