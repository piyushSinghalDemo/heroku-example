<template>
    <v-container style="padding-top:10px;max-width:100%">
    <v-form ref="form" v-model="valid">
      <v-flex xs10 ml-3>
        <ul class="breadcrumb">
          <li>
            <router-link to="/">Home</router-link>
          </li>
          <li>Select Environment for Process definition</li>
        </ul>
      </v-flex>
      <v-card class="elevation-7">
        <v-card-title style="background:#494949;color:white;padding: 0px 7px;">
          <v-layout row wrap justify-start>
            <v-flex xs10 offset-xs1>
              <span style="float:left;font-size:30px;text-align:left;">Select Environment for Process definition</span>
            </v-flex>
          </v-layout>
        </v-card-title>
        <v-card-text>
          <v-layout row wrap>
            <v-flex xs10 offset-xs1>
              <v-layout justify-center row wrap>
                <v-flex xs6>
                  <v-autocomplete
                    :items="EnvironmentList"
                    item-text="env_name"
                    item-value="id"
                    label="Select Environment"
                    v-model="Environment"
                    required
                    :rules="EnvironmentListRules"
                    clearable>
                  </v-autocomplete>
                </v-flex>
              </v-layout>
            </v-flex>
          </v-layout>
        </v-card-text>
      </v-card>
      <v-layout row wrap mt-5>
        <v-flex xs12 class="text-xs-right" mr-2>
          <v-btn color="blue" @click="submit" style="color:white">
            Proceed
          </v-btn>                    
          <v-btn color="blue"  style="color:white">
            Cancel
          </v-btn>
        </v-flex>
      </v-layout>
      </v-form>
    </v-container>
</template>
<script>
import Breadcrumb from "../Breadcrumbs.vue"
import config from '../../config.json'
import { post as postToServer } from './../../methods/serverCall.js';
import { get as getToServer } from './../../methods/serverCall.js';
import { GET_ALLOW_CREATE_DOC_ENV, CREATE_NEW_JOB } from '../../data/url_constants.js';
import { SERVER_ERROR } from '../../data/client_message.js';
export default {
     name: 'Schedule',
     components: {
    Breadcrumb
  },
  mounted () {
      this.getEnvironmentList()
    },
    data() {
      return {
        valid: false,
        EnvironmentList: [],
        Environment: null,
        EnvironmentListRules: [v => !!v || 'Environment is required.'],
      }
    },
  props: {
    msg: String
  },
  methods: {
    submit () {
            if (this.$refs.form.validate()) {
              // Native form submission is not yet supported
              this.routeToFlowchart()
            }
          },
      getEnvironmentList () {
        // this.PDName = "Process Definition Name"
        var data={'filter': [], 'sort': {'column': '', 'type': ''}, 'page_size': "*"}
        // postToServer(this, config.ENVIRONMENT_API_URL + ENVIRONMENTLIST_BY_CLIENT, data).then(
        getToServer(this, config.ENVIRONMENT_API_URL + GET_ALLOW_CREATE_DOC_ENV + this.$session.get('client_id')).then(
          response => {
            if(response){
            this.EnvironmentList = response
            // console.log(this.EnvironmentList)
            } else {
               this.errorMsg = response
            }
          },response => {
            // debugger;
            this.ShowErrorMessage=true
            this.ErrorMessage=response
          }).catch(EnvironmentError => {
            if(EnvironmentError){
                 this[l]  = false
                 this.loader = null 
                  this.snackbar = true
                  this.colorValue = 'error'
                  this.snackbartext = EnvironmentError;
                }
                else {
                  this.snackbar = true
                  this.colorValue = 'error'
                  this.snackbartext = SERVER_ERROR;
                }
          })
        },
      routeToFlowchart(){
            this.$router.push({'name' : 'processdefinition', 'params' : { env_id: this.Environment }})
            // this.$router.push('/Flowchart')
      },
  }
}
</script>
<style scoped>
 .radioClass >>> label{
    top: 5px !important;
} 
.radioClass >>> i{
    font-size: 30px
}
.customCheckbox >>> label{
    top: 5px !important;
}
/* .customCheckbox >>> i{
    top: 5px !important;
} */
.pointer{
    cursor: pointer;
}
.pointer >>> span{
    cursor: pointer;
}
.custWidth{
    width: 55px;
}
.customCheckbox >>> label{
    top: 5px !important;
}
</style>

