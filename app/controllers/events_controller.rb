class EventsController < ApplicationController

  def index
    conditions = nil
    if ! params["from"].blank?
      conditions = [ "start BETWEEN :from AND :to",
                     { :from => params["from"],
                       :to   => params["to"] } ]
    end
    @events = Event.all :conditions => conditions
    render :layout => false
  end

  def create
    change
  end

  def update
    change
  end


protected

  # wird vom dhtmlx scheduler/calendar frontend
  # via POST aufgerufen, bei Events verändert werden
  def change
    @mode = params["!nativeeditor_status"]
    @sid  = params[:id] # ''sent-id''
    case @mode
      when "inserted"; create_event
      when "deleted";  destroy_event
      when "updated";  update_event
    end
    respond_to do |wants|
      wants.xml { 
       render :layout => false
      }
    end
  end

  def update_attributes
    @event.update_attributes!(
      #
      # we get '2009-12-16 14:00' from dhtmlxScheduler
      # and let rails do whatever it wants with it,
      # however we must make sure that we send back in
      # the same format. See
      # app/views/events/index.xml.rxml for the egress part
      #
      :start        => params[:start_date],
      :end          => params[:end_date],
      :rec_type     => params[:rec_type],
      :event_length => params[:event_length],
      :event_pid    => params[:event_pid],
      :person       => params[:person],
      :task         => params[:task      ]
    )
  end

  def create_event
    @event = Event.new
    update_attributes
  end

  def update_event
    @event=Event.find @sid
    update_attributes
  end

  def destroy_event
    @event=Event.find @sid
    @event.destroy
  end

end
