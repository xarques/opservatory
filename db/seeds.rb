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

Dir.foreach("db/challenges") do |file|
  file_path = "db/challenges/#{file}"
  if file_path.end_with?(".yml") && File.file?(file_path)
    challenge = YAML.load(open(file_path).read)
    c = Challenge.create!(challenge)
    puts "  Add Challenge #{file}: #{c.name}"
  end
end

puts "#{Challenge.count} challenges have been successfully created"
