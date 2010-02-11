# Be sure to restart your server when you modify this file.

# Your secret key for verifying cookie session data integrity.
# If you change this key, all old sessions will become invalid!
# Make sure the secret is at least 30 characters and all random, 
# no regular words or you'll be exposed to dictionary attacks.
ActionController::Base.session = {
  :key    => '_planer_session',
  :secret => '19b04ddf404ec33667a1808b52593cd3d1f2475e497bd201fd2bb775e19c9199af8ed5a8f9762a2fad6bcb32a7bd253aa9934ddcb27e1dbd6e6785e4213b0a9a'
}

# Use the database for sessions instead of the cookie-based default,
# which shouldn't be used to store highly confidential information
# (create the session table with "rake db:sessions:create")
# ActionController::Base.session_store = :active_record_store
