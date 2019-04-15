'use strict'
var highlighter_prop = {
    highlighter: {
        name: 'stroke',
        options: {
            padding: 10,
            rx: 5,
            ry: 5,
            attrs: {
                'stroke-width': 3,
                stroke: '#00FF00'
            }
        }
    }
}
import { ContextMenuItemClick } from "./contextmenuevents.js"
const joint = require('jointjs')
export function getStencilPaper(el, model) {
    return new joint.dia.Paper({
        el: $(el),
        height: 400,
        width: $('.card-body').width(),
        model: model,
        interactive: false,
    });
}

export function reset_paper(paper_name,height,items_length,extra_space=0){
    if(items_length <=0)
        return false
    //few machine work with .$el and few machine directly works with $ref
    if(paper_name.$el)
        paper_name = paper_name.$el
    var new_height = height * (items_length/3) + 20+extra_space
    if(new_height < 400)
        return false
    paper_name.style.height =new_height + "px"
}

export function dragdroponmainpaper(cellView, e, x, y, graph, paper, cell_width) {
    // let _this = that
    $('body').append('<div id="flyPaper" style="position:fixed;z-index:100;opacity:.9;pointer-event:none;"></div>');
    var flyGraph = new joint.dia.Graph,
    flyPaper = new joint.dia.Paper({
        el: $('#flyPaper'),
        model: flyGraph,
        interactive: false,
        width: cellView.model.attributes.size.width,
        height: cellView.model.attributes.size.height
    }),
    flyShape = cellView.model.clone(),
    pos = cellView.model.position(),
    offset = {
        x: x - pos.x,
        y: y - pos.y
    };
    var validcellslist = dragnewcell(cellView.model, graph, paper)
    flyShape.position(0, 0);
    flyGraph.addCell(flyShape);
    $("#flyPaper").offset({
        left: e.pageX - offset.x,
        top: e.pageY - offset.y
    });
    $('body').on('mousemove.fly', function(e) {
        $("#flyPaper").offset({
            left: e.pageX - offset.x,
            top: e.pageY - offset.y
        });
    });
    $('body').on('mouseup.fly', function(e) {
        var x = e.pageX,
        y = e.pageY,
        target = paper.$el.offset();

        // Dropped over paper ?
        if (x > target.left && x < target.left + paper.$el.width() && y > target.top && y < target.top + paper.$el.height()) {
            var cell_x = x - target.left - offset.x
            var cell_y = y - target.top - offset.y
            var s = flyShape.clone();
            var valid_drop_location = dropcelloncell(s, paper, validcellslist, cell_x, cell_y,graph)
            if (!cellView.model.prop('is_bus_obj')) {
                s.position(cell_x, cell_y);
                s.addTo(graph);
            }
        }
        $('body').off('mousemove.fly').off('mouseup.fly');
        flyShape.remove();
        $('#flyPaper').remove();
    });
}

export function unhighlight_all(graph,paper){
    _.each(graph.getElements(), function(element) {
        if (element.prop('steptype') && (element.prop('steptype') == "Archival" 
                || element.prop('steptype') == "Copy" || element.prop('steptype') == "Purge"))
        paper.findViewByModel(element).unhighlight(null, highlighter_prop)

    });
}

export function dragnewcell(cell, graph, paper) {
    var validcellslist = []
    //Get all elements from graph
    _.each(graph.getElements(), function(element) {
        paper.findViewByModel(element).unhighlight(null, highlighter_prop)
        if (cell.prop('is_bus_obj'))
        {
            if (element.prop('steptype') && (element.prop('steptype') == "Archival" 
                || element.prop('steptype') == "Copy" || element.prop('steptype') == "Purge")) {
                paper.findViewByModel(element).highlight(null, highlighter_prop)
                validcellslist.push(element)
            }
        }
        // else if(cell.prop('shape_type')==='workflow'){
        //     if (element.prop('shape_type') && element.prop('shape_type') === "envs" 
        //         &&(element.prop('is_approval_req'))) {
        //         paper.findViewByModel(element).highlight(null, highlighter_prop)
        //         validcellslist.push(element)
        //     }
        // }
    });
    return validcellslist
}

export function dropcelloncell(cell, paper, validcellslist, cell_x, cell_y,graph) {
    if (validcellslist.length === 0)
        return false
    var dropped_archival_step = ''
    for (var i = 0; i < validcellslist.length; i++) {
        var element = validcellslist[i]
        paper.findViewByModel(element).unhighlight(null, highlighter_prop)
            //10 size for cover highlighted part && 30 for cover highlight with step name section
        var lower_limit_x = element.attributes.position.x - 10 //left side highlighted part
        var lower_limit_y = element.attributes.position.y - 10 //top side highlitedd part
        var higher_limit_x = element.attributes.position.x + element.attributes.size.width + 10
        var higher_limit_y = element.attributes.position.x + element.attributes.size.height + 30
        if (cell_x >= lower_limit_x && cell_x <= higher_limit_x &&
            cell_y >= lower_limit_y && cell_y <= higher_limit_y) {
            // valid cell drop point
        if(cell.prop('is_bus_obj')){
            element.attr('text/text', cell.prop('bus_name'));
            element.attr('stepname', cell.prop('bus_name'));
            element.prop('bussinessObjectName', cell.prop('bus_name'));
            element.prop('policy_id',cell.prop('policy_id'))
            element.prop('bus_id',cell.prop('bus_id'))
            dropped_archival_step = element
            unhighlight_all(graph,paper)
            return true
        }
        // else if(cell.prop('shape_type')==='workflow'){
        //     debugger;
        //     element.prop('workflow_id',cell.prop('workflow_id'))
        //     element.attr('rect/stroke','#FF00FF')
        //     element.attr('root/title',cell.prop('workflow_name')) 
        //     return true
        // }
    }
}
return false
}

export function ManageScroll(main_container, x, y, adjust_x, adjust_y) {
    main_container.scrollLeft = (x - adjust_x)
    main_container.scrollTop = (y - adjust_y)
}

export function MoveLens(e, lens, paperSmallContainer, main_container, paperSmall_scale) {
    var pos, x, y;
    /*prevent any other actions that may occur when moving over the image*/
    e.preventDefault();
    /*get the cursor's x and y positions:*/
    pos = getCursorPos(e, paperSmallContainer);
    /*calculate the position of the lens:*/
    x = pos.x - (lens.offsetWidth / 2);
    y = pos.y - (lens.offsetHeight / 2);
    /*prevent the lens from being positioned outside the image:*/
    if (x > paperSmallContainer.clientWidth - lens.offsetWidth) { x = paperSmallContainer.clientWidth - lens.offsetWidth; }
    if (x < 0) { x = 0; }
    if (y > paperSmallContainer.clientHeight - lens.offsetHeight) { y = paperSmallContainer.clientHeight - lens.offsetHeight; }
    if (y < 0) { y = 0; }
    /*set the position of the lens:*/
    lens.style.left = x + "px";
    lens.style.top = y + "px";
    main_container.scrollLeft = (x / paperSmall_scale)
    main_container.scrollTop = (y / paperSmall_scale)
}

function getCursorPos(e, paperSmallContainer) {
    var a, x = 0,
    y = 0;
    e = e || window.event;
    /*get the x and y positions of the image:*/
    a = paperSmallContainer.getBoundingClientRect();
    /*calculate the cursor's x and y coordinates, relative to the image:*/
    x = e.pageX - a.left;
    y = e.pageY - a.top;
    /*consider any page scrolling:*/
    x = x - window.pageXOffset;
    y = y - window.pageYOffset;
    return { x: x, y: y };
}

export function isLeftMouseButtonDown(evt) {
    evt = evt || window.event;
    if ("buttons" in evt) {
        return evt.buttons == 1;
    }
    var button = evt.which || evt.button;
    return button == 1;
}

export function MoveLensOnScroll(e, lens, main_container, paperSmall_scale) {
    e.preventDefault()
    lens.style.left = (main_container.scrollLeft * paperSmall_scale) + "px";
    lens.style.top = (main_container.scrollTop * paperSmall_scale) + "px";
}

export function UnselectCell(that, selected) {
    if (selected)
        selected.unhighlight()
    that.is_selected = false
}


export function handleKeyevents(e, that) {
    let _this = that
        //you can not delete/copy/cut/paste unique identifier
        if (_this.unique_identifier_cell && _this.selected_el && (_this.unique_identifier_cell.id === _this.selected_el.model.id))
            return false
        if (_this.selected_el && _this.selected_el.model.prop('is_special_cell'))
            return false
        var key = e.which || e.keyCode;
        var ctrl = e.ctrlKey ? e.ctrlKey : ((key === 17) ? true : false);
        if (key === 46 && _this.is_selected) {
            ContextMenuItemClick(that, 'delete')
        } else if (key == 88 && ctrl && _this.is_selected) {
            ContextMenuItemClick(that, 'cut')
        } else if (key == 67 && ctrl && _this.is_selected) {
            ContextMenuItemClick(that, 'copy')
        } else if (key == 86 && ctrl && _this.is_cut_or_copied) {
            ContextMenuItemClick(that, 'paste')
        } else if (key == 77 && ctrl) {
            _this.AddNewCell()
        }
    }