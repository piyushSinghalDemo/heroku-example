const joint = require('jointjs')
import { get_port_attributes, get_port_group } from './ports.js'

function get_element_size(width, height) {
    return { "width": width, "height": height }
}

function get_rect_attribute() {
    return {
        "rx": 5,
        // fill:'rgba(0,0,255,0.3)'
    }
}

function get_termi_attribute() {
    return {
        "rx": 33,

        // fill:'rgba(0,0,255,0.3)'
    }
}


function get_text_attribute(text) {
    return { "text": text, 'font-weight': 'bold' }
}

function get_image_attributes(image, width, height) {
    return {
        "xlink:href": image,
        "width": width,
        "height": height,
    }
}


export function getTableRectangle(x, y, width, height, text, tbl_name, table_type){
    width = 150
    height = 40
    var display_table_name = tbl_name
    var font_size = 10
    var word_length = tbl_name.length
    if(word_length <= 14)
        font_size = 14
    else if(word_length<=15)
        font_size = 13
    else if(word_length <=17)
        font_size = 12
    else if(word_length <=19)
        font_size = 11
    else if(word_length >22)
        display_table_name = tbl_name.substring(0,19) + '...'

    var cell = getRectangle(x, y, width, height, display_table_name, tbl_name, table_type)
    cell.attr('text/font-size',font_size)
    return cell
}

export function getRectangle(x, y, width, height, text, tbl_name, table_type) {
    var rect = new joint.shapes.basic.Rect({
        // angle:2,
        position: {
            x: x,
            y: y
        },
        size: get_element_size(width, height),
        attrs: {
            rect: get_rect_attribute(),
            text: get_text_attribute(text),
        },
        ports: {

        },
    });
    if (tbl_name)
        rect.prop('table_name', tbl_name.trim())
    if (table_type) {
        rect.prop("table_type", table_type.trim())

        if (table_type == "step")
            rect.prop('is_drv_table', "true")
        else
            rect.prop('is_drv_table', "false")
    }
    return rect
}

export function getImage(x, y, width, height, image, text) {
    var image = new joint.shapes.basic.Image({
        // angle:2,
        position: {
            x: x,
            y: y
        },
        size: get_element_size(width, height),
        attrs: {
            rect: get_rect_attribute(),

            image: get_image_attributes(image, width, height),
            text: get_text_attribute(text),
        },
        ports: {

        },
    });
    return image
}
export function diagnolShape(x, y, width, height, image, text) {
    var erd = joint.shapes.erd;
    var shape = new erd.Relationship({

        position: {
            x: x,
            y: y
        },
        size: get_element_size(width, height),
        attrs: {
            text: get_text_attribute(text),
            '.outer': {
                fill: '#FFFFFF',
                stroke: '#000000'
                    // filter: { name: 'dropShadow', args: { dx: 0, dy: 2, blur: 1, color: '#333333' } }
            }
        }
    });

    return shape;
}
export function TerminatorShape(x, y, width, height, text, tbl_name, table_type) {
    var rect = new joint.shapes.basic.Rect({
        // angle:2,
        position: {
            x: x,
            y: y
        },
        size: get_element_size(70, 50),
        attrs: {
            rect: get_termi_attribute(),
            text: get_text_attribute(text),
            '.outer': {
                fill: '#FFFFFF',
                stroke: '#000000'
                    // filter: { name: 'dropShadow', args: { dx: 0, dy: 2, blur: 1, color: '#333333' } }
            },
        },
        ports: {

        },

    });

    return rect
}

export function EllipseShape(x, y, width, height, image, text) {
    // var erd = joint.shapes.erd
    var shape = new joint.shapes.standard.Ellipse({

        position: {
            x: x,
            y: y
        },
        size: get_element_size(85, 50),
        attrs: {
            text: get_text_attribute(text),
            '.outer': {
                fill: '#FFFFFF',
                stroke: '#000000'
                    // filter: { name: 'dropShadow', args: { dx: 0, dy: 2, blur: 1, color: '#333333' } }
            }
        }
    });
    return shape;
}
var space_size = 0

function Calculate_responsive_size(that) {
    that.stencil_paper_width = $('.card-body').width()
    var one_tenth_part = that.stencil_paper_width / 10
    space_size = (one_tenth_part * 1.5) / 3
    that.cell_width = (one_tenth_part * 8.5) / 3
}

export function getBasicCell(x, y, width, height, image, text, steptype) {

    var image = getImage(x, y, width, height, image, '');
    // var image = diagnolShape(x, y, width, height, image, text);
    image.prop('step_data', {})
    image.prop('stepname', text)
    image.prop('steptype', text)
    if (steptype)
        image.prop('steptype', steptype)
    return image
}
export function getDiagnolShape(x, y, width, height, image, text, steptype) {

    // var image = getImage(x, y, width, height, image, text);
    var image = diagnolShape(x, y, width, height, image, text);
    image.prop('step_data', {})
    image.prop('stepname', text)
    image.prop('steptype', text)
    if (steptype)
        image.prop('steptype', steptype)
    return image
}

export function getEllipseShape(x, y, width, height, image, text, steptype) {

    // var image = getImage(x, y, width, height, image, text);
    var image = EllipseShape(x, y, width, height, image, text);
    image.prop('step_data', {})
    image.prop('stepname', text)
    image.prop('steptype', steptype)
    if (steptype)
        image.prop('steptype', steptype)
    return image
}
export function getTerminatorShape(x, y, width, height, image, text, steptype) {
    // var image = getImage(x, y, width, height, image, text);
    var image = TerminatorShape(x, y, width, height, text);
    image.prop('step_data', {})
    image.prop('stepname', text)
    image.prop('steptype', text)
    if (steptype)
        image.prop('steptype', steptype)
    return image
}

export function get_bin_box(x, y, width, height, image, text, type) {
    var image = getImage(x, y, width, height, image, text)
    image.prop('shape_type', type)
    return image
}


export function getBorderedCell(x, y, width, height, image, text) {
    var image = new joint.shapes.standard.BorderedImage({
        // angle:2,
        position: {
            x: x,
            y: y
        },
        size: get_element_size(width, height),
        attrs: {
            rect: get_rect_attribute(),
            image: {
                "xlink:href": image,
                width: width,
                height: height,
            },
            text: get_text_attribute(text),
        },
        ports: {

        },
    });
    return image
}


export function getStepList(that) {
    Calculate_responsive_size(that)
    var start_point = space_size / 2
    var current_space_size = start_point

    var selectioncell = getBasicCell(current_space_size, 10, that.cell_width, that.cell_width, that.selection_img, 'Selection')
    current_space_size = current_space_size + that.cell_width + space_size

    var procedure = getBasicCell(current_space_size, 10, that.cell_width, that.cell_width, that.procedure_img, 'Procedure')


    current_space_size = current_space_size + that.cell_width + space_size

    var mergecell = getBasicCell(current_space_size, 10, that.cell_width, that.cell_width, that.merge_img, 'Merge')

    current_space_size = start_point


    var minuscell = getBasicCell(current_space_size, 140, that.cell_width, that.cell_width, that.minus_img, 'Minus')

    current_space_size = current_space_size + that.cell_width + space_size

    var archivalcell = getBasicCell(current_space_size, 140, that.cell_width, that.cell_width, that.archive_img, 'Archival')

    current_space_size = current_space_size + that.cell_width + space_size

    var copycell = getBasicCell(current_space_size, 140, that.cell_width, that.cell_width, that.copy_img, 'Copy')


    current_space_size = start_point

    var purgecell = getBasicCell(current_space_size, 270, that.cell_width, that.cell_width, that.purge_img, 'Purge')

    current_space_size = current_space_size + that.cell_width + space_size

    var duplicatecell = getBasicCell(current_space_size, 270, that.cell_width, that.cell_width, that.duplicates_img, 'Duplicate')

    current_space_size = current_space_size + that.cell_width + space_size

    var reportcell = getBasicCell(current_space_size, 270, that.cell_width, that.cell_width, that.report_img, 'Report')

    return [selectioncell, procedure, mergecell, minuscell, archivalcell, copycell, purgecell, duplicatecell, reportcell]
}
export function getJDCellsList(that) {
    var start_point = space_size / 2
    var current_space_size = start_point

    var jd1cell = getBorderedCell(current_space_size, 10, that.cell_width, 60, that.jd3_img, 'GL Summ')

    current_space_size = current_space_size + that.cell_width + space_size

    var jd2cell = getBorderedCell(current_space_size, 10, that.cell_width, 60, that.jd2_img, 'Cardex Summ')

    return [jd1cell, jd2cell]
}

export function getDefinedBusinessObjectList(that, business_obj_list) {
    var cell_list = []
    var start_point = space_size / 2
    var current_space_size = start_point
    var y_on_stencil = 10
    for (var i = 0; i < business_obj_list.length; i++) {
        var formated_bus_name = business_obj_list[i].object_name.replace(/(?!$|\n)([^\n]{8}(?!\n))/g, '$1\n');
        var cell = getRectangle(current_space_size, y_on_stencil, that.cell_width, 65, formated_bus_name)
        cell.prop('is_bus_obj', true)
        cell.prop('bus_id', business_obj_list[i].object_id)
        cell.prop('bus_name', business_obj_list[i].object_name)
        cell.prop('policy_id', business_obj_list[i].policy_name)
        cell.prop('bus_version', business_obj_list[i].object_version)
        current_space_size = current_space_size + that.cell_width + space_size
        if (i > 0 && (i + 1) % 3 === 0) {
            current_space_size = start_point
            y_on_stencil = y_on_stencil + 90
        }
        cell_list.push(cell)
    }
    return cell_list
}

export function getUserListCells(that, user_list) {
    Calculate_responsive_size(that)
    var cell_list = []
    var start_point = space_size / 2
    var current_space_size = start_point
    var y_on_stencil = 10
    for (var i = 0; i < user_list.length; i++) {
        var cell = getRectangle(current_space_size, y_on_stencil, that.cell_width, 65, user_list[i].full_name)
        current_space_size = current_space_size + that.cell_width + space_size
        if (i > 0 && (i + 1) % 3 === 0) {
            current_space_size = start_point
            y_on_stencil = y_on_stencil + 90
        }
        cell.prop('shape_type', 'users')
        cell.prop('full_name', user_list[i].full_name)
        cell.prop('user_id', user_list[i].user_id)
        cell.prop('username', user_list[i].username)
        cell.attr('root/title', user_list[i].username)
        cell_list.push(cell)
    }
    return cell_list
}
//
export function getCellsForWorkflow(that, Cell_Name) {
    Calculate_responsive_size(that)
    var cell_list = []
    var start_point = space_size / 2
    var current_space_size = start_point
    var y_on_stencil = 10
    var cell = getRectangle(current_space_size, y_on_stencil, that.cell_width, 65, Cell_Name)
    current_space_size = current_space_size + that.cell_width + space_size

    var condtion = getDiagnolShape(current_space_size, 10, that.cell_width, 65, '', 'Condition')
    current_space_size = current_space_size + that.cell_width + space_size

    var srart = getEllipseShape(current_space_size, 22, that.cell_width, that.cell_width, '', 'Start')
    current_space_size = start_point

    var end = getTerminatorShape(current_space_size, 110, that.cell_width, 65, '', 'End')


    cell.prop('shape_type', 'workflow_users')
    condtion.prop('shape_type', 'condition')
    srart.prop('shape_type', 'workflow_start')
    end.prop('shape_type', 'workflow_end')
    cell.prop('selected_user_list', [])
    cell.prop('approval_rule_id', '')
    cell.prop('rejection_rule_id', '')
    cell.prop('available_user_list', [])
    return [cell, condtion, srart, end]
}

export function getEnvListCells(that, env_list) {
    Calculate_responsive_size(that)
    var cell_list = []
    var start_point = space_size / 2
    var current_space_size = start_point
    var y_on_stencil = 10
    for (var i = 0; i < env_list.length; i++) {
        var formated_env_name = env_list[i].name.replace(/(?!$|\n)([^\n]{8}(?!\n))/g, '$1\n');
        var cell = getRectangle(current_space_size, y_on_stencil, that.cell_width, 65, formated_env_name)
        current_space_size = current_space_size + that.cell_width + space_size
        if (i > 0 && (i + 1) % 3 === 0) {
            current_space_size = start_point
            y_on_stencil = y_on_stencil + 90
        }
        // cell.attr('rect/stroke','#FF00FF')
        cell.prop('shape_type', 'envs')
        cell.prop('name', env_list[i].name)
        cell.prop('env_id', env_list[i].id)
        cell.prop('is_approval_req', env_list[i].approval_required)
        cell.prop('workflow_id', '')
        cell.prop('unpublish_route', '')
        cell.attr('root/title', 'Double click to add approval route for unpublish')
        cell_list.push(cell)
    }
    return cell_list
}

export function getApprovalCells(that, approval_list) {
    Calculate_responsive_size(that)
    var cell_list = []
    var start_point = space_size / 2
    var current_space_size = start_point
    var y_on_stencil = 10
    for (var i = 0; i < approval_list.length; i++) {
        var formated_approval_name = approval_list[i].workflow_name.replace(/(?!$|\n)([^\n]{8}(?!\n))/g, '$1\n');

        var cell = getRectangle(current_space_size, y_on_stencil, that.cell_width, 65, approval_list[i].workflow_name)
        current_space_size = current_space_size + that.cell_width + space_size
        if (i > 0 && (i + 1) % 3 === 0) {
            current_space_size = start_point
            y_on_stencil = y_on_stencil + 90
        }

        cell.prop('shape_type', 'workflow')
        cell.prop('workflow_name', approval_list[i].workflow_name)
        cell.prop('workflow_id', approval_list[i].id)
        cell.attr('rect/stroke', '#FF00FF')
        cell_list.push(cell)
    }
    return cell_list
}

// export function getDefinedBusinessObjectList(that){
// 		var start_point = space_size / 2
// 		var current_space_size = start_point

// 		var cell1 = getRectangle(current_space_size,10,that.cell_width,65,'Sales \nOrder')
// cell1.prop('is_bus_obj',true)
// cell1.prop('bus_name','Sales Order')
// 		current_space_size = current_space_size + that.cell_width +space_size

//   		var cell2 = getRectangle(current_space_size,10,that.cell_width,65,'Purchase \nOrder')
//   		cell2.prop('is_bus_obj',true)
//   		cell2.prop('bus_name','Purchase Order')

//   		current_space_size = current_space_size + that.cell_width +space_size

//   		var cell3 = getRectangle(current_space_size,10,that.cell_width,65,'Payroll')
//   		cell3.prop('is_bus_obj',true)
//   		cell3.prop('bus_name','Payroll')

//   		current_space_size = start_point

//   		var cell4 = getRectangle(current_space_size,100,that.cell_width,65,'Address \nBook')
//   		cell4.prop('is_bus_obj',true)
//   		cell4.prop('bus_name','Address Book')

//   		current_space_size = current_space_size + that.cell_width +space_size


//   		var cell5 = getRectangle(current_space_size,100,that.cell_width,65,'Work \nOrder')
//   		cell5.prop('is_bus_obj',true)
//   		cell5.prop('bus_name','Work Order')

//   		current_space_size = current_space_size + that.cell_width +space_size

//   		var cell6 = getRectangle(current_space_size,100,that.cell_width,65,'Item \nMaster')
//   		cell6.prop('is_bus_obj',true)
//   		cell6.prop('bus_name','Item Master')

//   		return [cell1,cell2,cell3,cell4,cell5,cell6]
// 	}


export function redesignElelement(cell, width, height, image) {
    var redesignShape = cell
    redesignShape.size = get_element_size(width, height)
    redesignShape.angle = "0"
    redesignShape.ports.groups = get_port_group()
    var port_items = redesignShape.ports.items
    for (var j = 0; j < port_items.length; j++) {
        port_items[j].attrs = get_port_attributes()
    }
    redesignShape.attrs.text = get_text_attribute(redesignShape.attrs.text.text)
    redesignShape.attrs.rect = get_rect_attribute()
    redesignShape.attrs.image = get_image_attributes(image, width, height)
    return redesignShape
}

export function reshapeGraphElement(graphdata,width,height){
    for (var i = graphdata.cells.length - 1; i >= 0; i--) {
        var element = graphdata.cells[i]
        if(element.type === "basic.Image"){
            element.size.height = height
            element.size.width = width
        }
    }
    return graphdata
}