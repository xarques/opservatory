# db/seeds.rb
require "open-uri"
require "yaml"

puts "Cleaning database..."
Challenge.destroy_all
User.destroy_all
Role.destroy_all
Exercise.destroy_all

# 1 Roles
puts "Creating roles..."
file = "db/roles.yml"
roles = YAML.load(open(file).read)

roles["roles"].each do |role|
  r = Role.create!(role)
  puts "  Add Role: #{r.name}"
end
puts "#{Role.count} roles have been created"

# 2 Users
puts 'Creating users...'
file = "db/users.yml"
users = YAML.load(open(file).read)

users["users"].each do |user|
  u = User.create!(user)
  u.roles << Role.find_by(name: "teacher")
  u.roles << Role.find_by(name: "student")
  puts "  Add User: #{u.email}"
end
puts "#{User.count} users have been created"

# 3 Challenges
puts 'Creating challenges...'

Dir.foreach("db/challenges") do |file|
  file_path = "db/challenges/#{file}"
  if file_path.end_with?(".yml") && File.file?(file_path)
    challenge = YAML.load(open(file_path).read)
    c = Challenge.create!(challenge)
    puts "  Add Challenge #{file}: #{c.name}"
  end
end

puts "#{Challenge.count} challenges have been created"

puts "creating exercise..."

  users = User.all
  c = Challenge.ids
  users.each do |user|
    Exercise.create!(status: 0, user: user, challenge: Challenge.find(c.sample))
  end

puts "#{users.count} exercise(s) created"
