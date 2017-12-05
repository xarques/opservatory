class CreateExercises < ActiveRecord::Migration[5.1]
  def change
    create_table :exercises do |t|
      t.text :code
      t.integer :status
      t.references :challenge, foreign_key: true
      t.references :user, foreign_key: true

      t.timestamps
    end
  end
end
