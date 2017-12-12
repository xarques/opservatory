class ChallengesController < ApplicationController
  before_action :set_challenge, only: [:show, :edit, :update, :destroy]

  def new
    @challenge = Challenge.new
    @hint = Hint.new
    authorize @challenge
  end

  def index
    @challenges = policy_scope(Challenge)
  end

  def delete
  end

  def update
  end

  def create
    raise
    @challenge = Challenge.new(challenge_params)
    authorize @challenge

    @hint = Hint.new(description: params[:challenge][:hint_description])
    @hint.challenge = @hint

    if @challenge.save
       @hint.save
      redirect_to challenge_path(@challenge)
    else
      render :new
    end
  end

  private
  def set_challenge
    @challenge = Challenge.find(params[:id])
    authorize @challenge
  end

  def challenge_params
    params.require(:challenge).permit(:name, :description, :instructions, :level, :duration, :photo, :hint_description)
  end
end
