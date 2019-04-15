<template>
  <div id="register">
    <v-container style="padding-top:10px">
      <v-form ref="form"  v-model="valid">
        <v-layout id="loginContainer" row wrap>
          <v-flex xs6 offset-xs3>
            <v-layout row wrap style="background: white;padding: 40px;border-radius: 15px">
              <v-flex>               
                  <h4>Hi {{this.email}},</h4>
                  <h4>Please reset your Password</h4>
              </v-flex>
              <v-flex xs12>
                <v-text-field label="Password"
                v-model="password"
                :append-icon="show1 ? 'visibility_off' : 'visibility'"
                :type="show1 ? 'text' : 'password'"
                class="input-group--focused"
                required
                :rules="passwordRules"
                @click:append="show1 = !show1" @keyup="checkwithpassword">
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
                <v-btn :loading="loading" :disabled="loading"  @click.native="loader = 'loading'" @click="submit" color="success" large block>Reset your Password </v-btn>
              </v-flex>
              
            </v-layout>
          </v-flex>
        </v-layout>
      </v-form>
      <v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'
        >
        {{ snackbartext }}
      </v-snackbar>
    </v-container>
  </div>
</template>
<script>
 import config from '../../config.json'
  import { post as postToServer } from './../../methods/serverCall.js';
  import { get as getToServer } from './../../methods/serverCall.js';
  import {FORGOT_PASSWORD_MESSAGE, reset_password_message} from '../../data/client_message.js'
 import {RESET_PASSWORD, FORGOT_PASSWORD_VERIFY_TOKEN} from '../../data/url_constants.js'
 export default {
  data() {
      return {
        email:'',
        password: '',
        confirmpassword: '',
        passwordFieldType: 'password',
        show1: false,
        valid:true,
        snackbar:false,
        snackbartext:'',
        colorValue:'',
        loader: "loading",
        loading: false,
        snackbartimeout:5000,
        passwordRules: [v => !!v || 'Password is required.'],
        confirmPasswordRules: [v => !!v || 'Confirm Password is required.',
        v=> v == this.password || 'Password and Confirm Password should be same'],

      }
  },
  mounted() {
      //this.is_forgot_password_email()
      this.forgot_password_token_check()
  
  },
  props: {
    msg: String
  },
  methods: {
    checkwithpassword(){
      this.$refs.confirmpassword.validate()
    },

    is_forgot_password_email(){
       if(this.$cookies.isKey('forgot_password_email')){
        this.email = this.$cookies.get('forgot_password_email')
        this.$cookies.remove('forgot_password_email')
        this.snackbar = true
        this.colorValue = 'info'
        this.snackbartext = FORGOT_PASSWORD_MESSAGE;
      }
    },

    forgot_password_token_check(){
      var forgot_password_token_endpoint = config.USER_PROVISION_URL + FORGOT_PASSWORD_VERIFY_TOKEN + this.$route.query.token
      getToServer(this, forgot_password_token_endpoint, true).then(user_provisioning_response => {
          this.email = user_provisioning_response
      }).catch(error_response => {
          this.snackbar = true
          this.colorValue = 'error'
          this[l]  = false
          this.loader = null 
      });
    },

    submit () {
      if (this.$refs.form.validate()) {
          this.reset_password()
      }
    },
    reset_password(){
      const l = this.loader
      this[l] = !this[l]
      var reset_password_details = {
        "username":this.email,
        "new_password":this.password
      }
      var user_provisioning_end_point = 
      config.USER_PROVISION_URL + RESET_PASSWORD
      postToServer(this, user_provisioning_end_point, reset_password_details, true).then(user_provisioning_response => {
          this.$cookies.set('reset_password_success', true)
          this.$router.push("/login")

      }).catch(error_response => {
          this.snackbar = true
          this.colorValue = 'error'
          this.snackbartext = error_response
          this[l]  = false
          this.loader = null             
      });
    }
  }
}
</script>