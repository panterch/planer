var scheduler = null;
var people = ['seb', 'maa', 'pho', 'geo', 'tam', 'sym']
var filter = new Hash();
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
  recalculate_stats();
}

function generate_filter() {
  people.each(function(person, index) {
    var label = new Element('label', { class: person});
    var check = new Element('input', {type:"checkbox", checked:"true", name:person});
    check.observe("change", filter_view);
    label.update(person+': ');
    label.insert(check);
    $('filter').insert(label);
  });
}

function update_event_text(event_id, event) {
  event.text = event.person + "\n" + event.task;
}

function recalculate_stats() {
  var workload = new Hash();
  var projects = new Hash();
  var total = 0;
  scheduler.get_visible_events().each(function(e) {
    var hours = (e.end_date.getTime() - e.start_date.getTime()) / 3600000.0
    workload.set(e.person, hours + (workload.get(e.person) || 0));
    projects.set(e.task, hours + (projects.get(e.task) || 0));
    total = total + hours;
  });

  var dl = new Element('dl');
  people.each(function(p) {
    dl.insert(new Element('dt', { class: p }).update(p+':'));
    dl.insert(new Element('dd', { class: p }).update((workload.get(p) || 0)+'h'));
    });
  dl.insert(new Element('dt').update('Total: '));
  dl.insert(new Element('dd').update(total+'h'));
  $('workload').update(dl);

  var dl = new Element('dl');
  projects.each(function(pair) {
    dl.insert(new Element('dt').update(pair.key+':'));
    dl.insert(new Element('dd').update(pair.value+'h '));
    });
  $('projects').update(dl);

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

function init_stats() {
  scheduler.attachEvent("onBeforeEventDelete", function() {
      setTimeout('recalculate_stats()', 1000);
      return true;
      });
  scheduler.attachEvent("onEventAdded", recalculate_stats);
  scheduler.attachEvent("onEventChanged", recalculate_stats);
  scheduler.attachEvent("onViewChange", recalculate_stats);
  recalculate_stats();
}

function init_slider() {
  var sld = new dhtmlxSlider('slider', 330);
  sld.setImagePath("/imgs/")
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

document.observe("dom:loaded", function() {
  generate_css();
  generate_filter();
  init_scheduler();
  load_data();
  init_stats();
  init_slider();
});
