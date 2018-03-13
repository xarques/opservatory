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

  def show
  end
  
  def destroy
  end

  def update
    @challenge.update(challenge_params)
  end

  def create
    @challenge = Challenge.new(challenge_params)
    authorize @challenge

    if @challenge.save
      hints_list = params[:challenge][:hints_list]
      hints_array = hints_list.split("|")
      hints_instances_array = []
      hints_array.each do |hint|
        @hint = Hint.new(description: hint)
        authorize @hint
        @hint.challenge = @challenge
        @hint.save
      end
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
    params.require(:challenge).permit(:name, :description, :instructions, :level, :duration, :photo, :start_point, :solution, :schema, :photo_cache, :hint_lists)
  end
end
