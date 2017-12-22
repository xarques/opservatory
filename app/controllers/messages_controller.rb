class MessagesController < ApplicationController
  skip_before_action :authenticate_user!, only: [:confirmation, :new, :create]

  def confirmation
    authorize Message.new
  end

  def new
    @message = Message.new
    authorize @message
  end

  def create
    @message = Message.new(message_params)
    authorize @message

    if @message.valid?
      MessageMailer.new_message(@message).deliver
      redirect_to contact_confirmation_path(@message)
    else
      render :new
    end
  end

private

  def message_params
    params.require(:message).permit(:name, :email, :subject, :content)
  end

end
