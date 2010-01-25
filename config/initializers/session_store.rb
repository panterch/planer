# Be sure to restart your server when you modify this file.

# Your secret key for verifying cookie session data integrity.
# If you change this key, all old sessions will become invalid!
# Make sure the secret is at least 30 characters and all random, 
# no regular words or you'll be exposed to dictionary attacks.
ActionController::Base.session = {
  :key         => '_planer_session',
  :secret      => '6b37bc786ebb6e0fcf6ed0245c1e5470fd415df94675fab9aedd1f08db097d7b7f13e6746aa4552be5a12b527051723b9204ea88cf28919e4d25e68d4a28dd6a'
}

# Use the database for sessions instead of the cookie-based default,
# which shouldn't be used to store highly confidential information
# (create the session table with "rake db:sessions:create")
# ActionController::Base.session_store = :active_record_store
