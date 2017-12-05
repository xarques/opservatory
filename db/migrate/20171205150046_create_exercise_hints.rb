class CreateExerciseHints < ActiveRecord::Migration[5.1]
  def change
    create_table :exercise_hints do |t|
      t.references :hint, foreign_key: true
      t.references :exercise, foreign_key: true

      t.timestamps
    end
  end
end
