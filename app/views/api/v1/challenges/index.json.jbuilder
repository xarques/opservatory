json.array! @challenges do |challenge|
  json.extract! challenge, :id, :name, :description, :instructions, :schema, 
    :solution, :level, :duration, :status, :start_point, :deployable
  json.photo json.extract! challenge.photo, :url, :public_id
end