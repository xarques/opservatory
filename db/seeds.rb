# db/seeds.rb
require "open-uri"
require "yaml"

puts "Cleaning database..."
Challenge.destroy_all
User.destroy_all
Role.destroy_all
Exercise.destroy_all
Hint.destroy_all
ExerciseHint.destroy_all

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

def addHints(challenge, hints)
  if hints
    hints.each_with_index do |hint, index |
      Hint.create!(description: hint["description"],
                  position: index + 1,
                  challenge: challenge)
      puts "    Add Hint: #{hint["description"]}"
    end
  end
end

Dir.foreach("db/challenges") do |file|
  file_path = "db/challenges/#{file}"
  if file_path.end_with?(".yml") && File.file?(file_path)
    challenge = YAML.load(open(file_path).read)
    challenge['photo'] = Rails.root.join("db/images/#{challenge['photo']}").open
    # hints key has to be removed from the challenge hash before creation
    # because it is not a valid attribute
    hints = challenge.delete("hints")
    c = Challenge.create!(challenge)
    puts "  Add Challenge #{file}: #{c.name}"
    addHints(c, hints)
  end
end

puts "#{Challenge.count} challenges have been created"

puts "Creating exercises..."

users = User.all
challenge_ids = Challenge.ids
challenges = Challenge.where("name in ('Create a public S3 bucket', 'Create a private S3 bucket', 'Create an EC2 instance','Create a RDS Database','Create a S3 bucket')")
users.each do |user|
  # sample_challenge = Challenge.find(challenge_ids.sample)
  sample_challenge = challenges.sample
  Exercise.create!(status: 0, code: sample_challenge.start_point, user: user, challenge: sample_challenge)
end

puts "#{users.count} exercise(s) created"

puts "Creating exercise hints..."

exercises = Exercise.all

exercises.each do |exercise|
  hint = exercise.hints.where(position:1)
  ExerciseHint.create!(exercise: exercise, hint: hint[0]) if hint.any?
end

puts "Exercise Hints created"
