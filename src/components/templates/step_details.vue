<template>
  <div id="register">
    <v-container style="padding-top:10px">
      <v-layout id="stepdetailsContainer" row wrap>
        <v-flex xs6 offset-xs3>
          <v-layout row wrap style="background: white;padding: 40px;border-radius: 15px">
            <v-flex justify-center>
              <img src="../../assets/images/essentio.png" alt="Smiley face">
            </v-flex>
            <v-flex xs12>      
              <v-dialog v-model="dialog" width="400">
                <v-btn slot="activator" color="red lighten-2" dark >
                  Click Me
                </v-btn>
                <v-flex class="text-sm-right">               
                  <v-icon class="text-lg-left" @click="dialog = false" style="color:#dedede; height: 22px">fa-times-circle</v-icon> 
                </v-flex>
                <v-flex>
                  <v-card class="rounded-card">
                    <v-toolbar dark dense absolute style="height:17%">
                     <v-flex class="text-md-center">Step Details</v-flex>                        
                    </v-toolbar>
                    <!-- <v-container grid-list-md align-content-space-around> -->
                    <v-flex class="text-md-center"></v-flex>
                    <v-flex>
                      <v-form class="text-center">
                        <v-container fluid grid-list-md>
                        <v-flex  style="margin-top:12%">
                          <v-text-field label="Enter step name"></v-text-field>
                        </v-flex>
                        <v-flex>
                          <v-text-field label="Enter Description"></v-text-field>
                        </v-flex>
                        <v-btn color="success" large block>
                          Submit</v-btn>
                        </v-container>
                      </v-form>
                    </v-flex>  
                  </v-card>   
                </v-flex>                 
              </v-dialog>
            </v-flex>
          </v-layout>
          <v-layout>
            <v-flex xs12 style="margin-top:8%">
              <span style="color:white">@ Copyright 2018 Essentio Software LLC.All right reserved</span>
            </v-flex>
          </v-layout>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'Register',
    data() {
      return {
                dialog: false

        // backgroundImage: 'https://www.w3schools.com/images/lamp.jpg',
        // backgroundImage: require('../../assets/images/LasVegas.jpg'),
      }
    },
  props: {
    msg: String
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.rounded-card{
    border-radius:10px;
}

.step-title-color{
    color:  #000000;
    text-decoration-color: "white"
}
</style>
