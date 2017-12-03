class CreateChallenges < ActiveRecord::Migration[5.1]
  def change
    create_table :challenges do |t|
      t.string :name
      t.text :description
      t.text :instructions
      t.text :schema
      t.text :solution
      t.integer :level
      t.integer :duration

      t.timestamps
    end
  end
end
