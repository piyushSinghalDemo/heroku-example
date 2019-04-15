<template>
  <div id="addCalendar"> 
      <v-layout row wrap pl-4 mb-3 class="breadcrumbBackground">
            <v-flex xs8 style="margin:auto">
                <v-layout row wrap>
                    <v-flex xs12 pl-3>
                        <ul class="breadcrumb">
                          <li>
                            <router-link to="/dashboard">Home</router-link>
                          </li>
                          <li>
                            <router-link to="/calendar">Calendar List</router-link>
                          </li>
                          <li><span style="font-weight:400;font-size:14px">
                            <input type="text" autofocus onFocus="this.select()"  v-model="name" @blur="untitle_calendar" ref="cname"/></span></li>
                        </ul>
                    </v-flex>
                     <v-flex >
                        
                    </v-flex>
                </v-layout>
                
            </v-flex>
            <v-flex xs4 text-xs-right pr-4 pb-1 style="">
               
            </v-flex>
        </v-layout>  
    <v-container grid-list-md text-xs-center style="padding:2px">
      <v-form v-model="valid" ref="add_user_form">
        
        <v-card>
          <!-- <v-layout row wrap flex align-center justify-center> -->
            <v-container>
            <v-flex xs7 class="text-xs-center">
                <v-layout row wrap>
                  <!-- <v-flex xs6 pr-3>
                     <v-text-field v-model="name" label="Name" :rules="nameRules" required style="max-height:45px;"></v-text-field>
                  </v-flex> -->
                  <v-flex xs6 pl-3>
                     <v-text-field v-model="description" label="Description" :rules="descRules" required style="max-height:45px;"></v-text-field>
                  </v-flex>
                  <v-flex text-sm-left xs6>
                     <v-autocomplete clearable autocomplete :items="calendar_rule_list" item-text="name" :rules="calendarRules" v-model="calendar_rule" label="Select Rule for Calendar" style="margin-right:10px; margin-top:6px;" return-object></v-autocomplete>
                  </v-flex>
                  <v-flex xs6 pr-3>
                     <v-checkbox :label="`Is Default`" :color="colorCode" v-model="checkbox"></v-checkbox>
                  </v-flex>
                  </v-layout>
            </v-flex>
            </v-container>
        </v-card>
        <v-layout row wrap mt-2>
          <v-flex xs12 class="text-xs-right">
            <v-btn outline @click="submit" :color="outlineColor" :loading="loading" :disabled="loading" 
               @click.native="loader='loading'" style="border-radius:10px">Save</v-btn>
            <v-btn outline @click="onCancel" :color="outlineColor" style="margin-right: 0px;border-radius:10px">Cancel</v-btn>
          </v-flex>
        </v-layout>
      </v-form>
    </v-container>
    <v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'
        >
        {{ snackbartext }}
      </v-snackbar>
  </div>
</template>

<style scoped>
.v-text-field.v-text-field--solo .v-input__control{
  min-height: 20px;
}
#addCalendar .v-input--checkbox, label {
  margin-top:2%;
}
</style>

<script>
import config from "../../config.json"
import Breadcrumb from "../Breadcrumbs.vue"
import { post as postToServer } from './../../methods/serverCall.js';
import { get as getToServer } from './../../methods/serverCall.js';
import { ADD_USER, GET_USER, UPDATE_USER } from '../../data/url_constants.js'
import {COLOR_CODE, BTN_COLOR} from '@/data/macros.js'

    
export default {
  data () {
      return {
        outlineColor:BTN_COLOR,
        colorCode:COLOR_CODE,
        valid: false,
        snackbar:false,
        snackbartext:'',
        snackbartimeout:4000,
        colorValue:'error',
        loader: null,
        loading: false,
        show1: false,
        show2: false,
        valid: true,
        name: "",
        description: "",
        nameRules:[
          v => !!v || 'Name is required'
        ],
        descRules: [
          v => !!v || 'Description is required'
        ],
        calendarRules: [
          v => !!v || 'Rule is required'
        ],
        logintype:false,
        calendar_rule: '',
        calendar_rule_list: [],
        calendar_rule_map_id: '',
        checkbox: false
      }
    },
    mounted () {
      if (this.$route.params.calendar_id) {
        this.getCalendar()
      }
      this.getAllCalendarRules()
      if(this.$refs.cname.$el)
        this.$refs.cname.$el.focus()
      else this.$refs.cname.focus()
    },
    methods: {
      onCancel(){
      this.$router.push("/calendar")
      },
      submit () {
        if (this.$refs.add_user_form.validate()) {
          if(this.logintype && !this.ldap_login_name){
            alert('LDAP login name required')
            return false
          }
          if(this.$route.params.calendar_id && this.$route.params.type == 'edit'){
            this.updateCalendar()
          } else {
            this.addCalendar()
          }
        }
      },
      clear () {
        this.$refs.add_user_form.reset()
      },
      untitle_calendar(){
      if (!this.name.trim()){
        this.name = 'Untitled Calendar'
      }
    },
      getAllCalendarRules() {
        var Authorization = this.$session.get('access_token')
        getToServer(this, config.JOB_CALENDAR_URL + '/get_all_calendar_rules').then(response => {
                var data = response
                this.calendar_rule_list = data
           }).catch(error_response => {
            if(error_response){
              this.snackbar = true
              this.colorValue = 'error'
              this.snackbartext = error_response;
              this.loader = null 
            }
            else {
              this.snackbar = true
              this.colorValue = 'error'
              this.snackbartext = SERVER_ERROR;
            }
        })
     },
      getCalendar() {
        let l = this.loader
        this[l] = !this[l]
        console.log(this.$route.params.calendar_id)
        var Authorization = this.$session.get('access_token')
        var getData = {"calendar_id": this.$route.params.calendar_id}
        postToServer(this, config.JOB_CALENDAR_URL + '/get_calendar', getData).then(response => {
                var data = response
                this.name = data.name
                this.description = data.description
                this.checkbox = data.is_default
                this.created_by = data.created_by
                this.calendar_rule = {'id': data.rule_id, 'name': data.rule_name}
                this.calendar_rule_map_id = data.calendar_rule_map_id
           }).catch(error_response => {
            if(error_response){
              this.snackbar = true
              this.colorValue = 'error'
              this.snackbartext = error_response;
              this.loader = null 
            }
            else {
              this.snackbar = true
              this.colorValue = 'error'
              this.snackbartext = SERVER_ERROR;
            }
        })
     },
      addCalendar() {
        let l = this.loader
        this[l] = !this[l]
          var Authorization = this.$session.get('access_token')
          var client_id = this.$session.get('client_id')
          var calendarData = {
            "name": this.name, "client_id": client_id, 
            "description": this.description, 
            "created_by": this.$session.get('email'),
            "rule_id": this.calendar_rule.id,
            "is_default": this.checkbox}
          postToServer(this, config.JOB_CALENDAR_URL + '/add_calendar', calendarData).then(userResponse  => {
                if(userResponse){
                  this.colorValue = 'success'
                  this.snackbar = true
                  this.snackbartext = 'Calendar added successfully';
                  this.$cookies.set('calendar_add', true)
                  this.$router.push("/calendar")
                }
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
              this.snackbartext = 'Something went wrong.Try Again';
              this.colorValue = 'error'
              this[l]  = false
              this.loader = null
              
            }
      });
    },
    updateCalendar() {
        let l = this.loader
        this[l] = !this[l]
          var Authorization = this.$session.get('access_token')
          var client_id = this.$session.get('client_id')
          var updateData = {
            "id": this.$route.params.calendar_id,
            "name": this.name, "client_id": client_id, 
            "description": this.description, 
            "modified_by": this.$session.get('email'), 
            "calendar_rule_map_id": this.calendar_rule_map_id,
            "rule_id": this.calendar_rule.id,
            "is_default": this.checkbox}
          postToServer(this, config.JOB_CALENDAR_URL + '/update_calendar', updateData).then(userResponse  => {
                if(userResponse){
                  this.colorValue = 'success'
                  this.snackbar = true
                  this.snackbartext = 'Calendar updated successfully';
                  this.$cookies.set('user_add', true)
                  this.$router.push("/calendar")
                }
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
              this.snackbartext = 'Something went wrong.Try Again';
              this.colorValue = 'error'
              this[l]  = false
              this.loader = null
              
            }
      });
      }
    }
  }
</script>