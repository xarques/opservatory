class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable
  has_many :user_roles, dependent: :destroy
  has_many :roles, through: :user_roles
  has_many :exercises, dependent: :destroy
  has_many :challenges, through: :exercises
  mount_uploader :photo, PhotoUploader

  # The API should make a call on behalf of a given user.
  # In the browser, there is a session stored in a cookie.
  # For an API, we'll use a token.
  acts_as_token_authenticatable
end
