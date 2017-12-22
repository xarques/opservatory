class Message
  include ActiveModel::Model
  include ActiveModel::Conversion
  include ActiveModel::Validations

  attr_accessor :name, :email, :subject, :content

  validates :name, presence: true
  validates :email, presence: true
  validates :subject, presence: true
  validates :content, presence: true
end
