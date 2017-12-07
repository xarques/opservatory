class ExerciseHintsController < ApplicationController

  def create
    @exercise = Exercise.find(params[:exercise_id])
    @next_hint = @exercise.next_hint
    @next_hint_first = @next_hint.first
    @exerciseHint = ExerciseHint.create!(exercise_id: @exercise.id, hint_id: @next_hint_first.id)
    authorize @exerciseHint
    if @exerciseHint.save
      respond_to do |format|
        format.html {redirect_to exercise_path(@exercise)}
        format.js
      end
    else
      respond_to do |format|
        format.html {redirect_to exercise_path(@exercise)}
        format.js
      end
    end
  end
end
