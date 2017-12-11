Rails.application.routes.draw do
  devise_for :users

  resources :challenges do
    resources :exercises, only: [:create]
    resources :hints, only: [:create]
  end

  resources :exercises, only: [:show, :index, :update] do
    resources :exercise_hints, only: [:create]
    member do
      patch 'retry', to: "exercises#retry"
      patch 'reveal_solution', to:"exercises#reveal_solution"
    end
  end

  authenticated :user do
    root to: "exercises#index", as: :authenticated_root
  end

  root to: "pages#home"
end
