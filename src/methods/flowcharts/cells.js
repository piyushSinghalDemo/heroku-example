'use strict'
import config from '../../config.json'
import {get_bin_box} from "./shapes.js"
import {get_port_group,get_port_items,reset_port_markup} from "./ports.js"
import {getDefaultLinkProperies} from "./links.js"
import _ from 'lodash'
export function PerformCellSelection(that,selected,cellView){
	if(selected){
		selected.unhighlight()
	}
	selected = cellView
	that.selected_el = cellView
	selected.highlight();
	that.is_selected = true
}

export function PrepareContextMenu(that,selected,cellView){
	selected = cellView
	selected.highlight();
	that.selected_el = cellView
	that.is_selected = true
}

export function KeepCellInsidePaper(cellView,evt,x,y,gridSize,paper_width,paper_heigth){
	var bbox = cellView.getBBox();
	var constrained = false;

	var constrainedX = x;

	if (bbox.x <= 0) { constrainedX = x + gridSize; constrained = true }
	if (bbox.x + bbox.width >= paper_width) { constrainedX = x - gridSize; constrained = true }

	var constrainedY = y;

	if (bbox.y <= 0) {  constrainedY = y + gridSize; constrained = true }
	if (bbox.y + bbox.height >= paper_heigth) { constrainedY = y - gridSize; constrained = true }

	    //if you fire the event all the time you get a stack overflow
	    if (constrained) { cellView.pointermove(evt, constrainedX, constrainedY) }
	  }

	var highlighter_invalid_cell = {
		highlighter: {
			name: 'stroke',
			options: {
				padding: 10,
				rx: 5,
				ry: 5,
				attrs: {
					'stroke-width': 3,
					stroke: '#FF0000'
				}
			}
		}
	}

export function HighlightInvalidCell(graph,paper,error_cell_lists){
	var all_cells = graph.getElements()
	for(var i=0;i<all_cells.length;i++){
		if(i%2 === 0){
			paper.findViewByModel(all_cells[i]).highlight(null, highlighter_invalid_cell)
		}
	}
}


export function HighlightUnHighlightInvalidCell(graph,paper,error_cell_lists,graph_table_error_message){
	var all_cells = graph.getCells()
	for(var i=0;i<all_cells.length;i++){
		//first unhighlight the cell.
		paper.findViewByModel(all_cells[i]).unhighlight(null, highlighter_invalid_cell)
		if(error_cell_lists.indexOf(all_cells[i].id) >=0){
			paper.findViewByModel(all_cells[i]).highlight(null, highlighter_invalid_cell)
				if(all_cells[i].attributes.type===config.JOINT_RECT_TYPE){
					// all_cells[i].attr('root/title',graph_table_error_message)
				}
				else if(all_cells[i].attributes.type===config.JOINT_LINK_TYPE){
					// all_cells[i].attr('root/title','Join not defined')
			}
		}
	}
}

export function GetCellById(graph,cell_id){
	var cell = graph.getCell(cell_id)
	cell.attr('text/text','Business Object Keys')
	cell.prop('table_name','Business Object Keys')
	cell.prop("table_type","BusinessObjectKeys")
	return cell
}

export function getAllSelectedBusinessObjsDetailsold(graph){
    var elements = graph.getElements()
    var business_object_list = []
    if(elements){
    	for(var i=0;i<elements.length;i++){
    		if(elements[i].prop('steptype') === 'Archival'){
    			if(elements[i].prop('bus_id')){
    				business_object_list.push({"bus_id":elements[i].prop('bus_id'),
    					"policy_id":elements[i].prop('policy_id'),"bus_name":elements[i].prop('bussinessObjectName')})
    			}
    		}
    	}
    }
  return business_object_list
}


export function getAllSelectedBusinessObjsDetails(graph){
    var elements = graph.getElements()
    var business_object_list = []
    if(elements){
    	for(var i=0;i<elements.length;i++){
    		if(elements[i].prop('steptype') === 'Archival' ||elements[i].prop('steptype') === 'Copy' ||elements[i].prop('steptype') === 'Purge'){
    			if(elements[i].prop('bus_id')){
    				business_object_list.push({"bus_id":elements[i].prop('bus_id'),"bus_name":elements[i].prop('bussinessObjectName')})
    			}
    		}
    	}
    }
  return business_object_list
}

export function validateEnvCell(graph,cell){
	var links = graph.getConnectedLinks(cell, { inbound: true })
	if (links.length <=0)
		return false
	for (var i = links.length - 1; i >= 0; i--) {
		var source_id = links[i].get('source').id
		var source = graph.getCell(source_id)
		if(source.prop('is_special_cell'))
			return false
	}
	return true
	// var out_links = graph.getConnectedLinks(cell, { outbound: true })
	// for (var i = out_links.length - 1; i >= 0; i--) {
	// 	var target_id = out_links[i].get('target').id
	// 	var target = graph.getCell(target_id)
	// 	if(target.prop('shape_type') === "unpublish"){
	// 		return {"route":target.prop('workflow_details'),"unpublish_id":target_id}
	// 	}
	// }
	// return {"is_valid":"true"}
	// // _this.graph.addCell(get_bin_box(_this,100,100,
	// // 	_this.cell_width/2,_this.cell_width/2,_this.binbox,"Test"))
}

export function drawbinbox(graph,cell,image,route){
	if(cell.prop('unpublish_id')){
		var unpblish_cell = graph.getCell(cell.prop('unpublish_id'))
		unpblish_cell.attr('text',route.workflow_name)
		unpblish_cell.prop("workflow_id",route.id)
		unpblish_cell.prop("workflow_details",route)
		return
	}
	var x = cell.attributes.position.x
	var y = cell.attributes.position.y
	var width = cell.attributes.size.width
	var height = cell.attributes.size.height
	var new_cell = get_bin_box(x,y-100,
		width/2,height/2,image,route.workflow_name,"unpublish")
	new_cell.set('ports',{'groups':get_port_group(),'items':get_port_items(1)})
	var new_cell_id = new_cell.id
	new_cell.prop("workflow_id",route.id)
	new_cell.prop("workflow_details",route)
	graph.addCell(new_cell)
	var created_cell = graph.getCell(new_cell_id)
	var new_link = getDefaultLinkProperies()
	new_link.prop('is_for_unpublish',"Yes")
	new_link.source(cell)
  new_link.target(created_cell)
  new_link.addTo(graph)
}

function getHeighlightStatus(color_code){
return {
		highlighter: {
			name: 'stroke',
			options: {
				padding: 10,
				rx: 5,
				ry: 5,
				attrs: {
					'stroke-width': 3,
					stroke: color_code
				}
			}
		}
	}
}


export function HeighLightWorflowStatusCell(graph,paper,response){
	var all_cells = graph.getElements()
	var actions_json = {}
	var rejected_step = ''
	if(response.status.rejected_step){
		rejected_step = response.status.rejected_step['step_id'] //json
	}

	var completed_steps = []
	
	if(response.status.completed_step){
		for (var i = response.status.completed_step.length - 1; i >= 0; i--) {
			completed_steps.push(response.status.completed_step[i]["step_id"])
			actions_json[response.status.completed_step[i]["step_id"]] = response.status.completed_step[i]
		}
	}

	var running_step = ''
	if(response.status.running_step && response.status.running_step['step_id']){
		running_step = response.status.running_step['step_id']
		actions_json[running_step] = response.status.running_step
		}

	if(response.current_status === 'approved'){

	}
	else if(response.current_status === 'rejected'){

	}
	for (var i = all_cells.length - 1; i >= 0; i--) {
		reset_port_markup(all_cells[i],0)
		var current_cell = all_cells[i].id
		if(running_step === current_cell){
			paper.findViewByModel(all_cells[i]).highlight(null, getHeighlightStatus('#87ceeb'))
			paper.findViewByModel(all_cells[i]).model.attr('root/title','Running')
		}
		else if(completed_steps.indexOf(current_cell) >-1){
			paper.findViewByModel(all_cells[i]).highlight(null, getHeighlightStatus('#00FF00'))
			paper.findViewByModel(all_cells[i]).model.attr('root/title','Completed')
		}
	}
	return actions_json
}


function fetchPolicyFromDateDetails(datedetails,selectedPolicies){
	var date_details = {
		'policy_name':datedetails.policy_name,
		'policy_sub_type_name':datedetails.policy_sub_type_name,
		'bo_id':datedetails.bo_id,
		'bo_name':datedetails.bo_name
	}
	if(!_.find(selectedPolicies,date_details))
		selectedPolicies.push(date_details)
	return selectedPolicies
}


function getSelectionSelectedPolicies(step_data,selectedPolicies){
	if(!step_data)
		return selectedPolicies
	if(!step_data.filter)
		return selectedPolicies
	var filters = step_data.filter
	for (var i = filters.length - 1; i >= 0; i--) {
		if(filters[i].v_type1 && filters[i].v_type1.toLowerCase()==='date' && filters[i].datedetails1 && filters[i].datedetails1.is_policy){
			selectedPolicies = fetchPolicyFromDateDetails(filters[i].datedetails1,selectedPolicies)
		}
		if(filters[i].v_type2 && filters[i].v_type2.toLowerCase()==='date' && filters[i].datedetails2 && filters[i].datedetails2.is_policy){
			selectedPolicies = fetchPolicyFromDateDetails(filters[i].datedetails2, selectedPolicies)
		}
	}
	return selectedPolicies
}

function getMergeMinusSelectedPolicies(step_data,selectedPolicies){
	if(!step_data.filter)
		return selectedPolicies
	var all_filters = step_data.filter
	var keys = Object.keys(all_filters)
	for(var j=keys.length-1;j>=0;j--){
		var filters = all_filters[keys[j]]
		if(!filters)
			continue
		for (var i = filters.length - 1; i >= 0; i--) {
			if(filters[i].v_type1 && filters[i].v_type1.toLowerCase()==='date' && filters[i].datedetails1 && filters[i].datedetails1.is_policy){
				selectedPolicies = fetchPolicyFromDateDetails(filters[i].datedetails1,selectedPolicies)
			}
			if(filters[i].v_type2 && filters[i].v_type2.toLowerCase()==='date' && filters[i].datedetails2 && filters[i].datedetails2.is_policy){
				selectedPolicies = fetchPolicyFromDateDetails(filters[i].datedetails2, selectedPolicies)
			}
		}
	}
	return selectedPolicies
}


export function getselectedPolicies(graph){
	var selectedPolicies = []
	var elements = graph.getElements()
	for (var i = elements.length - 1; i >= 0; i--) {
		
		if(!elements[i].attributes.step_data)
			continue
		if(!elements[i].attributes.steptype)
			continue
		var used_policies = []
		if(elements[i].attributes.steptype.toLowerCase() === 'selection'){
			selectedPolicies = getSelectionSelectedPolicies(elements[i].attributes.step_data,selectedPolicies)
		}
		else if(elements[i].attributes.steptype.toLowerCase() === 'merge' || elements[i].attributes.steptype.toLowerCase() === 'minus'){
			selectedPolicies = getMergeMinusSelectedPolicies(elements[i].attributes.step_data,selectedPolicies)
		}
		else if(elements[i].attributes.steptype.toLowerCase() === 'archival' || elements[i].attributes.steptype.toLowerCase() === 'copy' || elements[i].attributes.steptype.toLowerCase() === 'purge'){
			selectedPolicies = getSelectionSelectedPolicies(elements[i].attributes.step_data.drv_table,selectedPolicies)
		}
	}
	return selectedPolicies
}