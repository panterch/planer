class CreateEvents < ActiveRecord::Migration
  # siehe dhtml/doc/dhtmlxscheduler___recurring_events.html
  def self.up
    create_table :events do |t|
      t.string   :person
      t.string   :task
      t.datetime :start
      t.datetime :end
      t.string   :rec_type, :limit => 64 # varchar[64]
      t.integer  :event_length, :limit => 8 # long int
      t.integer  :event_pid    # int
    end
  end

  def self.down
    drop_table :events
  end
end
