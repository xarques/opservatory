Rails.application.routes.draw do
  devise_for :users
  resources :challenges
  authenticated :user do
    root to: "challenges#index", as: :authenticated_root
  end

  root to: "pages#home"
end
