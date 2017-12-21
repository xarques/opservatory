ActionMailer::Base.smtp_settings = {
  address: "smtp.online.net",
  port: 587,
  domain: 'opservatory.com',
  user_name: ENV['OPSERVATORY_EMAIL_ADDRESS'],
  password: ENV['OPSERVATORY_EMAIL_PASSWORD'],
  authentication: :plain,
  enable_starttls_auto: true
}

ActionMailer::Base.default_url_options = {
  host: "opservatory.com"
}
