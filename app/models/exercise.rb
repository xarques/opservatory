class Exercise < ApplicationRecord
  belongs_to :challenge
  has_many :hints, through: :challenge
  has_many :exercise_hints, dependent: :destroy
  has_many :given_hints, through: :exercise_hints, source: :hint
  belongs_to :user
  validates :status, presence: true,  inclusion: {in: [0, 1, 2, 3]} # 0: In progress, 1: Valid, 2: Invalid, 3: Deployed
  validates :challenge, uniqueness: { scope: :user }
end
