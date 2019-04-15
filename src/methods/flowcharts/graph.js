'use strict'
import concat from 'lodash/concat'
import findIndex from 'lodash/findIndex'
import _ from 'underscore';
import {HighlightUnHighlightInvalidCell} from './cells.js'
export function PerformSmartRouting(graph,cell,paper,paperSmall){
	var listOfElements = graph.getElements()
	var listOfLinks = graph.getLinks()
    if (_.contains(listOfElements, cell)) {
        _.each(listOfLinks, function(link) {
                paper.findViewByModel(link).update();
                if(paperSmall)
                	paperSmall.findViewByModel(link).update();
        });
    }
}

function IsNameExists(name,step_name_list){
	if(step_name_list.indexOf(name) > -1)
		return true
	return false
}

export function PerformStepNameValidation(cell_name,step_name_list){
	var new_cell_name = cell_name
	var iterator = 1
	while(IsNameExists(new_cell_name,step_name_list)){
			new_cell_name = cell_name +"("+iterator+")"
			iterator=iterator+1
	}
	return new_cell_name
}


export function PerformWorkflowStepNameValidation(cell_name,step_name_list){
	var new_cell_name = cell_name
	var iterator = 1
	var is_exists = true
	while(is_exists){
		var is_exists = IsNameExists(new_cell_name,step_name_list)
		if(is_exists){
			new_cell_name = cell_name +"("+iterator+")"
			iterator=iterator+1
		}
	}
	return new_cell_name
}

export function PerformStartEndValidation(cell, cell_name,step_name){
	if(step_name){
		cell.remove()
		return false
	}else{
		return cell_name
	}
}


export function GetAllStepNames(graph){
	var elements = graph.getElements()
	var step_names = []
	for(var i=0;i<elements.length;i++){
		step_names.push(elements[i].prop('stepname'))
	}
	return step_names
}

function get_cells_without_in_out_links(graph){
	var error_element_list=[]
	var elements = graph.getElements()
	var links = graph.getLinks()

	//check all elements has a proper link defined
	if(elements.length === links.length +1)
		return []
	for(var i=0;i<elements.length;i++){
		var connect_links = graph.getConnectedLinks(elements[i])
		if(connect_links.length !=2)
			error_element_list.push(elements[i].id)
	}
	return error_element_list
}
function get_links_without_join(graph,join_json){
	var error_link_list=[]
	var links = graph.getLinks()
	for(var i=0;i<links.length;i++){
		if(findIndex(join_json,links[i].id) < 0)
			error_link_list.push(links[i].id)
	}
	return error_link_list
}

function get_source_and_target_elemement(link_list){

}
export function validate_graph_data_for_selection(graph,paper,elements_list,link_list,graph_table_error_message){
	HighlightUnHighlightInvalidCell(graph,paper,[],graph_table_error_message)
	if(link_list)
		get_source_and_target_elemement(link_list)
	if(elements_list || link_list){
		var error_cells_list = concat(elements_list,link_list)
		HighlightUnHighlightInvalidCell(graph,paper,error_cells_list,graph_table_error_message)
	}
}

export function get_elements_ids_by_name(graph,elements_name_lists){
	var elements = graph.getElements()
	var elements_id_list = []
	for(var i=0;i<elements.length;i++){
		var element_name = elements[i].prop('table_name').trim()
		if(elements_name_lists.indexOf(element_name) >-1 
			&& elements_id_list.indexOf(elements[i].id === -1) ){
			elements_id_list.push(elements[i].id)
		}
	}
	return elements_id_list
}