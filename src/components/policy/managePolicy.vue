<template>
	<div id="add_workflow_template">
		<v-layout row wrap pl-4 class="breadcrumbBackground">
            <v-flex xs8 style="margin:auto">
                <v-layout row wrap>
                    <v-flex xs12 pl-3>
						<ul class="breadcrumb">
							<li><router-link to="/dashboard">Home</a></router-link>
							<li><router-link to="/policyList">Policy List</a></router-link>
							<li><router-link to="/policyList">{{Environment.name}}</a></router-link>
							<li><span style=""><input type="text" v-model='policy_name' 
								:rules="policyNameRulse" /></span></li>
						</ul>
                    </v-flex>
                     <v-flex >
                       
                    </v-flex>
                </v-layout>
                
            </v-flex>
            <v-flex xs4 text-xs-right pr-4 pb-1 style="">
                <!-- <v-select style="width:70%;float:right;padding:0px;margin:0px" v-model="dummyData" :items="['test-1','test-2']"  hide-details>
                </v-select> -->
               
            </v-flex>
        </v-layout>
		<v-container grid-list-md text-xs-center style="padding:3px;">
			<!-- <v-flex mb-3>
			<ul class="breadcrumb">
				<li><a href="/">Home</a></li>
				<li><a href="/policyList">Policy List</a></li>
				<li><span style=""><input type="text" v-model='policy_name' :disabled="edit_page == true" :rules="policyNameRulse" /></span></li>
			</ul>
			</v-flex> -->
			<v-form v-model="valid" ref="add_policy_form" style="margin-top: 5px;">
				<v-card>
					<v-container>
						<v-content>
							<!-- <v-layout row wrap>
								<v-flex xs3 class="v-align">
									<label class="v-label" style="text-align: left;">Environment List:</label>
								</v-flex>
								<v-flex xs8 mr-2>
									<v-tooltip bottom>
										<v-autocomplete slot="activator" single-line hide-details :items="EnvironmentList" item-text="name" label="Select Environment"
										 v-model="Environment" required :rules="EnvironmentListRules" return-object :disabled="edit_page == true"
										 style="width:60%">
										</v-autocomplete>
									</v-tooltip>
								</v-flex>
							</v-layout>
 -->
							<v-layout row wrap align-content-start v-for="(each, idx) in PolicyTypeList" :key="idx">
								<v-flex xs3 class="v-align">
									<label class="v-label" style="text-align: left;">{{each.type}} Value Type:
									</label>
								</v-flex>
								<v-flex xs8 pl-4 pr-4>
									<v-radio-group v-model="each.value_type" row @change="resetValue(each)">
										<v-radio :color="colorCode" label="Actual Date" value="actual_date"></v-radio>
										<v-radio :color="colorCode" label="Days" value="days"></v-radio>
										<v-radio :color="colorCode" label="Months" value="months"></v-radio>
										<v-radio :color="colorCode"  label="Quarters" value="quarters"></v-radio>
										<v-radio :color="colorCode" label="Years" value="years"></v-radio>
									</v-radio-group>
								</v-flex>
								<v-flex xs3 class="v-align">
									<input type="hidden" v-model="each.policy_type_id">
									<label class="v-label" style="text-align: left;">{{each.type}}:</label>
								</v-flex>
								<v-flex xs8 pl-4>
									<v-text-field style="width:60%" type="number" v-if="each.value_type != 'actual_date'" v-model="each.value"
									 :label="each.value_type" required :rules="[v => !!v || 'Value is required.']"></v-text-field>
									<v-menu v-if="each.value_type === 'actual_date'" :ref="('menu-' + idx)" :close-on-content-click="false"
									 v-model="each.menu" :nudge-right="40" lazy transition="scale-transition" offset-y full-width min-width="290px"
									 style="width:60%">
										<v-text-field slot="activator" v-model="each.value" label="Select Date" prepend-icon="event" readonly
										 clearable required :rules="[v => !!v || 'Date is required.']"></v-text-field>
										<v-date-picker v-model="each.value" no-title scrollable :allowed-dates="allowedDates" @input="selectDatepicker(idx, each.value)">
											<v-spacer></v-spacer>
											<!-- <v-btn flat color="primary" @click="cancleDatepicker(idx, false)">Cancel</v-btn> -->
											<!-- <v-btn flat color="primary" @click="selectDatepicker(idx, each.value)">OK</v-btn> -->
										</v-date-picker>
									</v-menu>
								</v-flex>
							</v-layout>
							<v-layout>
								<v-flex xs3 class="v-align">
									<input type="hidden" v-model="fiscal_year">
									<label class="v-label" style="text-align: left;">Fiscal Year:</label>
								</v-flex>
								<v-flex xs8 pl-4>
									<!-- <v-menu
									ref="menu"
									:close-on-content-click="false"
									v-model="menu"
									:nudge-right="40"
									:return-value.sync="date"
									lazy
									transition="scale-transition"
									offset-y
									full-width
									max-width="290px"
          							min-width="290px" style="width:60%">
										<v-text-field slot="activator"
										v-model="fiscal_year"
										label="Select Fiscal Year"
										prepend-icon="event" clearable
										readonly :rules="[v => !!v || 'Fiscal year is required.']"
										></v-text-field>
										<v-date-picker v-model="fiscal_year" type="month" no-title scrollable  @input="$refs.menu.save(fiscal_year)"
										>
										</v-date-picker>
									</v-menu> -->
									<v-flex xs8 mr-2>
									<!-- <v-tooltip bottom> -->
										<v-autocomplete slot="activator" single-line hide-details :items="month_list" item-text="text" item-value="text" label="Select Fiscal Year"
										 v-model="fiscal_year" required :rules="FiscalRules"
										 style="width:60%">
										</v-autocomplete>
									<!-- </v-tooltip> -->
								</v-flex>
								</v-flex>
							</v-layout>
						</v-content>
					</v-container>
				</v-card>
				<v-layout row wrap mt-2>
					<v-flex xs12 class="text-xs-right">
						<v-btn outline :color="outlineColor" @click="submit" :loading="loading" :disabled="loading" 
							 style="border-radius:10px"  @click.native="loader = 'loading'">Save</v-btn>
					</v-flex>
				</v-layout>
			</v-form>
			<v-snackbar v-model="snackbar" :right=true :top=true :timeout=snackbartimeout :color='colorValue'>
				{{ snackbartext }}
			</v-snackbar>
		</v-container>
	</div>
</template>
<style scoped>
	.v-text-field.v-text-field--solo .v-input__control{
	min-height: 20px;
	}
</style>
<script>
	import dateformat from '../sqlDesigner/dateformat.vue'
	import config from '../../config.json'
	import { post as postToServer } from './../../methods/serverCall.js';
	import { get as getToServer } from './../../methods/serverCall.js';
	import {SERVER_ERROR} from '../../data/client_message.js'
	import {GET_ALL_POLICY_TYPE_LIST, ADD_POLICY_DETAILS, POLICY_LIST, GET_ALL_ENV,GET_POLICY_DETAILS, UPDATE_POLICY_DETAILS, GET_ENVIRONMENT_BY_ID, GET_ENV_BY_ID} from '../../data/url_constants.js'
  import {COLOR_CODE, BTN_COLOR} from '../../data/macros.js'	
  import {DAY_OF_MONTH_ARRAY} from '../../data/metaData.js'
	export default {
	components:{
	    dateformat
	  },
		data () {
		return {
			outlineColor:BTN_COLOR,
			colorCode:COLOR_CODE,
			date: null,
    		menu: false,
			snackbar:false,
			snackbartext:'',
			snackbartimeout:5000,
			colorValue:'error',
			loader: "loading",
			loading: false,
			valid: true,
			ProcessList: [],
			PolicyTypeList: [],
			policy_type: '',
			policy_value: '',
			ShowErrorMessage:false,
			ErrorTitle:'',
			ErrorMessage:'',
			value_type: 'actual_date',
			dateformatobj:'',
			dateformat_dialog: false,
			policy_type_list: [],
			menu: false,
			policy_name: 'Untitled Policy name',
			policyNameRulse: [v => !!v || 'Policy name is required.'],
			edit_page: false,
			Environment: "0",
			EnvironmentList: [],
			FiscalRules: [v => !!v || 'Fisacal year required.'],
			fiscal_year: null,
			month_list:DAY_OF_MONTH_ARRAY,
			policy_id: null,
			old_policy_name:'',
			// MonthList:[{"name":"January","value":"Jan"},{"name":"January","value":"Jan"},{"name":"January","value":"Jan"},{"name":"January","value":"Jan"},{"name":"January","value":"Jan"},{"name":"January","value":"Jan"},{"name":"January","value":"Jan"},{"name":"January","value":"Jan"},{"name":"January","value":"Jan"},{"name":"January","value":"Jan"},]
			// 
			}
		},
		watch:{
			// date (val, index) {
			// 	this.PolicyTypeList[index].value = val
	  //     },
		},
		mounted () {
			var env_value = this.$session.get('selected_env')
	        if( env_value && env_value.id != '0'){
	            this.Environment = this.$session.get('selected_env')
	        }
			this.edit_page = this.$route.params.type == 'edit' ? true:false;
			if(this.$route.params.env_obj){
				this.Environment = this.$route.params.env_obj
			}
			if (this.$route.params.policy_name) 
			{
				
				this.GetPolicyDetailsById()
			}else{
				
				this.GetAllPolicyTypeList()
			}
			// this.getEnvironmentList();
		},
		methods: {
			resetValue(record){
				record.value = "";
			},
			// getEnvironmentList () {
   //          getToServer(this, config.ENVIRONMENT_API_URL + GET_ALL_ENV + this.$session.get('client_id')).then(response => {
   //              if(response){
   //              response.push({'id': 'all', 'name': 'Repository'})
   //              this.EnvironmentList = response
   //              // console.log(this.EnvironmentList)
   //              } else {
   //              this.errorMsg = response
   //              }
   //          },response => {
   //              this.ShowErrorMessage=true
   //              this.ErrorMessage=response
   //          }).catch(EnvironmentError => {
   //              if(EnvironmentError){
   //                  // this[l]  = false
   //                      this.loader = null 
   //                      this.snackbar = true
   //                      this.colorValue = 'error'
   //                      this.snackbartext = EnvironmentError;
   //                  }
   //                  else {
   //                      this.snackbar = true
   //                      this.colorValue = 'error'
   //                      this.snackbartext = SERVER_ERROR;
   //                  }
   //          	})
   //      	},
			allowedDates (val) {
				const today = new Date()
				return new Date(val) <= today
			},
			selectDatepicker(index, val) {
		    	this.$refs[`menu-${index}`][0].save(val);
		    },
		    cancleDatepicker(index, val){
		    	this.$refs.its[`menu-${index}`] = val
		    },
			formatDate (date) {
		      if (!date) return null

		      const [year, month, day] = date.split('-')
		      return `${month}/${day}/${year}`
		    },
			getdate(index, data){
		      this.PolicyTypeList[index].value = data
		      this.dateformat_dialog = false
		    },
		    parseDate (date, index) {
	          if (!date) return null
	          const [month, day, year] = date.split('/')
	          return (`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`, index)
	        },
			clear () {
				this.$refs.add_policy_form.reset()
			},
			submit () {
				if (this.$refs.add_policy_form.validate()) {
					this.save()
				}
			},
			save () {
				if (this.$route.params.policy_name && this.$route.params.type == 'edit') 
				{
					this.updatePolicyData()
				} 
				else 
				{
					this.savePolicyDetails()
				}	
			},
			datePicker(){
		      this.dateformat_dialog = true
		    },
			savePolicyDetails () {
				const l = this.loader
				this[l] = !this[l]
				this.Environment = this.$route.params.env_obj
				this.$session.set('selected_env', this.Environment)
				var client_id = this.$session.get('client_id')
				var add_policy_url = config.POLICY_URL + ADD_POLICY_DETAILS
				var policy_data = {
					'client_id': client_id,
					'policy_name': this.policy_name.trim(),
					'fiscal_year': this.fiscal_year,
					'env_name': this.Environment.name,
					'env_id': this.Environment.id,
					// 'policy_type': this.value_type,
					'policy_value_list': this.PolicyTypeList
				}
				var _this = this
				postToServer(_this, add_policy_url, policy_data).then(addResponse  => {
						this.$router.push({ name: 'ManagePolicyList', params: { 'env_obj': _this.Environment}})
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
					this.colorValue = 'error'
					this.snackbartext = SERVER_ERROR;
					this[l]  = false
					}
				});
			},
			GetAllPolicyTypeList () {
			var get_policy_type_url = config.POLICY_URL + GET_ALL_POLICY_TYPE_LIST
			getToServer(this, get_policy_type_url, true).then(response => {
				this.PolicyTypeList = response
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
			GetPolicyDetailsById () {
			var get_policy_details_url = config.POLICY_URL + GET_POLICY_DETAILS 
			var data = {
				'policy_name':  this.$route.params.policy_name,
				'env_id': this.$route.params.env_id
			}
			var type = this.$route.params.type
			postToServer(this, get_policy_details_url, data).then(response => {
				this.policy_name = this.$route.params.type == 'copy'? 'Copy_of_'+response.policy_name:response.policy_name//response.policy_name
				this.env_name = response.env_name
				this.fiscal_year = response.fiscal_year
				this.env_id = response.env_id
				this.policy_id = response.id
				console.log(this.env_id)
				this.PolicyTypeList = response.policy_value_list
				this.old_policy_name = this.policy_name
				// if(type == 'edit'){
				// 	this.getEnvironmentById()
				// }
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
			getEnvironmentById(){
				var url = config.ENVIRONMENT_API_URL + GET_ENV_BY_ID + this.env_id
				getToServer(this, url, true).then(response => {
					this.Environment = response
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
			updatePolicyData () {
				const l = this.loader
				this[l] = !this[l]
				var client_id = this.$session.get('client_id')
				var update_data_url = config.POLICY_URL + UPDATE_POLICY_DETAILS + this.$route.params.policy_name
				var update_data =  {
				'client_id': client_id,
				'policy_name': this.policy_name,
				'policy_id': this.policy_id,
				'env_name': this.Environment.name,
				'env_id': this.Environment.id,
				'fiscal_year': this.fiscal_year,
				'old_policy_name':this.old_policy_name,
				'policy_value_list': this.PolicyTypeList}
				var _this = this
				postToServer(_this, update_data_url, update_data).then(response => {
					this.$router.push({ name: 'ManagePolicyList', params: { 'env_obj': _this.Environment}})
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
					this.colorValue = 'error'
					this.snackbartext = SERVER_ERROR;
					this[l]  = false
					}
				});
			}
		
		}
	}
</script>
<style>
.v-align{
	margin:auto 0px;
	text-align:left;
}
</style>
