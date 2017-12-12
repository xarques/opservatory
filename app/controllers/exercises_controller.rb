class ExercisesController < ApplicationController
  before_action :set_exercise, only: [:show, :edit, :update, :destroy, :retry, :reveal_solution]

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
    if params[:query].present?
      @challenges = @challenges.search_by_name_and_description(params[:query])
      respond_to do |format|
        format.html
        format.js
      end
    else
      @challenges
    end

    exercises_not_deployed = policy_scope(Exercise).where("user_id = #{current_user.id} AND status IN (0, 1, 2)")
    if exercises_not_deployed.any?
      @next_exercise = exercises_not_deployed.first
    elsif @challenges.any?
      @next_challenge = @challenges.first
    end
  end

  def show
    @given_hints = @exercise.given_hints
    @next_hint = @exercise.next_hint
  end

  def create
    exercises = policy_scope(Exercise).where("user_id = ? AND challenge_id = ?",
      current_user.id, Challenge.find(params[:challenge_id]).id)
    if exercises.any?
      @exercise = exercises.first
      authorize @exercise
      redirect_to exercise_path(@exercise)
    else
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
  end

  def update
    @exercise.update(exercise_params)
    respond_to do |format|
      format.html {redirect_to exercise_path(@exercise)}
      format.js
    end
  end

  def retry
    @exercise.given_hints.destroy_all
    @exercise.code = @exercise.challenge.start_point
    @exercise.status = 0
    @next_hint = @exercise.next_hint
    @exercise.save
    respond_to do |format|
      format.html {redirect_to exercise_path(@exercise)}
      format.js
    end
  end

  def reveal_solution
    @exercise.code = @exercise.challenge.solution
    @exercise.save
    respond_to do |format|
      format.html {redirect_to exercise_path(@exercise)}
      format.js
    end
  end

  def destroy
    @exercise.destroy
    redirect_to exercises_path(@exercise)
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
