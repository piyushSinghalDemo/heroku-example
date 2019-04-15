<style src="jointjs/dist/joint.min.css"></style>
<style src="material-icons/iconfont/material-icons.css"></style>
<style>
  @import "./assets/fontawesome-free-5.1.0-web/css/all.css";
  @import "./assets/css/googlefontmaterial.css";
  @import "./css/app.css";
</style>

<template>
  <div id="app">
      <v-app>
          <v-content v-if='isloggedin'>
            <customHeader></customHeader>
              <v-container class="background" id="dashboard-routing" 
               :class="{'navigationPadding':!removeHeader, 'headerPadding':removeHeader}">
                  <router-view ></router-view>      
              </v-container>
        </v-content>
        <v-content v-else>
          <div class="" :style="{'background': ' RGB(51,51,51)', 'background-size': '100% 100%', 'min-height': imageHeight }">
              <v-container class="background">
                  <router-view ></router-view>      
              </v-container>
          </div> 
        </v-content>

          <!-- </div>  -->

      </v-app>
  </div>
</template>

<script>
import customHeader from './components/customHeader.vue'
import Register from './components/authorization/register'
import Schedule from './components/schedular/schedule'
import { sessioncheck } from './methods/user_session.js';

export default {
  name: 'app',
  data() {
      return {
        imageHeight:'530px',
        backgroundImage: require('./assets/images/LasVegas.jpg'),
        isloggedin:false
      }
    },
    computed:{
      removeHeader() {
        return this.$route.path === '/businessobjectdesigner' || this.$route.path === '/Flowchart'
      }
    },
  components: {
    'customHeader': customHeader,
    'register':Register,
    'schedule':Schedule,
  },
  watch:{
    "$breadcrumbs":{
      handler(newVal){
        if(newVal)
        this.validate_routing();
      },
      deep:true
    }
  },
  mounted() {
    // this.isloggedin=true; 
    this.validate_routing();
  },
  methods: {
    validate_routing(){
      var breadcrumbsstring = this.$breadcrumbs[0].meta['breadcrumb'];
      var crump = breadcrumbsstring.split('/'),
      crumpLength = crump.length,
      key = crump[crumpLength-1];
      key =  key.replace(/ /g, '');
      let array = ['Register','Login', 'ForgotPassword', 'ResetPassword', 'ApprovalTask', 'ResendEmail'];
      let param = array.includes(key)
      if(!param){
        sessioncheck(this)
        this.isloggedin = true
      }
      else {
        if(!this.$session.exists()){
          this.isloggedin = false
          // provide dynamic height to background
          this.imageHeight = window.innerHeight + 'px';
        }
        else
          window.location.href = "/dashboard"
        }
      }
  },
}
</script>
<style scoped>
.navigationPadding{
  padding-top:110px !important;
}
.headerPadding{
  padding-top:35px !important;
}
</style>
