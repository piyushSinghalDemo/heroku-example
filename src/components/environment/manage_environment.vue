<template>
  <div id="addenvironment">
    <v-layout row wrap pl-4 class="breadcrumbBackground">
      <v-flex xs8 style="margin:auto">
          <v-layout row wrap>
              <v-flex xs12 pl-3>
                  <ul class="breadcrumb">
                    <li>
                      <router-link to="/dashboard">Home</router-link>
                    </li>
                    <li>
                      <router-link to="/Environmentlist">Environment List</router-link>
                    </li>
                    <li><span style="font-weight:400;font-size:14px"><input type="text" autofocus  :rules="namedRules" v-model="name" @blur="untitle_environment" ref='envname' /></span></li>
                  </ul>
              </v-flex>
                <v-flex>
                    
              </v-flex>
          </v-layout>
          
      </v-flex>
      <v-flex xs4 text-xs-right pr-4 pb-1 style="">
          
      </v-flex>
    </v-layout>   
    <v-container grid-list-md text-xs-center style="padding:3px">
      <v-form v-model="valid" ref="form">
        <v-flex style="margin-top:1%">     
          <v-card>
            <v-container style="padding-top:0px;">
            <v-layout row wrap justify-center>
              <v-flex xs12>
                <v-layout row wrap>
                  <v-flex text-sm-left xs6 style="margin-top: 2.5%">
                    <v-flex xs12>
                      <label class="v-label" >Select Database Type</label>
                    </v-flex>
                    <v-flex xs12>
                      <v-radio-group v-model="database_type" required hide-details row @change="get_data_source_by_db(database_type)" style="margin:0px">
                          <v-radio class="customRadio" :color="colorCode" v-for="(n, index) in database_type_list" :key="index" :label="n.name"  :value="n.id"></v-radio>
                        </v-radio-group>
                    </v-flex>
                  </v-flex>
                  <v-flex text-sm-left xs6 style="margin-top: 2.5%">
                    <v-flex xs12>
                      <label class="v-label">Select Database Location</label>
                    </v-flex>
                  <v-flex xs12>
                   <v-radio-group v-model="dblocation" required hide-details row style="margin:0px">
                      <v-radio class="customRadio" :color="colorCode" v-for="(n, id) in database_location_list" :key="id" :label="n.name"  :value="n.id"></v-radio>
                    </v-radio-group>
                  </v-flex>
                  </v-flex>
                   <v-flex text-sm-left xs6>
                       <v-autocomplete clearable autocomplete :items="source_data_source_list" item-text="datasource_name" item-value="datasource_id"  v-model="source_data_source" :rules="requiredSourceDatasource" label="Select Source Datasource" style="margin-right:10px;"></v-autocomplete>
                  </v-flex>
                  <v-flex text-sm-left xs6>
                       <v-autocomplete clearable autocomplete :items="engine_data_source_list" item-text="datasource_name" item-value="datasource_id" v-model="engine_data_source" :rules="requiredEngineDatasource" label="Select Source Engine Datasource" style="margin-left:10px;"></v-autocomplete>
                  </v-flex>
                  <v-flex  text-sm-left xs6>
                     <v-autocomplete clearable autocomplete :items="target_data_source_list" item-text="datasource_name" item-value="datasource_id"  v-model="target_data_source" :rules= "requiredTargetDatasource" label="Select Target Datasource" style="margin-right:10px;"></v-autocomplete>
                  </v-flex>
                  <v-flex  text-sm-left xs6>
                     <v-autocomplete clearable autocomplete :items="target_data_source_list" item-text="datasource_name" item-value="datasource_id"  v-model="target_engine_data_source" :rules= "requiredTargetEngineDatasource" label="Select Target Engine Datasource" style="margin-left:10px;"></v-autocomplete>
                  </v-flex>
                  <v-flex text-sm-left xs6>
                     <v-autocomplete clearable autocomplete :items="catalog_datasource_list" item-text="datasource_name" item-value="datasource_id"  :rules="catalogRules" v-model="catalog_data_source" label="Select Catalog Datasource" style="margin-right:10px;"></v-autocomplete>
                  </v-flex>
                  <!-- <v-flex text-sm-left xs6>
                     <v-autocomplete clearable autocomplete :items="engine_data_source_list" item-text="datasource_name" item-value="datasource_id"  :rules="dictionaryRules" v-model="dictionary_data_source" 
                        label="Select Dictionary Datasource" style="margin-left:10px;"></v-autocomplete>
                  </v-flex> -->

                  <v-flex text-sm-left xs6 v-show="database_type == 'oracle' && dblocation != 'same_database'">
                    <v-text-field v-model="SourceToTargetDbLinkValue" label="Source To Target DB Link"></v-text-field>
                  </v-flex>
                  <v-flex text-sm-left xs6 v-show="database_type == 'oracle' && dblocation != 'same_database'">
                    <v-text-field v-model="TargetToSourceDbLinkValue" label="Target To Source DB Link"></v-text-field>
                  </v-flex>
                  
                  <v-flex text-sm-left xs6>
                    <v-textarea name="input-7-1" label="Description" v-model="description" rows=1 style="margin-left:10px;"></v-textarea>
                  </v-flex>
                  <!-- <v-flex text-sm-left xs6>
                     <v-autocomplete clearable autocomplete :items="calendar_list" item-text="name" item-value="id" :rules="calendarRules" v-model="calendar" label="Select Calendar" style="margin-right:10px; margin-top:6px;"></v-autocomplete>
                  </v-flex> -->
                  <v-flex xs6>
                    <v-layout row wrap>
                      <v-flex xs3 style="margin:auto 0px;" class="text-xs-left">
                        <label class="v-label">Environment Options</label>
                      </v-flex>
                      <v-flex xs3 v-for="(env_config, id) in env_config_list" :key="id">
                        <v-checkbox class="customCheckbox" v-model="env_config.value"
                        :label="env_config.display_name"></v-checkbox>
                      </v-flex>
                    </v-layout>
                  </v-flex>
                </v-layout>
              </v-flex>
            </v-layout>
            </v-container>
          </v-card>
        </v-flex>   
        <v-layout row wrap mt-2>
          <v-flex xs12 class="text-xs-right">
            <v-btn outline @click="validate_env" :color="outlineColor" :loading="validation_loding" :disabled="validation_loding"  
              @click.native="loader = 'loading'" style="border-radius:10px">Validate</v-btn>
            <v-btn outline @click="submit" :color="outlineColor" :loading="loading" :disabled="loading"  
              style="border-radius:10px">Save</v-btn>
            <v-btn outline @click="clear" :color="outlineColor" style="margin-right: 0px;border-radius:10px">Cancel</v-btn>
          </v-flex>
        </v-layout>
      </v-form>
      <v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'>{{ snackbartext }}
      </v-snackbar>
    </v-container>
  </div>
</template>

<style scoped>
.customCheckbox >>> label{
  top: 5px !important;
}
.v-text-field.v-text-field--solo .v-input__control{
  min-height: 20px;
}
.customRadio>>> label{
  top: 2px !important;
}
</style>

<script>
// import { validationMixin } from 'vuelidate'
import { post as postToServer } from './../../methods/serverCall.js';
import { get as getToServer } from './../../methods/serverCall.js';
import config from '../../config.json'
import {SERVER_ERROR} from '../../data/client_message.js'
import {GETENVIRONMENTDETAILS, GETDATASOURCEBYBDTYPE, CATALOG_DATA_SOURCE_BY_CLIENT_ID, ADDENVIRONMENT, UPDATE_ENVIRONMENT, GET_ALL_ENV_CONFIG, GET_ALL_AGENT_MASTER,VALIDATE_ENVIRONMENT} from '../../data/url_constants.js'
import {COLOR_CODE, BTN_COLOR} from '../../data/macros.js'
export default {
  data () {
      return {
        outlineColor:BTN_COLOR,
        colorCode:COLOR_CODE,
        SourceToTargetDbLinkValue : '',
        TargetToSourceDbLinkValue: '',
        valid: true,
        snackbar:false,
        snackbartext:'',
        snackbartimeout:5000,
        colorValue:'error',
        loader: "loading",
        loading: false,
        validation_loding:false,
        name:"Untitled Environment",
        environment_type:"",
        database_type:"",
        source_data_source:"",
        target_data_source:"",
        engine_data_source:"",
        target_engine_data_source: "",
        catalog_data_source:"",
        dblocation:"",
        // mapped_agent: "",
        description: "",
        environment_id:"undefined",
        environment_type_list: [],
        database_type_list: [],
        database_location_list: [],
        source_data_source_list:[],
        target_data_source_list:[],
        engine_data_source_list:[],
        catalog_data_source_list:[],
        catalog_datasource_list:[],
        dictionary_data_source: '',
        data:'',
        db_type:'',
        env_config_list: [],
        namedRules:[
          v => !!v || 'Name is required'
        ],
        environmentTypedRules: [
          v => !!v || 'Environment Type is required'
        ],
        databaseRules:[
          v => !!v || 'Database Type is required'
        ],
        catalogRules:[
          v => !!v || 'Catalog Datasource is required'
        ],
        locationRules:[
          v => !!v || 'Databases Locations is required'
        ],
        agentRules: [
          v => !!v || 'Agent is required'
        ],
        dictionaryRules:[
          v => !!v || 'Dictionary datasource is required.'
        ],
        requiredSourceDatasource:[
          v => !!v || 'Source Datasource is required',
          (v) => v != this.target_data_source || 'Source and Target datasource must be different!',
          (v) => v != this.engine_data_source || 'Source and Engine datasource must be different!',
        ],
        requiredTargetDatasource:[
          v => !!v || 'Target Datasource is required',
          (v) => v != this.source_data_source || 'Target and Source datasource must be different!',
          (v) => v != this.engine_data_source || 'Target and Engine datasource must be different!',
        ],
        requiredEngineDatasource:[
          v => !!v || 'Engine Datasource is required',
          (v) => v != this.target_data_source || 'Engine and Target datasource must be different!',
          (v) => v != this.source_data_source || 'Engine and Source datasource must be different!'
        ],
        requiredTargetEngineDatasource: [
          v => !!v || 'Target Engine Datasource is required',
          (v) => v != this.target_data_source || 'Target Engine and Target datasource must be different!',
          (v) => v != this.source_data_source || 'Target Engine and Source datasource must be different!'
        ],
        agent_list: [],
        calendar_list: [],
        calendar: '',
        calendarRules: [
          v => !!v || 'Calendar is required.'
        ]
      }
    },
  mounted (){
    debugger
    this.get_environment_details()
    this.get_agent_details()
    // this.getAllCalendarRules()
    // this.get_catalog_datasource_details()
    if (this.$route.name == "AddEnvironment"){
      this.getEnvConfig()
    }
    if(this.$refs.envname.$el)
        this.$refs.envname.$el.focus()
      else this.$refs.envname.focus()
  },
  methods: {
    untitle_environment(){
          if (!this.name.trim()){
            this.name = 'Untitled Environment'
          }
    },
    // getAllCalendarRules() {
    //     var Authorization = this.$session.get('access_token')
    //     var request_data = {'client_id': this.$session.get('client_id')}
    //     debugger
    //     postToServer(this, config.JOB_CALENDAR_URL + '/get_all_calendar', request_data).then(response => {
    //             var data = response
    //             this.calendar_list = data
    //        }).catch(error_response => {
    //         if(error_response){
    //           this.snackbar = true
    //           this.colorValue = 'error'
    //           this.snackbartext = error_response;
    //           this.loader = null 
    //         }
    //         else {
    //           this.snackbar = true
    //           this.colorValue = 'error'
    //           this.snackbartext = SERVER_ERROR;
    //         }
    //     })
    //  },
    get_environment_details(){
      var environment_end_point = config.ENVIRONMENT_API_URL + GETENVIRONMENTDETAILS + this.$route.params.environment_id
      getToServer(this, environment_end_point, true).then(envResponse => {
        this.environment_type_list = envResponse.environment_dict.database
        this.database_type_list = envResponse.database_name_dict.database
        if(this.database_type_list.length){
          this.database_type = this.database_type_list[0].id;
          
        }
        
        this.database_location_list = envResponse.db_location_dict.db_location;
        if(this.database_location_list.length)
          this.dblocation = this.database_location_list[0].id;
        if(this.$route.params.environment_id){
            debugger
            var data = envResponse
            this.environment_type = data.environment_details.type
            this.name =  this.$route.params.type == 'edit' ? data.environment_details.name : 'Copy_of_'+data.environment_details.name;
            // this.mapped_agent = {
            //   'id': data.environment_details.mapped_agent_id,
            //   'agent_name': data.environment_details.mapped_agent_name,
            // }
            this.database_type = data.environment_details.environment_database_type
            this.get_data_source_by_db(data.environment_details.environment_database_type,data.environment_details)
            this.source_data_source = data.environment_details.source_data
            this.target_data_source = data.environment_details.target_data
            debugger
            this.target_engine_data_source = data.environment_details.target_engine_data
            this.engine_data_source = data.environment_details.engine_database
            this.dictionary_data_source = data.environment_details.dictionary_data
            this.catalog_data_source = data.environment_details.catalog_data
            this.env_config_list = data.environment_details.env_config
            this.env_config_list.map(obj=>{
              var name = obj.config_name
              if(name){
                var nameSplit = name.split('_')
                var newFirstName = ''
                var secondName = ''
                if(nameSplit[0])
                  newFirstName = nameSplit[0].charAt(0).toUpperCase() + nameSplit[0].slice(1)
                if(nameSplit[1])
                  secondName = nameSplit[1].charAt(0).toUpperCase() + nameSplit[1].slice(1)
                obj.display_name = newFirstName + ' ' + secondName
              }
             })
            this.description = data.environment_details.description
            this.dblocation = data.environment_details.databases_locations
            this.SourceToTargetDbLinkValue = data.environment_details.source_to_target_dblink
            this.TargetToSourceDbLinkValue = data.environment_details.target_to_source_dblink
            this.calendar = parseInt(data.environment_details.calendar)           
          }

          else{
          this.get_data_source_by_db(this.database_type);
        }
        if(this.$refs.envname.$el)
        this.$refs.envname.$el.focus()
          else this.$refs.envname.focus()
        // console.log(this.env_config_list);
        
      });
    },
    get_agent_details(){
      var client_id = this.$session.get('client_id')
      var agent_endpoint = config.AGENT_API_URL + GET_ALL_AGENT_MASTER + client_id
      getToServer(this, agent_endpoint, true).then(response_data => {
        debugger
         if(response_data){
            this.agent_list = response_data
         }
        }).catch(error_response => {
          debugger
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
    },
    // get_catalog_datasource_details(){
    //   var catalog_details_endpoint = config.DATA_SOURCE_URL + CATALOG_DATA_SOURCE_BY_CLIENT_ID + this.$session.get('client_id')
    //   getToServer(this, catalog_details_endpoint).then(datasourceResponse => {
    //         this.catalog_datasource_list = datasourceResponse.datasource
    //   });
    // },
    get_data_source_by_db(db_type,response_data){
      this.source_data_source_list = this.target_data_source_list = this.engine_data_source_list = this.catalog_datasource_list = []
      var user_input = {
            'client_id': this.$session.get('client_id'),
            'database_type': db_type,
          }
      var data_source_endpoint = config.DATA_SOURCE_URL + GETDATASOURCEBYBDTYPE
      postToServer(this, data_source_endpoint, user_input, true).then(datasourceResponse => {
         this.source_data_source_list = this.target_data_source_list = this.engine_data_source_list = this.catalog_datasource_list = datasourceResponse.datasource
         //in case of edit if db response took time
         if(response_data){
            this.source_data_source = response_data.source_data
            this.target_data_source = response_data.target_data
            this.engine_data_source =response_data.engine_database
            this.catalog_data_source = response_data.catalog_data
            this.target_engine_data_source = response.target_engine_data
         }
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
    },

    submit () {
      // console.log("env_config_list" + JSON.stringify(this.env_config_list));
      if (this.$refs.form.validate()) 
      {
        if (this.$route.params.environment_id && this.$route.params.type && this.$route.params.type == 'edit') {
            this.update_environment()
        } else {
            this.add_environment()
        }
      }
    },
    validate_env(){
      if (!this.$refs.form.validate())
        return false
      this.validation_loding = true
      var validate_environment_details = {
          'client_id': this.$session.get('client_id'),
          'name': this.name,
          // 'type': this.environment_type,
          'type': 'test',
          'environment_database_type': this.database_type,
          'source_data': this.source_data_source,
          'target_data': this.target_data_source,
          'engine_database': this.engine_data_source,
          'target_engine_data': this.target_engine_data_source,
          'dictionary_data': this.catalog_data_source,
          'catalog_data': this.catalog_data_source,
          'databases_locations': this.dblocation,
          'source_to_target_dblink': 'NA',
          'target_to_source_dblink': 'NA',
          'env_config': this.env_config_list
        }

        var validate_environment_endpoint = config.ENVIRONMENT_API_URL + VALIDATE_ENVIRONMENT
        postToServer(this, validate_environment_endpoint, validate_environment_details, true).then(environmentResponse => {
          if(environmentResponse){
            this.validation_loding = false
            this.snackbar = true
            this.colorValue = 'success'
            this.snackbartext = environmentResponse;
          }
        }).catch(error_response => {
          this.validation_loding = false
          if(error_response){
            this.snackbar = true
            this.colorValue = 'error'
            this.snackbartext = error_response;
          }
          else {
            this.snackbar = true
            this.colorValue = 'error'
            this.snackbartext = 'environment';
          }
        });
    },
    add_environment(){
      this.loading = true
      var add_environment_details = {
          'client_id': this.$session.get('client_id'),
          'name': this.name,
          // 'type': this.environment_type,
          'type': 'test',
          'environment_database_type': this.database_type,
          'source_data': this.source_data_source,
          'target_data': this.target_data_source,
          'engine_database': this.engine_data_source,
          'target_engine_data': this.target_engine_data_source,
          'dictionary_data': this.catalog_data_source,
          'catalog_data': this.catalog_data_source,
          // 'mapped_agent_id': this.mapped_agent.id,
          // 'mapped_agent_name': this.mapped_agent.agent_name,
          'description':this.description,
          'created_by': this.$session.get('user_id'),
          'databases_locations': this.dblocation,
          'source_to_target_dblink': this.SourceToTargetDbLinkValue,
          'target_to_source_dblink': this.TargetToSourceDbLinkValue,
          'env_config': this.env_config_list,
          'calendar': this.calendar.id
        }
      var add_environment_endpoint = config.ENVIRONMENT_API_URL + ADDENVIRONMENT
      postToServer(this, add_environment_endpoint, add_environment_details).then(environmentResponse => {
          if(environmentResponse){
            this.$router.push("/Environmentlist")
          }
        }).catch(error_response => {
          this.loading = false
          if(error_response){
            this.snackbar = true
            this.colorValue = 'error'
            this.snackbartext = error_response;
          }
          else {
            this.snackbar = true
            this.colorValue = 'error'
            this.snackbartext = 'environment';
          }
        });
    },

    update_environment(){
      this.loading = true
      var update_environment_data = {
         'client_id': this.$session.get('client_id'),
          'name': this.name,
          'type': this.environment_type,
          'environment_database_type': this.database_type,
          'source_data': this.source_data_source,
          'target_data': this.target_data_source,
          'engine_database': this.engine_data_source,
          'target_engine_data': this.target_engine_data_source,
          'catalog_data': this.catalog_data_source,
          'dictionary_data': this.catalog_data_source,
          // 'mapped_agent_id': this.mapped_agent.id,
          // 'mapped_agent_name': this.mapped_agent.agent_name,
          'description':this.description,
          'created_by': this.$session.get('user_id'),
          'databases_locations': this.dblocation,
          'source_to_target_dblink': this.SourceToTargetDbLinkValue,
          'target_to_source_dblink': this.TargetToSourceDbLinkValue,
          'env_config':this.env_config_list,
          'calendar': this.calendar.id
        }
      var update_environment_endpoint = config.ENVIRONMENT_API_URL + UPDATE_ENVIRONMENT + this.$route.params.environment_id
      postToServer(this, update_environment_endpoint, update_environment_data).then(environmentResponse => {
          if(environmentResponse){
             environmentResponse.test
           this.$router.push("/Environmentlist")
          }
        }).catch(environmentError => {
          this.loading = false
          if(environmentError){
            this.snackbar = true
            this.colorValue = 'error'
            this.snackbartext = environmentError;
          }
          else {
            this.snackbar = true
            this.colorValue = 'error'
            this.snackbartext = 'environment';
          }
      });
    },
    getEnvConfig(){
      getToServer(this, config.ENVIRONMENT_API_URL + GET_ALL_ENV_CONFIG, true).then(configResponse => {
         this.env_config_list = configResponse;
         this.env_config_list.map(obj=>{
          obj.value = false;
          var name = obj.config_name
          if(name){
            var nameSplit = name.split('_')
            var newFirstName = ''
            var secondName = ''
            if(nameSplit[0])
              newFirstName = nameSplit[0].charAt(0).toUpperCase() + nameSplit[0].slice(1)
            if(nameSplit[1])
              secondName = nameSplit[1].charAt(0).toUpperCase() + nameSplit[1].slice(1)
            obj.display_name = newFirstName + ' ' + secondName
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

    clear () {
        this.$refs.form.reset()
        this.$router.push('/Environmentlist')
    }

  }
}


</script>




