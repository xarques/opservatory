class Challenge < ApplicationRecord
  mount_uploader :photo, PhotoUploader
  has_many :exercises, dependent: :destroy
  has_many :users, through: :exercises
  has_many :hints, dependent: :destroy
  validates :name, presence: true, uniqueness: true
  validates :status, inclusion: {in: [0, 1]} # 0 = Draft, 1 = Release
  validates :photo, presence: true

  attr_accessor :hints_list

  def instructions
    if !self[:instructions]
<<EOF
  <div class="result-invalid">
    <p>This challenge is under construction. Please test one of the following instead</p>
    <ol>
      <li>Create an EC2 instance</li>
      <li>Create a RDS Database</li>
      <li>Create a private S3 bucket</li>
      <li>Create a public S3 bucket</li>
    </ol>
  </div>
EOF
    else
      super
    end
  end
  include PgSearch
  pg_search_scope :search_by_name_and_description,
    against: [ :name, :description ],
    using: {
      tsearch: { prefix: true } # <-- now `superman batm` will return something!
    }
end
