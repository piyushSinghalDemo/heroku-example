import { post as postToServer } from './serverCall.js';
import {get as getToServer } from './serverCall.js';
import config from '../config.json'
import { SERVER_ERROR } from '../data/client_message.js'
import {
    GET_TABLES,
    GET_ALL_COLUMN,
    GET_STORED_PROCEDURE_LIST,
    GET_STORED_PROCEDURE_DETAILS,
    GET_BULK_TABLES_COLUMNS_URL
} from '../data/url_constants.js'
import { DESTINATION_QUEUE } from '../data/agent_constant.js'
import { sessioncheck, destroy_session } from './../methods/user_session.js';
import sizeof from 'object-sizeof'
import _ from 'lodash'


export function getTableList(that, env_id, connection_str, schema, db_type, table_search_string, tbl_object_type) {
    sessioncheck(that)
    var mapped_list = []
    if(that.$session.get('mapped_agent_details'))
        mapped_list = that.$session.get('mapped_agent_details')
    var mapped_agent_obj= _.find(mapped_list,['conn_str',connection_str])
    var mapped_agent_id = ''
    if(mapped_agent_obj)
        mapped_agent_id = mapped_agent_obj.mapped_agent_id
    var inputJson = {
        "table_name": table_search_string,
        "table_count": "",
        "env_id": env_id,
        "client_id": that.$session.get('client_id'),
        "conn_str": connection_str,
        "schema": schema,
        "db_type": db_type,
        "object_type": tbl_object_type,
        "mapped_agent_id":mapped_agent_id,
    }
    let tableUrl = config.AGENT_API_URL + GET_TABLES;
    return new Promise(function(resolve, reject) {
        let key = env_id + '_tableResponse';
        postToServer(that, tableUrl, inputJson).then(tableResponse => {
            if(!mapped_agent_id){
                mapped_agent_id = tableResponse.mapped_agent_id
                if (mapped_agent_id)
                {
                mapped_list.push({'conn_str': tableResponse.conn_str ,'mapped_agent_id':mapped_agent_id})
                that.$session.set('mapped_agent_details',mapped_list)
                }
            }
            return resolve(tableResponse)
        }).catch(errorResponse => {
            return reject(errorResponse)
        });
    });
}

export function getStoredProcedureList(that, env_id, procedure_search_string) {
    sessioncheck(that)
    var mapped_agent_id = that.$session.get('selected_env').mapped_agent_id
    var inputJson = {
        "table_name": procedure_search_string,
        "table_count": "",
        "env_id": env_id,
        "client_id": that.$session.get('client_id'),
         "mapped_agent_id":mapped_agent_id,
    }
    let tableUrl = config.AGENT_API_URL + GET_STORED_PROCEDURE_LIST;
    return new Promise(function(resolve, reject) {
        let key = env_id + '_procedureList';
        postToServer(that, tableUrl, inputJson).then(tableResponse => {
            return resolve(tableResponse)
        }).catch(errorResponse => {
            return reject(errorResponse)
        });
    });
}

export function getStoredProcedureDetails(that, procedure_name, env_id) {
    sessioncheck(that)
    var mapped_agent_id = that.$session.get('selected_env').mapped_agent_id
    var inputJson = {
        "table_name": "",
        "table_count": "",
        "env_id": env_id,
        "client_id": that.$session.get('client_id'),
        "procedure_name": procedure_name,
         "mapped_agent_id":mapped_agent_id,
    }
    let tableUrl = config.AGENT_API_URL + GET_STORED_PROCEDURE_DETAILS;

    return new Promise(function(resolve, reject) {
        let key = env_id + '_' + procedure_name;
        /**
         * Cache Check point
         */
        that.$store.state.cacheData = isLargeMemory(sizeof(that.$store.state.cacheData)) ? [] : that.$store.state.cacheData;

        if (that.$store.state.cacheData[key]) {
            return resolve(that.$store.state.cacheData[key])
        }
        postToServer(that, tableUrl, inputJson).then(tableResponse => {
            let value = tableResponse;
            that.$store.dispatch('setCacheData', { 'key': key, 'value': value });
            return resolve(tableResponse)
        }).catch(errorResponse => {
            return reject(errorResponse)
        });
    });
}

export function getTableColumns(that, table_column_list, env_id, connection_str, schema, table_name, table_type) {
    sessioncheck(that)
    var mapped_list = []
    if(that.$session.get('mapped_agent_details'))
        mapped_list = that.$session.get('mapped_agent_details')
    var mapped_agent_obj= _.find(mapped_list,['conn_str',connection_str])
    var mapped_agent_id = ''
    if(mapped_agent_obj)
        mapped_agent_id = mapped_agent_obj.mapped_agent_id
    var tbl = table_name.replace(/(\r\n\t|\n|\r\t)/gm, "");
    var inputJson = {
        "conn_str": connection_str,
        "env_id": env_id,
        "schema": schema,
        "table_name": tbl,
        "table_type": table_type,
        "client_id": that.$session.get('client_id'),
        "db_type": that.db_type,
         "mapped_agent_id":mapped_agent_id,
    }
    let tableColumnUrl = config.AGENT_API_URL + GET_ALL_COLUMN;
    return new Promise(function(resolve, reject) {
        let key = env_id + '_table_column_list';

        /**
         * Cache Check point
         */
        that.$store.state.cacheData = isLargeMemory(sizeof(that.$store.state.cacheData)) ? [] : that.$store.state.cacheData;

        if (!that.$store.state.cacheData[key]) {
            that.$store.state.cacheData[key] = [];
        }
        // debugger;
        for (var i = 0; i < that.$store.state.cacheData[key].length; i++) {
            if (that.$store.state.cacheData[key][i].table_name == table_name) {
                return resolve(that.$store.state.cacheData[key][i].table_column_list);
            }
        }
        postToServer(that, tableColumnUrl, inputJson).then(tableColumnResponse => {
            if (tableColumnResponse.length > 0) {
                that.$store.state.cacheData[key].push({
                    "table_name": table_name,
                    "table_column_list": tableColumnResponse
                })
            }
            if(!mapped_agent_id){
                mapped_agent_id = tableColumnResponse.mapped_agent_id
                if (mapped_agent_id)
                {
                    mapped_list.push({'conn_str': tableColumnResponse.conn_str ,'mapped_agent_id':mapped_agent_id})
                    that.$session.set('mapped_agent_details',mapped_list)
                }
            }
            return resolve(tableColumnResponse)
        }).catch(errorResponse => {
            return reject(errorResponse)
        });
    });
}


export function getBulkTablesColumns(that, table_column_list, env_id, connection_str, schema, table_details) {
    sessioncheck(that)
    var mapped_list = []
    if(that.$session.get('mapped_agent_details'))
        mapped_list = that.$session.get('mapped_agent_details')
    var mapped_agent_obj= _.find(mapped_list,['conn_str',connection_str])
    var mapped_agent_id = ''
    if(mapped_agent_obj)
        mapped_agent_id = mapped_agent_obj.mapped_agent_id
    var inputJson = {
        "conn_str": connection_str,
        "env_id": env_id,
        "schema": schema,
        "table_details": table_details,
        "client_id": that.$session.get('client_id'),
        "db_type": that.db_type,
         "mapped_agent_id":mapped_agent_id,
    }


    //remove steps table . no need to perform bulk search for steps data
    for (var i = table_details.length - 1; i >= 0; i--) {
        if (table_details[i].table_type === "step" || table_details[i].table_type == "S") {
            table_details.splice(i, 1)
        }
    }

    var list_to_return = []
    let tableColumnUrl = config.AGENT_API_URL + GET_BULK_TABLES_COLUMNS_URL;
    return new Promise(function(resolve, reject) {
        let key = env_id + '_table_column_list';

        /**
         * Cache Check point
         */
        that.$store.state.cacheData = isLargeMemory(sizeof(that.$store.state.cacheData)) ? [] : that.$store.state.cacheData;
        var data_to_pass_api = []

        if (!that.$store.state.cacheData[key]) {
            that.$store.state.cacheData[key] = [];
        }
        if (that.$store.state.cacheData[key].length === 0)
            data_to_pass_api = table_details
        else {
            for (var j = 0; j < table_details.length; j++) {
                var table_found = false
                for (var i = 0; i < that.$store.state.cacheData[key].length; i++) {
                    if (that.$store.state.cacheData[key][i].table_name == table_details[j].table_name) {
                        list_to_return.push({
                            "table_name": table_details[j].table_name,
                            "table_column_list": that.$store.state.cacheData[key][i].table_column_list
                        })
                        table_found = true
                        break;
                    }
                }
                if (!table_found)
                    data_to_pass_api.push(table_details[j])
            }
        }
        if (data_to_pass_api.length === 0)
            return resolve(list_to_return)
        inputJson["table_details"] = data_to_pass_api
        postToServer(that, tableColumnUrl, inputJson).then(tableColumnResponse => {
            if(!mapped_agent_id){
                mapped_agent_id = tableColumnResponse.mapped_agent_id
                if (mapped_agent_id)
                {
                mapped_list.push({'conn_str': tableColumnResponse.conn_str ,'mapped_agent_id':mapped_agent_id})
                that.$session.set('mapped_agent_details',mapped_list)
            }
            }
            return resolve(formatTableResponse(that, tableColumnResponse, list_to_return, key))
        }).catch(errorResponse => {
            return reject(errorResponse)
        });
    });
}

function formatTableResponse(that, tableColumnResponse, list_to_return, cache_key) {
    var keys = Object.keys(tableColumnResponse)
    for (var i = 0; i < keys.length; i++) {
        var new_json = {
            "table_name": keys[i],
            "table_column_list": tableColumnResponse[keys[i]]
        }
        that.$store.state.cacheData[cache_key].push(new_json)
        list_to_return.push(new_json)
    }
    return list_to_return
}

function isLargeMemory(bytes) {
    // debugger;
    let value = 0,
        type = 'Bytes';
    if ((bytes >> 30) & 0x3FF) {
        value = (bytes >>> 30) + '.' + (bytes & (3 * 0x3FF));
        type = 'GB';
    } else if ((bytes >> 20) & 0x3FF) {
        value = (bytes >>> 20) + '.' + (bytes & (2 * 0x3FF));
        type = 'MB';
    } else if ((bytes >> 10) & 0x3FF) {
        value = (bytes >>> 10) + '.' + (bytes & (0x3FF));
        type = 'KB';
    } else if ((bytes >> 1) & 0x3FF) {
        value = (bytes >>> 1);
        type = 'Bytes';
    } else {
        value = bytes;
        type = 'Bytes';
    }
    if (type == 'GB' || (type == 'MB' && parseInt(String(value)) > (config.WEB_CACHE_SIZE || 10))) {
        return true
    } else {
        return false;
    }
}