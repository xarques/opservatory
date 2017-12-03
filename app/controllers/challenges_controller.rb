class ChallengesController < ApplicationController
  before_action :set_challenge, only: [:show, :edit, :update, :destroy]
  def new
  end

  def index
    @challenges = Challenge.all
  end

  def delete
  end

  def update
  end

  def create
  end

  private
  def set_challenge
    @challenge = Challenge.find(params[:id])
  end

  def challenge_params
    params.require(:challenge).permit(:name, :description)
  end
end
