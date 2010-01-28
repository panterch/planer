ActionController::Routing::Routes.draw do |map|
    map.connect 'events.:format', :controller => :events, :action => :index,
              :conditions => { :method => :get }
    map.connect 'events.xml', :controller => :events, :action => :change,
              :conditions => { :method => :post }
end
