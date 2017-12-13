require 'test_helper'

class HintsControllerTest < ActionDispatch::IntegrationTest
  test "should get create" do
    get hints_create_url
    assert_response :success
  end

end
