class ChallengesController < ApplicationController
  before_action :set_challenge, only: [:show, :edit, :update, :destroy]
  def new
    @challenge = Challenge.new
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
  end

  private
  def set_challenge
    @challenge = Challenge.find(params[:id])
    authorize @challenge
  end

  def challenge_params
    params.require(:challenge).permit(:name, :description)
  end
end
