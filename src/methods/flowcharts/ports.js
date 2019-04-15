'use strict'
export function validateConnection(cellViewS, magnetS, cellViewT, magnetT, end, linkView,special_cell) {
		// Prevent linking from output ports to input ports within one element.
		if (cellViewS === cellViewT) return false;

		//special case for unique identifier where this element can draw line from any port and should not have incomming lines
		// if(special_cell){	
		// 	if(special_cell.id = cellViewS.model.id)
		// 		return false
		// }

		//prevent linking to unique identifier
		if(special_cell && cellViewT.model.id === special_cell.id)
			return false

		//allowing linking from in port and top port
		if(special_cell && cellViewS.model.id === special_cell.id)
			return true

		// code added on 21 th feb. Issue No. 223. Nirav ask to open all port
		return true

		// Prevent linking from input ports.
		if (magnetS && (magnetS.getAttribute('port-group') === 'in' || magnetS.getAttribute('port-group') === 'top')) return false;
		
		// Prevent linking to input ports.
		return magnetT && (magnetT.getAttribute('port-group') === 'in' || (magnetT.getAttribute('port-group') === 'top'));
	


	}

export function validateMagnet(cellView, magnet) {
			// Note that this is the default behaviour. Just showing it here for reference.
			// Disable linking interaction for magnets marked as passive (see below `.inPorts circle`).
			return magnet.getAttribute('magnet') !== 'passive';
	}

var port_args = {}

function get_port_position(position_name){
	return {position:{ name:position_name}}
}


export function get_port_group(){
	return {
		"in":get_port_position('left'),
		"out":get_port_position('right'),
		"top":get_port_position('top'),
		"bottom":get_port_position('bottom')
	}
}

export function get_port_attributes(port_radis=0){
	return {'circle':{r:port_radis,stroke:"#000000", magnet:"true"}}
}

function get_port_item(port_name,port_radis){
	return {group:port_name,attrs:get_port_attributes(port_radis)
	}
}
export function get_port_items(port_radis=5){
	return [get_port_item('in',port_radis),get_port_item('out',port_radis),
			get_port_item('top',port_radis),get_port_item('bottom',port_radis)]
}

export function reset_port_markup(model,port_radis=5){
	if(model && model.getPorts){
		for(var i =0 ;i<model.getPorts().length;i++)
		model.portProp(model.getPorts()[i],'attrs/circle',{r:port_radis})	
		}
	}