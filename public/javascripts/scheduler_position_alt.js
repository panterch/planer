scheduler._pre_render_stack=function(stack,ev){
	for (var i=0; i<stack.length; i++)
		if (stack[i].end_date<=ev.start_date){
			ev._sorder=i;	
			ev._inner=true;	
			stack[i]=ev;
			return;
		}
					
	if (stack.length) stack[stack.length-1]._inner=true;
	ev._sorder=stack.length; stack.push(ev);
	if (stack.length>(stack.max_count||0)) stack.max_count=stack.length;
}
scheduler._pre_render_events_line=function(evs,hold){
	evs.sort(function(a,b){ return a.start_date>b.start_date?1:-1; })
	var days=[]; //events by weeks
	var evs_originals = [];
	for (var i=0; i < evs.length; i++) {
		var ev=evs[i];

		//check scale overflow
		var sh = ev.start_date.getHours();
		var eh = ev.end_date.getHours();
		
		ev._sday=this._get_event_sday(ev);
		if (!days[ev._sday]) days[ev._sday]=[];
		
		if (!hold)
			scheduler._pre_render_stack(days[ev._sday],ev);
		
		if (sh < this.config.first_hour || eh >= this.config.last_hour){
			evs_originals.push(ev);
			evs[i]=ev=this._copy_event(ev);
			if (sh < this.config.first_hour){
				ev.start_date.setHours(this.config.first_hour);
				ev.start_date.setMinutes(0);
			}
			if (eh >= this.config.last_hour){
				ev.end_date.setMinutes(0);
				ev.end_date.setHours(this.config.last_hour);
			}
			if (ev.start_date>ev.end_date) {
				evs.splice(i,1); i--; continue;
			}
		}
				
	}
	if (!hold){
		for (var i=0; i < evs.length; i++) 
			evs[i]._count=days[evs[i]._sday].max_count;
		for (var i=0; i < evs_originals.length; i++) 
			evs_originals[i]._count=days[evs_originals[i]._sday].max_count;
	}
	
	return evs;
}