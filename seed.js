
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Need = require('./models/Need');
const Volunteer = require('./models/Volunteer');
const Task = require('./models/Task');
const Survey = require('./models/Survey');

// Sample data
const users = [
  {
    name: 'Admin User',
    email: 'admin@impacthub.org',
    password: 'admin123',
    role: 'admin',
    organization: 'ImpactHub',
    avatar: '👑'
  },
  {
    name: 'Sarah Coordinator',
    email: 'sarah@impacthub.org',
    password: 'password123',
    role: 'coordinator',
    organization: 'Community Aid NGO',
    avatar: '👩‍💼'
  },
  {
    name: 'Raj Field Worker',
    email: 'raj@impacthub.org',
    password: 'password123',
    role: 'field-worker',
    organization: 'Field Operations',
    avatar: '👷'
  }
];

const volunteers = [
  {
    name: 'Sarah Chen', email: 'sarah.chen@email.com', phone: '555-0101', avatar: '👩‍⚕️',
    skills: ['Medical', 'First Aid', 'CPR'], availability: 'part-time',
    location: 'Central Zone', region: 'Central Zone', status: 'active',
    preferredCategories: ['healthcare', 'disaster'], tasksCompleted: 23, rating: 4.9, hoursLogged: 156
  },
  {
    name: 'Marcus Johnson', email: 'marcus.j@email.com', phone: '555-0102', avatar: '👨‍🏫',
    skills: ['Teaching', 'Mentoring', 'Tutoring'], availability: 'weekends',
    location: 'East Zone', region: 'East Zone', status: 'on-task',
    preferredCategories: ['education', 'youth'], tasksCompleted: 18, rating: 4.8, hoursLogged: 120,
    password: 'password123'
  },
  {
    name: 'Elena Rodriguez', email: 'elena.r@email.com', phone: '555-0103', avatar: '👩‍🔧',
    skills: ['Construction', 'Plumbing', 'Electrical'], availability: 'full-time',
    location: 'North Zone', region: 'North Zone', status: 'on-task',
    preferredCategories: ['shelter', 'disaster'], tasksCompleted: 31, rating: 5.0, hoursLogged: 280,
    password: 'password123'
  },
  {
    name: 'David Park', email: 'david.p@email.com', phone: '555-0104', avatar: '👨‍🍳',
    skills: ['Cooking', 'Food Safety', 'Management'], availability: 'flexible',
    location: 'Central Zone', region: 'Central Zone', status: 'active',
    preferredCategories: ['food', 'elderly'], tasksCompleted: 12, rating: 4.7, hoursLogged: 88,
    password: 'password123'
  },
  {
    name: 'Amara Okafor', email: 'amara.o@email.com', phone: '555-0105', avatar: '👩‍💼',
    skills: ['Project Management', 'Coordination', 'Logistics'], availability: 'part-time',
    location: 'South Zone', region: 'South Zone', status: 'active',
    preferredCategories: ['food', 'healthcare'], tasksCompleted: 27, rating: 4.9, hoursLogged: 195,
    password: 'password123'
  },
  {
    name: 'James Wilson', email: 'james.w@email.com', phone: '555-0106', avatar: '👨‍⚕️',
    skills: ['Nursing', 'First Aid', 'Diagnostics'], availability: 'weekends',
    location: 'South Zone', region: 'South Zone', status: 'active',
    preferredCategories: ['healthcare'], tasksCompleted: 15, rating: 4.6, hoursLogged: 102,
    password: 'password123'
  },
  {
    name: 'Priya Sharma', email: 'priya.s@email.com', phone: '555-0107', avatar: '👩‍🌾',
    skills: ['Gardening', 'Environmental Science', 'Teaching'], availability: 'flexible',
    location: 'Central Zone', region: 'Central Zone', status: 'active',
    preferredCategories: ['environment', 'education'], tasksCompleted: 9, rating: 4.8, hoursLogged: 64,
    password: 'password123'
  },
  {
    name: 'Robert Taylor', email: 'robert.t@email.com', phone: '555-0108', avatar: '👨‍💻',
    skills: ['IT Support', 'Data Entry', 'Web Development'], availability: 'part-time',
    location: 'West Zone', region: 'West Zone', status: 'active',
    preferredCategories: ['education', 'youth'], tasksCompleted: 14, rating: 4.5, hoursLogged: 78,
    password: 'password123'
  },
  {
    name: 'Lisa Nguyen', email: 'lisa.n@email.com', phone: '555-0109', avatar: '👩‍🎨',
    skills: ['Art Therapy', 'Counseling', 'Event Planning'], availability: 'weekends',
    location: 'East Zone', region: 'East Zone', status: 'active',
    preferredCategories: ['youth', 'elderly'], tasksCompleted: 6, rating: 4.7, hoursLogged: 42,
    password: 'password123'
  },
  {
    name: 'Omar Hassan', email: 'omar.h@email.com', phone: '555-0110', avatar: '👨‍🚒',
    skills: ['Fire Safety', 'Rescue Operations', 'First Aid'], availability: 'full-time',
    location: 'North Zone', region: 'North Zone', status: 'on-task',
    preferredCategories: ['disaster', 'healthcare'], tasksCompleted: 35, rating: 5.0, hoursLogged: 310,
    password: 'password123'
  },
  {
    name: 'Maria Santos', email: 'maria.s@email.com', phone: '555-0111', avatar: '👩‍⚕️',
    skills: ['Nutrition', 'Diet Planning', 'Community Health'], availability: 'part-time',
    location: 'West Zone', region: 'West Zone', status: 'active',
    preferredCategories: ['food', 'healthcare'], tasksCompleted: 11, rating: 4.6, hoursLogged: 76,
    password: 'password123'
  },
  {
    name: 'Alex Kim', email: 'alex.k@email.com', phone: '555-0112', avatar: '🧑‍🎓',
    skills: ['Mathematics', 'Science', 'Computer Literacy'], availability: 'weekends',
    location: 'East Zone', region: 'East Zone', status: 'active',
    preferredCategories: ['education', 'youth'], tasksCompleted: 3, rating: 4.4, hoursLogged: 18,
    password: 'password123'
  }
];

const needs = [
  { title: 'Clean Water Access in Riverside District', category: 'healthcare', urgency: 'critical', location: 'Riverside District', region: 'North Zone', description: 'Over 2,000 families lack access to clean drinking water due to contaminated wells after recent flooding.', affectedPeople: 8500, status: 'open', source: 'field-report', volunteersNeeded: 25, volunteersAssigned: 8, coordinates: { x: 72, y: 18 } },
  { title: 'School Supplies for Hilltop Academy', category: 'education', urgency: 'high', location: 'Hilltop Area', region: 'East Zone', description: '350 students lack basic school supplies including textbooks, notebooks, and stationery items.', affectedPeople: 350, status: 'in-progress', source: 'ngo', volunteersNeeded: 12, volunteersAssigned: 10, coordinates: { x: 68, y: 35 } },
  { title: 'Emergency Food Distribution - South Ward', category: 'food', urgency: 'critical', location: 'South Ward', region: 'South Zone', description: 'Food bank depleted. 500+ families urgently need food supplies due to job losses from factory closure.', affectedPeople: 2100, status: 'open', source: 'community', volunteersNeeded: 30, volunteersAssigned: 12, coordinates: { x: 45, y: 72 } },
  { title: 'Elderly Care Program - Sunset Home', category: 'elderly', urgency: 'high', location: 'Sunset Boulevard', region: 'West Zone', description: '120 seniors at Sunset Home need daily assistance with meals, medication, and companionship visits.', affectedPeople: 120, status: 'in-progress', source: 'survey', volunteersNeeded: 20, volunteersAssigned: 15, coordinates: { x: 22, y: 40 } },
  { title: 'Post-Flood Shelter Reconstruction', category: 'shelter', urgency: 'critical', location: 'Valley Creek', region: 'North Zone', description: '45 homes destroyed in recent flooding. Families are living in temporary tents with winter approaching.', affectedPeople: 340, status: 'in-progress', source: 'field-report', volunteersNeeded: 50, volunteersAssigned: 32, coordinates: { x: 65, y: 12 } },
  { title: 'Park Cleanup & Tree Planting Drive', category: 'environment', urgency: 'medium', location: 'Central Park', region: 'Central Zone', description: '5-acre park degraded by illegal dumping. Need cleanup crew and 500 new saplings for reforestation.', affectedPeople: 15000, status: 'open', source: 'community', volunteersNeeded: 40, volunteersAssigned: 5, coordinates: { x: 48, y: 48 } },
  { title: 'Youth Mentorship Program Launch', category: 'youth', urgency: 'medium', location: 'Oak Street Community Center', region: 'East Zone', description: 'At-risk youth (ages 14-18) need mentors for career guidance, tutoring, and life skills development.', affectedPeople: 85, status: 'open', source: 'ngo', volunteersNeeded: 15, volunteersAssigned: 3, coordinates: { x: 75, y: 50 } },
  { title: 'Medical Camp - Dengue Outbreak Response', category: 'healthcare', urgency: 'critical', location: 'Marshland Settlements', region: 'South Zone', description: 'Dengue outbreak affecting 400+ residents. Urgent need for medical volunteers, supplies, and fogging.', affectedPeople: 420, status: 'open', source: 'field-report', volunteersNeeded: 35, volunteersAssigned: 18, coordinates: { x: 38, y: 80 } },
  { title: 'Winter Clothing Drive', category: 'shelter', urgency: 'high', location: 'Multiple Locations', region: 'All Zones', description: 'Collection and distribution of winter clothing for 1,000+ homeless individuals across the city.', affectedPeople: 1200, status: 'in-progress', source: 'community', volunteersNeeded: 20, volunteersAssigned: 14, coordinates: { x: 50, y: 50 } },
  { title: 'Literacy Program for Adult Women', category: 'education', urgency: 'medium', location: 'Women Empowerment Center', region: 'West Zone', description: '200 women enrolled in basic literacy program need volunteer teachers for evening classes.', affectedPeople: 200, status: 'in-progress', source: 'survey', volunteersNeeded: 10, volunteersAssigned: 7, coordinates: { x: 18, y: 55 } },
  { title: 'Community Kitchen Setup - Market Area', category: 'food', urgency: 'high', location: 'Old Market Area', region: 'Central Zone', description: 'Setting up community kitchen to serve 300 free meals daily to migrant workers and homeless.', affectedPeople: 300, status: 'open', source: 'ngo', volunteersNeeded: 18, volunteersAssigned: 6, coordinates: { x: 52, y: 42 } },
  { title: 'Disaster Preparedness Training', category: 'disaster', urgency: 'medium', location: 'All Community Centers', region: 'All Zones', description: 'Training 500 residents in first aid, evacuation procedures, and emergency response protocols.', affectedPeople: 500, status: 'open', source: 'survey', volunteersNeeded: 8, volunteersAssigned: 2, coordinates: { x: 50, y: 30 } }
];

const surveys = [
  { submittedBy: 'Field Worker - Raj K.', location: 'Riverside District', region: 'North Zone', category: 'healthcare', description: 'Water contamination confirmed. 3 wells tested positive for bacteria.', affectedCount: 8500, urgency: 'critical', verified: true, source: 'field-report', surveyType: 'observation' },
  { submittedBy: 'NGO - EduFirst', location: 'Hilltop Area', region: 'East Zone', category: 'education', description: 'School inventory check shows 78% of students sharing textbooks.', affectedCount: 350, urgency: 'high', verified: true, source: 'ngo', surveyType: 'community-meeting' },
  { submittedBy: 'Community Leader - Maria G.', location: 'South Ward', region: 'South Zone', category: 'food', description: 'Factory closure affecting 500+ families. Food bank running critically low.', affectedCount: 2100, urgency: 'critical', verified: true, source: 'community', surveyType: 'door-to-door' },
  { submittedBy: 'Field Worker - Anita S.', location: 'Sunset Boulevard', region: 'West Zone', category: 'elderly', description: 'Sunset Home understaffed. Seniors missing medication schedules regularly.', affectedCount: 120, urgency: 'high', verified: true, source: 'field-report', surveyType: 'observation' },
  { submittedBy: 'Volunteer - Omar H.', location: 'Valley Creek', region: 'North Zone', category: 'shelter', description: '45 homes completely destroyed. Families need permanent shelter solutions.', affectedCount: 340, urgency: 'critical', verified: true, source: 'field-report', surveyType: 'door-to-door' },
  { submittedBy: 'Community Leader - John D.', location: 'Central Park', region: 'Central Zone', category: 'environment', description: 'Illegal dumping increasing. Park becoming unusable for families.', affectedCount: 15000, urgency: 'medium', verified: false, source: 'community', surveyType: 'community-meeting' },
  { submittedBy: 'NGO - YouthRise', location: 'Oak Street CC', region: 'East Zone', category: 'youth', description: 'At-risk youth dropping out of school at alarming rate in this area.', affectedCount: 85, urgency: 'medium', verified: true, source: 'ngo', surveyType: 'phone-survey' },
  { submittedBy: 'Field Worker - Dr. Priya', location: 'Marshland Settlements', region: 'South Zone', category: 'healthcare', description: 'Dengue cases spiking. 400+ confirmed cases in 2 weeks.', affectedCount: 420, urgency: 'critical', verified: true, source: 'field-report', surveyType: 'door-to-door' }
];

// Seed function
const seedDB = async () => {
  try {
    // Connect to DB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/impacthub');
    console.log('📦 Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Volunteer.deleteMany({});
    await Need.deleteMany({});
    await Task.deleteMany({});
    await Survey.deleteMany({});

    // Hash passwords for users
    console.log('👤 Creating users...');
    for (const user of users) {
      const salt = await bcrypt.genSalt(12);
      user.password = await bcrypt.hash(user.password, salt);
    }
    const createdUsers = await User.insertMany(users);

    // Create volunteers
    console.log('👥 Creating volunteers...');
    // Hash passwords for volunteers that have them
    for (const vol of volunteers) {
      if (vol.password) {
        const salt = await bcrypt.genSalt(12);
        vol.password = await bcrypt.hash(vol.password, salt);
      } else {
        vol.password = await bcrypt.hash('password123', 12);
      }
    }
    const createdVolunteers = await Volunteer.insertMany(volunteers);

    // Create needs
    console.log('📋 Creating community needs...');
    const createdNeeds = await Need.insertMany(needs);

    // Create tasks
    console.log('✅ Creating tasks...');
    const taskTemplates = [
      { title: 'Water Purification Kit Distribution', description: 'Distribute 500 water purification kits to affected families', category: 'healthcare', urgency: 'critical', location: 'Riverside District', status: 'in-progress', volunteersRequired: 8, estimatedHours: 40, deadline: new Date('2024-02-05') },
      { title: 'After-School Tutoring Sessions', description: 'Conduct tutoring sessions for 50 students at Hilltop Academy', category: 'education', urgency: 'high', location: 'Hilltop Area', status: 'assigned', volunteersRequired: 5, estimatedHours: 60, deadline: new Date('2024-03-01') },
      { title: 'Home Reconstruction - Phase 1', description: 'Begin rebuilding 15 homes in Valley Creek', category: 'shelter', urgency: 'critical', location: 'Valley Creek', status: 'in-progress', volunteersRequired: 20, estimatedHours: 320, deadline: new Date('2024-02-28') },
      { title: 'Weekly Meal Prep for Seniors', description: 'Prepare and deliver meals to 120 seniors', category: 'elderly', urgency: 'high', location: 'Sunset Boulevard', status: 'in-progress', volunteersRequired: 6, estimatedHours: 200, deadline: new Date('2024-06-30') },
      { title: 'Emergency Shelter Setup', description: 'Set up temporary shelters with heating for 30 families', category: 'disaster', urgency: 'critical', location: 'Valley Creek', status: 'assigned', volunteersRequired: 12, estimatedHours: 80, deadline: new Date('2024-01-25') },
      { title: 'Food Drive Collection Points', description: 'Manage 5 collection points across South Ward', category: 'food', urgency: 'critical', location: 'South Ward', status: 'pending', volunteersRequired: 15, estimatedHours: 100, deadline: new Date('2024-02-10') },
      { title: 'Dengue Awareness Campaign', description: 'Door-to-door awareness campaign', category: 'healthcare', urgency: 'critical', location: 'Marshland Settlements', status: 'pending', volunteersRequired: 20, estimatedHours: 60, deadline: new Date('2024-02-15') },
      { title: 'Park Cleanup Day', description: 'Organize community cleanup event at Central Park', category: 'environment', urgency: 'medium', location: 'Central Park', status: 'pending', volunteersRequired: 30, estimatedHours: 24, deadline: new Date('2024-02-20') },
      { title: 'Youth Mentoring Workshops', description: 'Weekly career guidance workshops for teens', category: 'youth', urgency: 'medium', location: 'Oak Street CC', status: 'assigned', volunteersRequired: 8, estimatedHours: 120, deadline: new Date('2024-04-30') },
      { title: 'Winter Clothing Sorting', description: 'Sort and package donated winter clothing', category: 'shelter', urgency: 'high', location: 'Central Warehouse', status: 'in-progress', volunteersRequired: 10, estimatedHours: 48, deadline: new Date('2024-02-01') }
    ];

    // Assign volunteers to some tasks and needs
    for (let i = 0; i < taskTemplates.length; i++) {
      taskTemplates[i].needId = createdNeeds[i]._id;
      taskTemplates[i].createdBy = createdUsers[0]._id;
      
      // Assign some volunteers
      if (i < createdVolunteers.length) {
        taskTemplates[i].assignedVolunteers = [createdVolunteers[i]._id];
      }
    }
    await Task.insertMany(taskTemplates);

    // Create surveys
    console.log('📝 Creating survey entries...');
    for (const survey of surveys) {
      if (!survey.submitterId) {
        survey.submitterId = createdUsers[2]._id; // Assign to field worker
      }
    }
    await Survey.insertMany(surveys);

    console.log(`
  ╔══════════════════════════════════════════════╗
  ║   ✅ Database seeded successfully!           ║
  ║                                              ║
  ║   Users:       ${createdUsers.length}                           ║
  ║   Volunteers:  ${createdVolunteers.length}                          ║
  ║   Needs:       ${createdNeeds.length}                          ║
  ║   Tasks:       ${taskTemplates.length}                          ║
  ║   Surveys:     ${surveys.length}                           ║
  ║                                              ║
  ║   Login credentials:                         ║
  ║   Admin:    admin@impacthub.org / admin123   ║
  ║   Coord:    sarah@impacthub.org / password123║
  ║   Worker:   raj@impacthub.org / password123  ║
  ╚══════════════════════════════════════════════╝
    `);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
