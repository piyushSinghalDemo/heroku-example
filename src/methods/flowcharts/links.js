'use strict'
const joint = require('jointjs')
const cloneDeep = require('clone-deep')

var link_connector = { "name": 'rounded' }

var link_attrs = {
    '.connection': {
        stroke: '#333333',
        'stroke-width': 3
    },
    '.marker-target': {
        fill: '#333333',
        d: 'M 10 0 L 0 5 L 10 10 z'
    },
}

var without_target_head_arrow = {
    '.connection': {
        stroke: '#333333',
        'stroke-width': 3
    },
    '.marker-target': {
        fill: '#333333',
        d: 'M 0 0 L 0 0 L 0 0 z'
    },
}

var link_router = { name: 'manhattan' }

export function getDefaultLinkProperies(is_without_head_at_Target) {
    return new joint.dia.Link({
        router: link_router,
        connector: link_connector,
        attrs: is_without_head_at_Target?without_target_head_arrow:link_attrs,
        labels: [ { position: 0.2, attrs: { text: { text: '',fill:"#0000FF" } } },
        { position: 0.8, attrs: { text: { text: '' ,fill:"#0000FF"} } }  ]
    })
}

export function RestrictCyclicConnection(graph, graphlib, linkView) {
    var link = linkView.model
    if (graphlib.alg.findCycles(graph.toGraphLib()).length > 0) {
        link.remove();
        return true
            // show some error message here
        }
        return false
    }

/*
	this method will check if source link connect target element morethan 1 time.
	if it is,then delete newly draw line
        */
    export function ValidateOutgoingLink(graph, linkView) {
        var link = linkView.model
        if (link) {
            var source = link.get('source')
            var current_target = link.get('target')
            var source_outgoing_links = graph.getConnectedLinks(source, { outbound: true })
            if (source_outgoing_links && source_outgoing_links.length > 1) {
                for (var i = 0; i < source_outgoing_links.length; i++) {
                    var loop_link = source_outgoing_links[i]
                    var loop_link_target = loop_link.get('target')
                    if (loop_link.id != link.id && current_target.id === loop_link_target.id) {
                        link.remove()
                        return false
                    }
                }
            }
        }
        return true
    }

/*
	This function mainly used for business object where element wont have
	more than one incoming link
    */
    export function ValidateIncomingLink(graph, linkView) {
        var link = linkView.model
        if (link) {
            var current_source = link.get('source')
            var target = link.get('target')
            var target_incoming_links = graph.getConnectedLinks(target, { inbound: true })
            if (target_incoming_links && target_incoming_links.length > 1) {
                link.remove()
                return false
            }
        }
        return true
    }

export function ValidateOutgoingLinkForWorkflow(graph, linkView) {
        var link = linkView.model
        if (link) {
            var current_source_id = link.get('source')
            var target_id = link.get('target')
            var current_source = graph.getCell(current_source_id)
            if(current_source.attributes.shape_type == "workflow_end"){
                var target_incoming_links = graph.getConnectedLinks(current_source_id, { outbound: true })
                if (target_incoming_links && target_incoming_links.length > 0) {
                    link.remove()
                    return false
                }
            }
            if(current_source.attributes.shape_type == "workflow_users" || current_source.attributes.shape_type == "workflow_start"){
                var target_incoming_links = graph.getConnectedLinks(current_source_id, { outbound: true })
                if (target_incoming_links && target_incoming_links.length > 1) {
                    link.remove()
                    return false
                }

                var current_target = graph.getCell(target_id)
                if((current_source.attributes.shape_type == "workflow_start" && current_target.attributes.shape_type == 'condition') ||
                    (current_source.attributes.shape_type == "workflow_start" && current_target.attributes.shape_type == 'workflow_end')){
                    link.remove()
                    return false
                }

            }
            
        }
        return true
    }

export function ValidateIncomingLinkForWorkflow(graph, linkView) {
        var link = linkView.model
        if (link) {
            debugger
            var current_source = link.get('source')
            var target_id = link.get('target')
            var target = graph.getCell(target_id)
            if(target.attributes.attrs.text.text != "End" && target.attributes.attrs.text.text != "Start" ){
                var target_incoming_links = graph.getConnectedLinks(target, { inbound: true })
                if (target_incoming_links && target_incoming_links.length > 1) {
                    link.remove()
                    return false
                }
            }
            if(target.attributes.attrs.text.text == "Start"){
                link.remove()
            }
        }
        return true
    }

// function for dont allow to draw link without target
export function ValidateSourceTarget(cellView) {
    if (cellView.model) {
        var elem = cellView.model
        var source = elem.get('source')
        var target = elem.get('target')
        if (elem instanceof joint.dia.Link && (!source.id || !target.id)) {
            elem.remove()
        }
    }
}

export function redesignLinkattrs(link) {
    var redesignlink = link
    redesignlink.router = link_router
    redesignlink.connector = link_connector
    redesignlink.attrs = link_attrs
    return redesignlink
}

function getElementDetails(element) {
    var source_name = element.prop('stepname')
    var step_data = element.prop('step_data')
    if(element.prop('steptype') !== 'Merge' && element.prop('steptype') !== 'Minus' && element.prop('steptype') !== 'Selection')
        return false
    var column_list = []
        // debugger;
        if (step_data.selection) {
            var selection_data = step_data.selection
            for (var i = 0; i < selection_data.length; i++) {
                if (selection_data[i].alias_name) {
                    column_list.push(selection_data[i].alias_name)
                    continue;
                }
                if (selection_data[i].column_name)
                    column_list.push(selection_data[i].column_name)
                else if (selection_data[i].column_details) {
                    column_list.push(selection_data[i].column_details[0].column_name);
                // selection_data[i].column_details.map(() => {
                //     column_list.push(selection_data[i].column_name);
                // })
            }
        }
    }
    return { 'source_name': source_name, 'columns': column_list, 'selection':step_data.selection }
}

export function getAllIncomingLinksSourceDetails(graph, element, source_detail_list) {
    var links = graph.getConnectedLinks(element, { inbound: true })
        // var source_detail_list =[]
        for (var i = 0; i < links.length; i++) {
            var source = links[i].get('source')
            var data = getElementDetails(graph.getCell(source.id))
            if (data)
                source_detail_list.push(data)
            getAllIncomingLinksSourceDetails(graph, graph.getCell(source), source_detail_list)
        }
        return source_detail_list
    }

    export function GetHierarchyName(graph,child_id, HierarchyName=''){
        var element = graph.getCell(child_id)
        var child_tbl_name = element.prop('table_name').trim()
        var links = graph.getConnectedLinks(element, { inbound: true })
        if(links.length > 0){
        /* if link found then there is only one link between to cells in case of 
        business object.So we can directly fetch details at 0 level
        */
        var parent_cell = graph.getCell(links[0].get('source'))
        var parent_tbl_name = parent_cell.prop('table_name').trim()
        // if(parent_tbl_name === "BusinessObjectKeys"){
        // //Reached upto unique Identifier
        // return HierarchyName + ' - ' + 'BusinessObjectKeys'    
        // }
        if(!HierarchyName)
            HierarchyName = child_tbl_name
        HierarchyName = HierarchyName + ' - ' + parent_tbl_name
        return GetHierarchyName(graph,parent_cell.id,HierarchyName)
    }
    return HierarchyName
}
function getLink(source_id,source_port,target_id,target_port)
{ return new joint.dia.Link({
    "type": "link",
    "source": {
        "id": source_id,
        "magnet": "circle",
        "port": source_port
    },
    "target": {
        "id": target_id,
        "magnet": "circle",
        "port": target_port
    },
    "router": {
        "name": "manhattan"
    },
    "connector": {
        "name": "rounded"
    },
    "labels": [{
        "position": 0.2,
        "attrs": {
            "text": {
                "text": "1",
                "fill": "#0000FF"
            }
        }
    }, {
        "position": 0.8,
        "attrs": {
            "text": {
                "text": "1",
                "fill": "#0000FF"
            }
        }
    }],
    "has_flattening_restriction": "false",
    "attrs": {
        ".connection": {
            "stroke": "#333333",
            "stroke-width": 3
        },
        ".marker-target": {
            "fill": "#333333",
            "d": "M 10 0 L 0 5 L 10 10 z"
        }
    }
})
}
export function DrawLink(graph,source_cell,target_cell,join_json,unique_keys){
    debugger;
    var new_link = getLink(source_cell.id,source_cell.attributes.ports.items[3].id,target_cell.id,target_cell.attributes.ports.items[2].id)
    new_link.addTo(graph)
    var link_id = new_link.id
    var link_join_json = {
        "jfrom":source_cell.prop("table_name"),
        "jto":target_cell.prop("table_name"),
        "type":"Inner Join",
        "jfrom_id":source_cell.id,
        "jto_id":target_cell.id,
        "join_relationship":"1:1",
        "has_flattening_restriction":false,
        "hierarchyName":target_cell.prop("table_name")+" - "+ source_cell.prop("table_name"),
        "relationshipName":source_cell.prop("table_name") +" - "+target_cell.prop("table_name")
    }
    var conditions = []
    var condition_dict = {"jfrom":source_cell.prop("table_name"),
                        "jto":target_cell.prop("table_name"),
                        "operator":"_eq_"}

    for(var i=0;i<unique_keys.length;i++){
        var new_condition_dict = cloneDeep(condition_dict)
        new_condition_dict["from_column"] = unique_keys[i]
        new_condition_dict["to_column"] = unique_keys[i]
        conditions.push(new_condition_dict)
    }
    link_join_json["condition"] = conditions
    join_json.push({"id":link_join_json})
    join_json[0][link_id] = link_join_json
    delete join_json[0]["id"]
    // join_json.push({link_id:link_join_json})
    return true
}