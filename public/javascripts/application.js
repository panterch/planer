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
  e = new Element('style', {type:"text/css", media:"all"})
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
  $$('head').first().insert(e);
}

/* this is the reaction on a filter checkbox click */
function filter_view() {
  filter.set(this.name, this.checked);
  scheduler.update_view();
}

function generate_filter() {
  people.each(function(person, index) {
    var label = new Element('label', { class: person});
    var check = new Element('input', {type:"checkbox", checked:"true", name:person});
    check.observe("change", filter_view);
    label.update(check);
    label.insert(person);
    $('filter').insert(label);
  });
}

function init_scheduler() {
  scheduler.init('scheduler_here',new Date(2010,0,23),"week");
  scheduler.templates.event_class=function(start,end,event){
    return event.person;
  }
  scheduler.filter_week=function(id, event) {
    return filter.get(event.person);
  }
}

function load_data() {
  // demo data
  people.each(function(person) {
    scheduler.addEvent({ start_date:new Date(2010,0,23,2,0), end_date:new Date(2010,0,23,3,0), text:person, person:person });
    scheduler.addEvent({ start_date:new Date(2010,0,23,4,0), end_date:new Date(2010,0,23,5,0), text:person, person:person });
  });
}

document.observe("dom:loaded", function() {
  generate_css();
  generate_filter();
  init_scheduler();
  load_data();
});
