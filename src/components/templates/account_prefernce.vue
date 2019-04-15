<template>
   <div  id="client-settings">
    <v-flex xs12>
      <v-tabs fixed-tabs slider-color="red">
        <v-tab>
          Account Preferences
        </v-tab>
        <v-tab v-model="inactive" >
          Subscription
        </v-tab>
        <v-tab>
          Activity Logs
        </v-tab>
        <v-tab>
          Auditor
        </v-tab>
      </v-tabs>
    </v-flex>
    <v-card>
      <v-container fluid grid-list-lg>
        <v-layout row wrap>
          <v-flex xs12 style="color:white;">
            <v-card  align-center>
               <v-toolbar dark dense absolute>
                 <v-flex class="text-md-left">Preferences</v-flex>
                </v-toolbar>
                <v-data-table
                  :items="preferences"
                  class="elevation-1 text-md-left"
                  hide-actions
                  hide-headers
                 >
                  <template slot="items" slot-scope="props">
                    <td class="text-md-left" width="500px">{{ props.item.name }}</td>
                    <td class="text-md-left">{{ props.item.value }}</td>
                  </template>
                </v-data-table>
            </v-card>
          </v-flex>
          <v-flex xs12 style="color:white;">
            <v-card  align-center>
               <v-toolbar dark dense absolute>
                 <v-flex class="text-md-left">Details</v-flex>
                </v-toolbar>
                <v-data-table
                  :items="org_details"
                  class="elevation-1 text-md-left"
                  hide-actions
                  hide-headers
                 >
                  <template slot="items" slot-scope="props">
                    <td class="text-md-left" width="500px">{{ props.item.name }}</td>
                    <td class="text-md-left">{{ props.item.value }}</td>
                  </template>
                </v-data-table>
            </v-card>
          </v-flex>
          <!-- <v-flex xs12 style="color:white; margin-top:10px">
            <v-card  align-center>
               <v-toolbar dark dense absolute>
                 <v-flex class="text-md-left">Products</v-flex>
                </v-toolbar>
                <v-data-table
                  :items="products"
                  class="elevation-1 text-md-left"
                  hide-actions
                  hide-headers
                 >
                  <template slot="items" slot-scope="props">
                    <td class="text-md-left">{{ props.item.name }}</td>
                    <td class="text-md-left">{{ props.item.value }}</td>
                    <td class="text-md-left">{{ props.item.guide }}</td>
                  </template>
                </v-data-table>
            </v-card>
          </v-flex> -->
        </v-layout>
      </v-container>
    </v-card>
  </div>
</template>

<style>
.v-tabs__div{
  text-transform:none;
}

</style>

<script>
  
export default {
  data () {
      return {
        org_details :[{
            value: "Test",
            name: 'Organization',
          },
          {
            value: "30-5-2018 15:23:02 (DD/MM/YYY HH::MM:SS)",
            name: 'Account Creation Date',
            
          },
          {
            value: "Test Demo",
            name: 'Super Admin',
            
          },
          {
            value: "smita@erpdata.cloud",
            name: 'Super Admin Email',
            
          },
          {
            value: "+91 9812334567",
            name: 'Phone Number',
            
          }],

        preferences :[{
            value: "Asia / Calcutta",
            name: 'Time Zone Preferences',
          },
          {
            value: "DD/MM/YYY HH::MM:SS",
            name: 'Date Format',
            
          },
          {
            value: "Disable",
            name: 'User Mail Verification',
            
          },
          {
            value: "1 Days",
            name: 'Password Expires In',
            
          },
          {
            value: "2",
            name: 'Minimum Length Password',
            
          },
          {
            value: "4",
            name: 'New Password Cannot be Same as Previous How Many Password'
            
          },
          {
            value: "Number",
            name: 'Password must contain'
            
          }],
          products:[{
            value: "Manage User and there roles",
            name: 'User Provision',
            guide : 'User Guide'
            
          },
          {
            value: "Manage User and there roles",
            name: 'User Provision',
            guide : 'User Guide'
            
          },
          {
            value: "Viewing and analysing report",
            name: 'Reporting',
            guide : 'User Guide'
            
          }]
      }
    }
}
</script>

