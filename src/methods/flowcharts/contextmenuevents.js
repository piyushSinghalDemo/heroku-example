export function ItemMouseOver(that,item,conditioncheck){
	if(conditioncheck && ((conditioncheck === 'selection' && !that.is_selected) 
					  ||(conditioncheck === 'copied' && !that.is_cut_or_copied)))
		return false
	item.target.style.backgroundColor = "grey";
}

export function ItemMouseOut(that,item){
		item.target.style.backgroundColor = "white";
}

export function ContextMenuItemClick(that,action_type){
		if(action_type==='new'){
			that.AddNewCell()
		}
		else if(action_type==='cut'){
			if(that.step_name_list){
				var step_name = that.selected_el.model.prop('step_name')
				that.step_name_list.splice(that.step_name_list.indexOf(step_name),1)
			}
			that.cut_copy_ele = that.selected_el.model.clone()
			that.is_cut_or_copied = true
			that.selected_el.model.remove()

			// let data = that.graph.toJSON(); 
			// console.log("data"+JSON.stringify(data));
		}
		else if(action_type === 'copy'){
			that.cut_copy_ele = that.selected_el.model.clone()
			that.is_cut_or_copied = true
			if(that.cut_copy_ele.attributes.attrs['.name'].text){
				var copied_text = 'Copy of ' +that.cut_copy_ele.attributes.attrs['.name'].text
				that.cut_copy_ele.attributes.attrs['.name'].text = copied_text
			}
		}
		else if(action_type === 'paste'){
			var main_div = that.$refs.main_container

			var copy_el = that.cut_copy_ele
			copy_el.position(main_div.scrollLeft + 50, main_div.scrollTop+50)
			that.graph.addCell(copy_el.clone())	
		}
		else if(action_type === 'delete'){
			if(that.step_name_list){
				var step_name = that.selected_el.model.prop('step_name')
				that.step_name_list.splice(that.step_name_list.indexOf(step_name),1)
			}
			that.selected_el.model.remove({disconnectLinks : false})
			that.is_selected = false
		}
		else if(action_type === 'rename'){
			that.step_name = that.selected_el.model.attr('text/text')
			that.step_description = that.selected_el.model.attr('desciption')
			that.dialog = true
		}
	}