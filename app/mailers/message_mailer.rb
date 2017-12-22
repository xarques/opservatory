class MessageMailer < ApplicationMailer
  default to: 'contact@opservatory.com'
  def new_message(message)
    @message = message
    mail subject: message.subject, from: message.email
  end
end
