# db/seeds.rb
require "open-uri"
require "yaml"

file = "db/seeds.yml"
sample = YAML.load(open(file).read)
puts "Cleaning database..."
Challenge.destroy_all

puts 'Creating challenges...'
sample["challenges"].each do |challenge|
  c = Challenge.create!(challenge)
  puts "  Add Challenge: #{c.name}"
end

puts "#{Challenge.count} challenges have been successfully created"
