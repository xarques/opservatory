class MessagePolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      scope
    end
  end

  def confirmation?
    true
  end

  def create?
    true
  end
end
