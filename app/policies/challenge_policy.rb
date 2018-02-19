class ChallengePolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      scope.all
    end
  end

  def create?
    if user
      user.roles.where(name:"teacher").any?
    else
      true
    end
  end

  def update?
    create?
  end

  def destroy?
    create?
  end
end
