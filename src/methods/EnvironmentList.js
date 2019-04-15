import {get as getToServer } from './serverCall.js';
import config from '../config.json'
import {GET_ALL_ENV, ENVIRONMENTLIST_BY_CLIENT} from '../data/url_constants'
export default function(_this){
	return new Promise(function(resolve, reject) {
		getToServer(_this, config.ENVIRONMENT_API_URL + '/get_all_environment'+'/' + _this.$session.get('client_id'), true).then(response => {
			return resolve(response);
		},response => {
			return reject(response);
		})    
	})
}

export function getEnvironmentList(_this,is_from_obj_mgmnt_page,is_from_env_page) {
    // is_from_obj_mgmnt_page - parameter used for add 2 extra env in case of call come from Object management page
	// is_from_env_page - paramter used for refresh env list incase of when user visit manage_env page and update something.
    //that should need to capture.
    debugger
    if(_this.$session.get('env_list') && !is_from_env_page)
	{
		_this.EnvironmentList = _this.$session.get('env_list')
        if(is_from_obj_mgmnt_page){
            _this.EnvironmentList.push({'id': 'all_env', 'name': 'All Environments'})
            _this.EnvironmentList.push({'id': '0', 'name': 'Repository'})
        }
		return
	}
    debugger
	getToServer(_this, config.ENVIRONMENT_API_URL + GET_ALL_ENV + _this.$session.get('client_id')).then(response => {
	if(response){
		_this.$session.set('env_list',response)
        if(is_from_env_page)
            return true
		_this.EnvironmentList = response
        if(is_from_obj_mgmnt_page){
            _this.EnvironmentList.push({'id': 'all_env', 'name': 'All Environments'})
            _this.EnvironmentList.push({'id': '0', 'name': 'Repository'})
        }
            // console.log(this.EnvironmentList)
        } else {
        	_this.errorMsg = response
        }
        _this.focus_env()
    },response => {
        // debugger;
        _this.ShowErrorMessage=true
        _this.ErrorMessage=response
    }).catch(EnvironmentError => {
    	if(EnvironmentError){
            // this[l]  = false
            _this.loader = null 
            _this.snackbar = true
            _this.colorValue = 'error'
            _this.snackbartext = EnvironmentError;
        }
        else {
        	_this.snackbar = true
        	_this.colorValue = 'error'
        	_this.snackbartext = SERVER_ERROR;
        }
    })
 }