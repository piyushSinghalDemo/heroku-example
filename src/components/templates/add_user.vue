<template>
   <div  id="adduser">   
    <v-flex xs12 >
      <v-card>
        <div class="inner-addon text-xs-right right-addon" style="margin-left:5px;">
          <div style="float:left;margin-top:7px;">
            <span style="color:rgba(0,0,0,0.54);font-weight:400;font-size:13px;"> Home /</span> &nbsp;<span style="font-weight:400;font-size:15px;">Add Users</span>
        </div>
        </div>
        <v-flex xs12>
          <v-data-table
            :headers="headers"
            :items="rows"
            hide-actions
            class="elevation-1"
            style="align:center"
          >
          <template slot="items" slot-scope="props">
            <td> 
             <v-flex>                  
                <v-text-field type="text" v-model="props.first_name"  placeholder="first name" style="margin-top:-10px;max-height:20px;text-align:center;" solo></v-text-field>
                </v-flex>
            </td>
            <td>
              <v-flex>  
                <v-text-field type="text" v-model="props.last_name"  placeholder="last name" style="margin-top:-10px;max-height:20px;text-align:center;" solo></v-text-field>
              </v-flex> 
            </td>
            <td>
              <v-flex>
                <v-text-field type="text" v-model="props.email"  placeholder="email" style="margin-top:-10px;max-height:20px;text-align:center;" solo></v-text-field>
              </v-flex>
            </td>
            <td>
                <v-flex>
                  <input type="checkbox" v-model="props.active" style="margin-top:-10px;max-height:20px;text-align:center;color:#494949;"><!-- </v-checkbox> -->
                </v-flex>
            </td>
            <td>
                <v-flex>
                  <a v-on:click="removeElement(index);" style="cursor: pointer"><v-icon small style="color:#494949">fa-times-circle</v-icon></a>
                </v-flex>
            </td> 
          </template>
          </v-data-table>
          <div>
            <v-flex class="text-xs-right">
              <v-btn color="blue"  style="color:white" @click="addRow
              ">Add Another
              </v-btn>
              <v-btn color="blue" style="color:white">
                  Save
              </v-btn>                    
              <!-- <button style="padding:10px" class="button" @click="addRow
              "><v-icon small >fa-save</v-icon></button>
              <button style="padding:10px" class="button" @click="addRow"><v-icon small s>fa-plus-square</v-icon></button>
              <button style="padding:10px" class="button" @click="addRow"><v-icon small >fa-trash-alt</v-icon></button> -->
            </v-flex>
          </div>
        </v-flex>
      </v-card>
    </v-flex>
  </div>
</template>

<style>

.table.v-table tbody td{
padding:5px;
}
.v-text-field.v-text-field--solo .v-input__control{
  min-height: 20px;
}
/*input, select, textarea {
  background-color:none;
  border-style:none;
  color: none;
  height: 20px;
}*/
</style>

<script>

export default {
  data () {
      return {
        headers: [{text: 'First Name', sortable:false}, 
                  {text: 'Last Name', sortable:false},
                  {text: 'Email', sortable:false},
                  {text: 'Active', sortable:false},
                  {text: 'Action', sortable:false}],
        rows : []
      }
    },
  methods: 
  {
    addRow: function() {
        // var elem = document.createElement('tr');
        this.rows.push({
            first_name:"",
            last_name: "",
            email: "",
            active:0,
            action:""
        });
    },
    removeElement: function(index) {
        this.rows.splice(index, 1);
    },
    setFilename: function(event, row) {
        var file = event.target.files[0];
        row.file = file
    }
  }
}
</script>




