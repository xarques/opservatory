# db/seeds.rb
require "open-uri"
require "yaml"

puts "Cleaning database..."
Challenge.destroy_all
User.destroy_all

puts 'Creating users...'
file = "db/users.yml"
users = YAML.load(open(file).read)

users["users"].each do |user|
  u = User.create!(user)
  puts "  Add User: #{u.email}"
end
puts "#{User.count} users have been successfully created"

puts 'Creating challenges...'
file = "db/challenges.yml"
challenges = YAML.load(open(file).read)

challenges["challenges"].each do |challenge|
  c = Challenge.create!(challenge)
  puts "  Add Challenge: #{c.name}"
end

puts "#{Challenge.count} challenges have been successfully created"
