import { post as postToServer } from './serverCall.js';
import { VALIDATE_PROCESS_DEFINITION, VALIDATE_FLOWCHART } from '../data/url_constants.js'
import config from '../config.json'


export function validate_process_def_json(
    that, process_defination_json) {
    var ValidateProcessDefinitionUrl = config.VALIDATION_URL + VALIDATE_PROCESS_DEFINITION + "true"
    return new Promise(function(resolve, reject) {
        postToServer(that, ValidateProcessDefinitionUrl,
            process_defination_json).then(
            validation_response => {
                return resolve(validation_response)
            }).catch(errorResponse => {
            return errorResponse
        });
    });
}
//
export function validate_flowchart(
    that, flowchart_json) {
    var ValidateFlowchartUrl = config.VALIDATION_URL + VALIDATE_FLOWCHART + "true"
    return new Promise(function(resolve, reject) {
        postToServer(that, ValidateFlowchartUrl,
            flowchart_json).then(
            validation_response => {
                return resolve(validation_response);
            }).catch(errorResponse => {
            return reject(errorResponse);
        });
    });
}