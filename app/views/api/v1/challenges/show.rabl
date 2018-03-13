object @challenge
attributes :id, :name, :description, :instructions, :schema, :solution, :level, :duration, :status, :start_point, :deployable
node(:photo) { |challenge| { url: challenge.photo.url, public_id: challenge.photo.my_public_id }}
child :hints, :object_root => false do
  attributes :description, :position
end