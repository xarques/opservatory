class AddPhotoToChallenges < ActiveRecord::Migration[5.1]
  def change
    add_column :challenges, :photo, :string
  end
end
