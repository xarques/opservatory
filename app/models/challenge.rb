class Challenge < ApplicationRecord
  has_many :exercises, dependent: :destroy
  has_many :users, through: :exercises
  validates :name, presence: true, uniqueness: true
  validates :status, inclusion: {in: [0, 1]} # 0 = Draft, 1 = Release
  def to_s
    name
  end
end
