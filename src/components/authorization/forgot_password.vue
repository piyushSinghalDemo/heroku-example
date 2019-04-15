<template>
  <div id="register">
    <v-container style="padding-top:10px">
      <v-form ref="form"  v-model="valid" @submit.prevent="submit">
        <v-layout id="loginContainer" row wrap>
          <v-flex xs4 offset-xs4>
            <v-layout row wrap style="background: white;padding: 40px;border-radius: 15px">
              <v-flex justify-center>
                <img src="../../assets/images/essentio_logo_black.png" alt="Essentio logo" style="width:30%;">
              </v-flex>
            
              <v-flex xs12>
                 <v-text-field label="Enter your Email" append-icon="fa-envelope"
                  v-model="email"
                  required
                  :rules="emailRules">
                  </v-text-field>
              </v-flex>
              <v-flex xs12>              
              <!-- <v-btn :loading="loading" :disabled="loading"  @click.native="loader = 'loading'" @click="submit" 
                class="btn-color" large block>Recover your Password</v-btn> -->
                <vc-button :loading="loading" type="submit" :disabled="loading" itemText="Recover your Password"></vc-button>
              </v-flex>
              <v-flex xs6 class="text-sm-left">
                <!-- <router-link style="color:darkred !important" to="/Register">Create New Account</router-link> -->
              </v-flex>
              <v-flex xs6 class="text-sm-right" style="margin-top:13px">
                <router-link to="/login" style="color:darkred !important">Back</router-link>
              </v-flex>
           </v-layout>
          </v-flex>
        </v-layout>
      </v-form>
       <v-flex xs12 style="margin-top:3%">
          <span style="color:white"><i class="far fa-copyright"></i> 2018 Essentio Software LLC 1.0.2</span>
      </v-flex>
      <v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'
        >
        {{ snackbartext }}
      </v-snackbar>
    </v-container>
  </div>
</template>

<script>
  import config from '../../config.json'
  import { get as getToServer } from './../../methods/serverCall.js';
  import {FORGOT_PASSWORD} from '../../data/url_constants.js'
  import {RESET_PASSWORD_LINK_MESSAGE, reset_password_message} from '../../data/client_message.js'
  import vcButton from '@/views/button.vue'
 export default {
  data() {
      return {
        email: '',
        valid:true,
        snackbar:false,
        snackbartext:'',
        colorValue:'',
        loader: "loading",
        loading: false,
        snackbartimeout:5000,
        emailRules:[v => !!v || 'E-mail is required',
                      v => /.+@.+/.test(v) || 'E-mail must be valid']
      }
  },
  components:{
    'vc-button':vcButton
  },
  props: {
    msg: String
  },
  methods: {
    submit () {
      if (this.$refs.form.validate()) {
          this.forgot_password()
      }
    },
    forgot_password(){
      const l = this.loader
      this[l] = !this[l]
      this.loading = true;
      var user_provisioning_end_point = 
      config.USER_PROVISION_URL + FORGOT_PASSWORD + this.email
      getToServer(this, user_provisioning_end_point, true).then(user_provisioning_response => {
        this.loading = false;
        this.$cookies.set('forgot_password_email', this.email)
        this.snackbar = true
        this.colorValue = 'info'
        this.snackbartext = reset_password_message(this.email);
        this[l]  = false
        this.loader = null 
      }).catch(error_response => {
        this.loading = false;
        this.snackbar = true
        this.colorValue = 'error'
        this.snackbartext = error_response;
        this[l]  = false
        this.loader = null 
      });
    }
  }
}
</script>

