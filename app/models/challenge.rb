class Challenge < ApplicationRecord
  mount_uploader :photo, PhotoUploader
  has_many :exercises, dependent: :destroy
  has_many :users, through: :exercises
  has_many :hints, dependent: :destroy
  validates :name, presence: true, uniqueness: true
  validates :status, inclusion: {in: [0, 1]} # 0 = Draft, 1 = Release

  attr_accessor :hints_list

  include PgSearch
  pg_search_scope :search_by_name_and_description,
    against: [ :name, :description ],
    using: {
      tsearch: { prefix: true } # <-- now `superman batm` will return something!
    }
end
