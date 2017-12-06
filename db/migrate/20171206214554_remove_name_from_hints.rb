class RemoveNameFromHints < ActiveRecord::Migration[5.1]
  def change
    remove_column :hints, :name, :string
  end
end
