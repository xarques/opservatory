collection @challenges
attributes :id, :name, :description, :instructions, :schema, :solution, :level, :duration, :status, :start_point, :deployable
# child(:photo) { attributes :photo.public_id }
node(:photo) { |challenge| { url: challenge.photo.url, public_id: challenge.photo.my_public_id }}
child :hints, :object_root => false do
  attributes :description, :position
end