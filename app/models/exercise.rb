class Exercise < ApplicationRecord
  belongs_to :challenge
  belongs_to :user
  validates :status, presence: true,  inclusion: {in: [0, 1, 2, 3]} # 0: In progress, 1: Valid, 2: Invalid, 3: Deployed
end
