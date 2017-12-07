Rails.application.routes.draw do
  devise_for :users

  resources :challenges do
    resources :exercises, only: [:create]
    resources :hints, only: [:create]
  end

  resources :exercises, only: [:show, :index, :update]
  authenticated :user do
    root to: "exercises#index", as: :authenticated_root
  end

  root to: "pages#home"
end
