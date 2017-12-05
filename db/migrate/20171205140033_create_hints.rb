class CreateHints < ActiveRecord::Migration[5.1]
  def change
    create_table :hints do |t|
      t.string :name
      t.text :description
      t.integer :position
      t.references :challenge, foreign_key: true

      t.timestamps
    end
  end
end
