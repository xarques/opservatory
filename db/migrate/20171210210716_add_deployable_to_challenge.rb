class AddDeployableToChallenge < ActiveRecord::Migration[5.1]
  def change
    add_column :challenges, :deployable, :boolean, default: false
  end
end
