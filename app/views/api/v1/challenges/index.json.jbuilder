json.array! @challenges do |challenge|
  json.extract! challenge, :id, :name, :description, :instructions, :schema, :solution, :level, :duration, :status, :start_point, :deployable
end