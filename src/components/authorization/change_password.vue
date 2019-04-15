<template>
  <div id="environmentlist">
    <v-layout row wrap pl-4 class="breadcrumbBackground" mb-3>
      <v-flex xs8 style="margin:auto">
        <v-layout row wrap>
          <v-flex xs12 pl-3>
            <ul class="breadcrumb">
              <li><router-link to="/dashboard">Home</router-link></li>
              <li>Change Password</li>
            </ul>
          </v-flex>
          <v-flex >

          </v-flex>
        </v-layout>                
      </v-flex>
      <v-flex xs4 text-xs-right pr-4 pb-1 style="">

      </v-flex>
    </v-layout>
    <v-container grid-list-md text-xs-center>

      <v-form v-model="valid" ref="form">

        <v-flex style="margin-top:1%">     
          <v-card>
            <v-flex xs6 offset-xs3>
              <v-layout row wrap style="background: white;padding: 40px;border-radius: 15px">          
                <v-flex xs12>
                  <v-text-field label="Current Password"
                  v-model="current_password"
                  :append-icon="show1 ? 'visibility_off' : 'visibility'"
                  :type="show1 ? 'text' : 'password'"
                  class="input-group--focused"
                  required
                  @click:append="show1 = !show1">
                </v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-text-field label="Password"
                v-model="password"
                :append-icon="show1 ? 'visibility_off' : 'visibility'"
                :type="show1 ? 'text' : 'password'"
                class="input-group--focused"
                required
                :rules="passwordRules"
                ref='password'
                @click:append="show1 = !show1" @keyup="checkwithcurrent_password">
              </v-text-field>
            </v-flex>
            <v-flex xs12>
              <v-text-field label="Confirm Password"
              v-model="confirmpassword"
              :rules="confirmPasswordRules"
              :append-icon="show1 ? 'visibility_off' : 'visibility'"
              :type="show1 ? 'text' : 'password'"
              class="input-group--focused"
              required
              @click:append="show1 = !show1" ref='confirmpassword' @keyup="checkwithpassword">
            </v-text-field>
          </v-flex>
          <v-flex xs12>
            <!-- <v-btn :loading="loading" :disabled="loading" class="btn-color" @click.native="loader = 'loading'" @click="submit" large block> -->

              <v-btn :color="outlineColor"@click.native="loader = 'loading'" @click="submit" outline style="border-radius:10px">
              Reset your Password </v-btn>
            </v-flex>
            
          </v-layout>
        </v-flex>
      </v-card>
    </v-flex> 
  </v-form>
  <v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'
  >
  {{ snackbartext }}
</v-snackbar>
</v-container> 
</div>
</template>
<script>
import { post as postToServer } from './../../methods/serverCall.js';
import config from '../../config.json'
import {SERVER_ERROR} from '../../data/client_message.js'
import {CHANGE_PASSWORD} from '../../data/url_constants.js'
import {COLOR_CODE, BTN_COLOR} from '../../data/macros.js'
export default {
  data () {
    return { 
      outlineColor:BTN_COLOR,
      colorCode:COLOR_CODE,
      valid: true,
      snackbar:false,
      snackbartext:'',
      snackbartimeout:5000,
      colorValue:'error',
      loader: "loading",
      loading: false,
      show1: false,
      show2: false,
      password: '',
      current_password:'',
      confirmpassword: '',
      change_password_input:'',
      passwordRules: [v => !!v || 'Password is required.',
      v=> v != this.current_password || 'old Password and  Password should be same'],
      confirmPasswordRules: [v => !!v || 'Confirm Password is required.',
      v=> v == this.password || 'Password and Confirm Password should be same'],
    }
  },
  mounted (){
    
  },
  methods:{
    checkwithcurrent_password(){
      this.$refs.password.validate()
    },

    checkwithpassword(){
      this.$refs.confirmpassword.validate()
    },
    
    submit () {
      if (this.$refs.form.validate()) {
        this.change_password()
      }
    },

    change_password(){
      const l = this.loader
      this[l] = !this[l]
      var change_password_endpoint = config.USER_PROVISION_URL + CHANGE_PASSWORD
      var change_password_input = {
        'username': this.$session.get('email'),
        'old_password':this.current_password,
        'new_password': this.password
      }
      debugger
      postToServer(this, change_password_endpoint, change_password_input).then(user_provisioning_response  => {
        this.snackbar = true
        this.colorValue = 'info'
        this.snackbartext = user_provisioning_response
        this[l]  = false
        this.loader = null
      }).catch(error_response => {
        
        if(error_response){            
          this.snackbartext = error_response
        }
        else {
          this.snackbartext = SERVER_ERROR
        } 
        this.snackbar = true
        this.colorValue = 'error'
        this[l]  = false
        this.loader = null
      });
    }

  }
}
</script>

<style>


</style>
