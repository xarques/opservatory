class ExercisesController < ApplicationController
  before_action :set_exercise, only: [:show, :edit, :update, :destroy]
  def new
    @exercise = Exercise.new
    authorize @exercise
  end

  def index
    @exercises = policy_scope(Exercise).where(user: current_user)
    @challenges = policy_scope(Challenge).where(
      "id NOT IN
        (SELECT challenge_id FROM exercises
         WHERE user_id = #{current_user.id})")
    exercises_not_deployed = policy_scope(Exercise).where("user_id = #{current_user.id} AND status IN (0, 1, 2)")
    if exercises_not_deployed.any?
      @next_exercise = exercises_not_deployed.first.challenge
    elsif @challenges.any?
      @next_challenge = @challenges.first
    end
  end

  def create
    @exercise = Exercise.new
    @exercise.user = current_user
    @exercise.challenge = Challenge.find(params[:challenge_id])
    @exercise.code = @exercise.challenge.start_point
    # @exercise.status = 0;
    authorize @exercise
    if @exercise.save
      redirect_to exercise_path(@exercise)
    else
      redirect_to exercises_path
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
    params.require(:exercise).permit(:code, :status, :challenge_id, :user_id)
  end
end
