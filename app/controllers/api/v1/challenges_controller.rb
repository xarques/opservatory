class Api::V1::ChallengesController < Api::V1::BaseController
  acts_as_token_authentication_handler_for User, except: [ :index, :show ]
  before_action :set_challenge, only: [ :show, :update, :destroy  ]
  def index
    @challenges = policy_scope(Challenge)
  end

  def show
  end

  def create
    @challenge = Challenge.new(challenge_params)
    authorize @challenge

    if @challenge.save
      render :show
    else
      render_error
    end
  end

  def update
    if @challenge.update(challenge_params)
      # No need to create a `update.json.jbuilder` view
      # Reuse the show.json.jbuilder
      render :show
    else
      render_error
    end
  end

  def destroy
    @challenge.destroy
    head :no_content
    # No need to create a `destroy.json.jbuilder` view
  end

  private

  def set_challenge
    @challenge = Challenge.find(params[:id])
    authorize @challenge
  end

  def challenge_params
    params.require(:challenge).permit(:name, :description, :instructions, :level, :duration, :photo, :start_point, :solution, :schema, :photo_cache, :hint_lists)
  end

  def render_error
    render json: { errors: @challenge.errors.full_messages },
      status: :unprocessable_entity
  end
end