// This script populates the option tables with initial data
// Run with: node scripts/seed-options.js

const { Amplify } = require('aws-amplify');
const { generateClient } = require('aws-amplify/api');
const config = require('../src/amplifyconfiguration.json');

Amplify.configure(config);
const client = generateClient();

async function seedOptions() {
  console.log('Seeding option tables...');

  // Topics
  const topics = [
    { name: 'Mathematics', description: 'Math-related questions' },
    { name: 'Science', description: 'Science-related questions' },
    { name: 'Computer Science', description: 'Computer Science-related questions' },
    { name: 'Geography', description: 'Geography-related questions' },
    { name: 'History', description: 'History-related questions' },
    { name: 'Literature', description: 'Literature-related questions' },
    { name: 'Art', description: 'Art-related questions' },
    { name: 'Music', description: 'Music-related questions' },
    { name: 'Sports', description: 'Sports-related questions' },
    { name: 'Cloud Computing', description: 'Cloud Computing-related questions' }
  ];

  // Knowledge Skills
  const knowledgeSkills = [
    { name: 'Basic Arithmetic', description: 'Addition, subtraction, multiplication, division' },
    { name: 'Algebra', description: 'Solving equations, inequalities' },
    { name: 'Geometry', description: 'Shapes, angles, areas' },
    { name: 'Calculus', description: 'Derivatives, integrals' },
    { name: 'Physics', description: 'Mechanics, thermodynamics, electromagnetism' },
    { name: 'Chemistry', description: 'Elements, compounds, reactions' },
    { name: 'Biology', description: 'Cells, organisms, ecosystems' },
    { name: 'Programming', description: 'Coding, algorithms, data structures' },
    { name: 'Web Development', description: 'HTML, CSS, JavaScript' },
    { name: 'Database', description: 'SQL, NoSQL, data modeling' },
    { name: 'Networking', description: 'TCP/IP, DNS, HTTP' },
    { name: 'Security', description: 'Encryption, authentication, authorization' },
    { name: 'AWS Services', description: 'EC2, S3, Lambda, etc.' },
    { name: 'World Capitals', description: 'Capital cities of countries' },
    { name: 'Astronomy', description: 'Planets, stars, galaxies' }
  ];

  // Tags
  const tags = [
    { name: 'easy', description: 'Easy difficulty questions' },
    { name: 'medium', description: 'Medium difficulty questions' },
    { name: 'hard', description: 'Hard difficulty questions' },
    { name: 'math', description: 'Math-related questions' },
    { name: 'science', description: 'Science-related questions' },
    { name: 'programming', description: 'Programming-related questions' },
    { name: 'aws', description: 'AWS-related questions' },
    { name: 'react', description: 'React-related questions' },
    { name: 'javascript', description: 'JavaScript-related questions' },
    { name: 'python', description: 'Python-related questions' },
    { name: 'java', description: 'Java-related questions' },
    { name: 'c++', description: 'C++-related questions' },
    { name: 'database', description: 'Database-related questions' },
    { name: 'web', description: 'Web-related questions' },
    { name: 'mobile', description: 'Mobile-related questions' },
    { name: 'cloud', description: 'Cloud-related questions' },
    { name: 'security', description: 'Security-related questions' },
    { name: 'networking', description: 'Networking-related questions' },
    { name: 'devops', description: 'DevOps-related questions' },
    { name: 'machine-learning', description: 'Machine Learning-related questions' }
  ];

  // Item Types
  const itemTypes = [
    { name: 'MCQ', description: 'Multiple Choice Question' },
    { name: 'TF', description: 'True/False Question' },
    { name: 'SA', description: 'Short Answer Question' },
    { name: 'Essay', description: 'Essay Question' },
    { name: 'Matching', description: 'Matching Question' },
    { name: 'Ordering', description: 'Ordering Question' },
    { name: 'FIB', description: 'Fill in the Blank Question' },
    { name: 'Coding', description: 'Coding Question' }
  ];

  // Item Statuses
  const itemStatuses = [
    { name: 'Draft', description: 'Item is in draft state' },
    { name: 'Review', description: 'Item is under review' },
    { name: 'Active', description: 'Item is active and can be used' },
    { name: 'Retired', description: 'Item is retired and should not be used' },
    { name: 'Archived', description: 'Item is archived for historical purposes' }
  ];

  try {
    // Seed Topics
    console.log('Seeding Topics...');
    for (const topic of topics) {
      await client.models.Topic.create(topic);
    }
    console.log('Topics seeded successfully.');

    // Seed Knowledge Skills
    console.log('Seeding Knowledge Skills...');
    for (const skill of knowledgeSkills) {
      await client.models.KnowledgeSkill.create(skill);
    }
    console.log('Knowledge Skills seeded successfully.');

    // Seed Tags
    console.log('Seeding Tags...');
    for (const tag of tags) {
      await client.models.Tag.create(tag);
    }
    console.log('Tags seeded successfully.');

    // Seed Item Types
    console.log('Seeding Item Types...');
    for (const type of itemTypes) {
      await client.models.ItemType.create(type);
    }
    console.log('Item Types seeded successfully.');

    // Seed Item Statuses
    console.log('Seeding Item Statuses...');
    for (const status of itemStatuses) {
      await client.models.ItemStatus.create(status);
    }
    console.log('Item Statuses seeded successfully.');

    console.log('All options seeded successfully!');
  } catch (error) {
    console.error('Error seeding options:', error);
  }
}

seedOptions(); 