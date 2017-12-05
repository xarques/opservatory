# db/seeds.rb
require "open-uri"
require "yaml"

puts "Cleaning database..."
Challenge.destroy_all
User.destroy_all
Role.destroy_all
UserRole.destroy_all

puts "Creating roles..."
file = "db/roles.yml"
roles = YAML.load(open(file).read)

roles["roles"].each do |role|
  r = Role.create!(role)
end
puts "Roles have been created"

puts 'Creating users...'
file = "db/users.yml"
users = YAML.load(open(file).read)

users["users"].each do |user|
  u = User.create!(user)
  u.roles << Role.find_by(name: "teacher")
  u.roles << Role.find_by(name: "student")
  puts "  Add User: #{u.email}"
end
puts "#{User.count} users have been successfully created"


puts 'Creating challenges...'

Dir.foreach("db/challenges") do |file|
  file_path = "db/challenges/#{file}"
  if file_path.end_with?(".yml") && File.file?(file_path)
    challenge = YAML.load(open(file_path).read)
    c = Challenge.create!(challenge)
    puts "  Add Challenge #{file}: #{c.name}"
  end
end

puts "#{Challenge.count} challenges have been successfully created"
