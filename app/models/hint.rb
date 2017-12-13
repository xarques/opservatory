class Hint < ApplicationRecord
  belongs_to :challenge
  has_many :exercise_hints, dependent: :destroy
  validates :description, presence: true
end
