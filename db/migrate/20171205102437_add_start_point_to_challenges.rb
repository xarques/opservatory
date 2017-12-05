class AddStartPointToChallenges < ActiveRecord::Migration[5.1]
  def change
    add_column :challenges, :start_point, :string
  end
end
