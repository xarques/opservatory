Rails.application.routes.draw do
  devise_for :users
  resources :challenges do
    resources :exercises, only: [:create]
  end

  root to: "challenges#index"  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
