class ExercisesController < ApplicationController
  before_action :set_exercise, only: [:show, :edit, :update, :destroy]
  def new
    @exercise = Exercise.new
    authorize @exercise
  end

  def index
    @exercises = policy_scope(Exercise).where(user: current_user)
  end

  def create
    @exercise = Exercise.new({authenticity_token: session[:_csrf_token]})
    @exercise.user = current_user
    @exercise.challenge = Challenge.find(param[:challenge_id])
    @exercise.code = @exercise.challenge.start_point
    # authorize @exercise
    if @exercise.save
      redirect_to exercise_path(@exercise)
    else
      render :index
    end
  end

  def update
    @exercise.update(exercise_params)
    redirect_to exercise_path(@exercise)
  end

  def destroy
    @exercise.destroy
    redirect_to exercises_path
  end

  private
  def set_exercise
    @exercise = Exercise.find(params[:id])
    authorize @exercise
  end

  def exercise_params
    params.require(:exercise).permit(:code, :status)
  end
end
