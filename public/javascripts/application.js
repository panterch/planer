var scheduler = null;
var people = ['seb', 'maa', 'pho', 'geo', 'tam', 'sym']

var events = []; // the events currently in the scope of the user
var who  = [];   // persons working on events
var what = [];   // tasks on events
var filter = new Hash(); // which persons & tasks to display
var stats  = new Hash(); // how many working houres planed

people.each(function(person) { filter.set(person, true); });

/* random color from http://colors.simplificator.com/ */
function random_color(){
  var col = new Array(3);
  col[0] = parseInt(Math.random() * 255);
  col[1] = parseInt(Math.random() * 255);
  col[2] = parseInt(Math.random() * 255);
  return col;
}

/* some css values that depend on configuration (people)
 * are generated here and rendered directly onto the page */
function generate_css() {
  var e = $('style_planer').update('');
  people.each(function(person, index) {
    var col = random_color();
    // assure different colors for different people
    col[2] = Math.floor(index * 255.0 / people.length);
    e.insert(".dhx_cal_event."+person+" div, ."+person);
    e.insert(" { background-color: rgb("+col+");");
    // assure readability of foreground
    col[1] = col[1] > 120 ? 0 : 250;
    e.insert(" color: rgb("+col+");");
    e.insert(" }\n");
  });
}

/* this is the reaction on a filter checkbox click */
function filter_view() {
  filter.set(this.name, this.checked);
  scheduler.update_view();
  // recalculate_stats();
}

function update_event_text(event_id, event) {
  event.text = event.person + "\n" + event.task;
}

function init_scheduler() {
  scheduler.templates.event_class=function(start,end,event){
    return event.person;
  }
  scheduler.config.lightbox.sections = [
  			{name:"person", height:23, map_to:"person",  type:"textarea", focus: true },
  			{name:"task", height:23, map_to:"task", type:"textarea" },
				];
  scheduler.config.details_on_create=true;
  scheduler.config.details_on_dblclick=true;
  scheduler.locale.labels.section_person="Who?"
  scheduler.locale.labels.section_task="What?"


  scheduler.attachEvent("onEventAdded", update_event_text);
  scheduler.attachEvent("onEventChanged", update_event_text);

  scheduler.config.first_hour =  8;
  scheduler.config.last_hour  = 22;
  scheduler.config.time_step  = 30;
  scheduler.config.xml_date="%Y-%m-%d %H:%i";

  scheduler.config.start_on_monday = true;

  scheduler.config.icons_select=["icon_details","icon_delete"]

  scheduler.filter_week=function(id, event) {
    
    return filter.get(event.person);
  }
  scheduler.filter_day=scheduler.filter_week;

  scheduler.locale.labels.workweek_tab = "Work";

  scheduler.attachEvent("onTemplatesReady",function(){
    //work week
    scheduler.date.workweek_start = scheduler.date.week_start;
    scheduler.templates.workweek_date = scheduler.templates.week_date;
    scheduler.templates.workweek_scale_date = scheduler.templates.week_scale_date;
    scheduler.date.add_workweek=function(date,inc){ return scheduler.date.add(date,inc*7,"day"); }
    scheduler.date.get_workweek_end=function(date){ return scheduler.date.add(date,5,"day"); }
    scheduler.filter_workweek=scheduler.filter_week;
  });

  scheduler.init('scheduler_here', null, "workweek");
}


function load_data() {
  scheduler.load("/events.xml");
  var dp = new dataProcessor("/events.xml");
  dp.init(scheduler);
  dp.setTransactionMode("POST",false);


}


function init_slider() {
  var sld = new dhtmlxSlider('slider', 330);
  sld.setImagePath("/images/")
  sld.init();
  var disco = new PeriodicalExecuter(generate_css, 1);
  disco.stop();

  sld.attachEvent("onSlideEnd",function(val){
    disco.stop();
    if (val > 0) {
      disco = new PeriodicalExecuter(generate_css, 50/val);
    }
  })  
}

function init_update_run() {
  scheduler.attachEvent("onBeforeEventDelete", function() {
      setTimeout('update_run()', 1000);
      return true;
      });
  scheduler.attachEvent("onXLE",          update_run);
  scheduler.attachEvent("onEventAdded",   update_run);
  scheduler.attachEvent("onEventChanged", update_run);
  scheduler.attachEvent("onViewChange",   update_run);
}


function update_run() {
  update_events_who_and_what();
  update_stats();
  update_filter();
}

function update_events_who_and_what() {
  events = scheduler.getEvents(scheduler._min_date, scheduler._max_date);
  who  = [];
  what = [];
  events.each(function(e) {
    who.push(e.person);
    what.push(e.task);
    });
  who = who.uniq();
  what = what.uniq();
}


function update_stats() {
  stats = new Hash();
  events.each(function(e) {
    var hours = (e.end_date.getTime() - e.start_date.getTime()) / 3600000.0
    stats.set(e.person, hours + (stats.get(e.person) || 0));
    stats.set(e.task, hours + (stats.get(e.task) || 0));
  });
}


function update_filter() {
  var new_filter = new Hash();

  $('filter_who').innerHTML = '';
  who.each(function(person, index) {
    var checked = filter.get(person);
    if (null == checked) { checked = true; }
    var label = new Element('label', { class: person});
    var check = new Element('input', {type:"checkbox", "checked":checked, name:person});
    check.observe("change", filter_view);
    label.update(person+' ('+stats.get(person)+'h): ');
    label.insert(check);
    $('filter_who').insert(label);
    new_filter.set(person, checked);
  });

  $('filter_what').innerHTML = '';
  what.each(function(task, index) {
    var checked = filter.get(task);
    if (null == checked) { checked = true; }
    var label = new Element('label', { class: task});
    var check = new Element('input', {type:"checkbox", "checked":checked, name:task});
    check.observe("change", filter_view);
    label.update(task+' ('+stats.get(task)+'h): ');
    label.insert(check);
    $('filter_what').insert(label);
    new_filter.set(task, checked);
  });
  filter = new_filter;
}


document.observe("dom:loaded", function() {
//  generate_css();
//  generate_filter();
  init_scheduler();
  init_update_run();
  load_data();
  init_slider();
});
