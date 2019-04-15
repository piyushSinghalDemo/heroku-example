import {post as postToServer } from './serverCall.js';
import config from '../config.json'
import {GET_ALL_WORKFLOW_LIST} from '../data/url_constants'
export default function(_this){
    return new Promise(function(resolve, reject) {
    	var data = {'client_id': _this.$session.get('client_id'), 'object_type_code': "WF"}
        postToServer(_this, config.IDE_API_URL + GET_ALL_WORKFLOW_LIST, data, true).then(response => {
            return resolve(response);
        },response => {
            return reject(response);
        })    
    })
}
