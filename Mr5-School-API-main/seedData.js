const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './.env' });

// Import models
const User = require('./src/models/User');
const Course = require('./src/models/Course');
const Enrollment = require('./src/models/Enrollment');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');

  try {
    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Enrollment.deleteMany({});
    
    console.log('Cleared existing data');

    // Create sample users
    const salt = await bcrypt.genSalt(10);
    
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash: await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || 'ChangeMeInProduction!', salt),
      role: 'admin',
      avatar: {
        id: 'admin-avatar',
        settings: {
          skinTone: '#f8d9b8',
          hairColor: '#2c140c',
          clothing: 'professional'
        }
      },
      subscription: {
        planId: 'vip',
        status: 'active',
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
      }
    });

    const teacherUser = new User({
      name: 'John Teacher',
      email: 'teacher@example.com',
      passwordHash: await bcrypt.hash('teacher123', salt),
      role: 'teacher',
      avatar: {
        id: 'teacher-avatar',
        settings: {
          skinTone: '#f8d9b8',
          hairColor: '#2c140c',
          clothing: 'casual'
        }
      },
      subscription: {
        planId: 'creator',
        status: 'active',
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      }
    });

    const studentUser = new User({
      name: 'Alice Student',
      email: 'student@example.com',
      passwordHash: await bcrypt.hash('student123', salt),
      role: 'student',
      avatar: {
        id: 'student-avatar',
        settings: {
          skinTone: '#f8d9b8',
          hairColor: '#2c140c',
          clothing: 'student'
        }
      },
      subscription: {
        planId: 'starter',
        status: 'active',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      }
    });

    const users = await User.insertMany([adminUser, teacherUser, studentUser]);
    console.log('Created sample users');

    // Create sample courses
    const javascriptCourse = new Course({
      title: 'Introduction to JavaScript Programming',
      description: 'Learn the fundamentals of JavaScript programming with hands-on exercises and projects.',
      teacherId: users[1]._id, // John Teacher
      category: 'Programming',
      difficulty: 'beginner',
      price: 49.99,
      thumbnail: 'https://res.cloudinary.com/mr5school/image/upload/v1/javascript-course-thumbnail.jpg',
      published: true,
      modules: [
        {
          title: 'Getting Started with JavaScript',
          description: 'Introduction to JavaScript basics and development environment setup.',
          order: 1,
          lessons: [
            {
              title: 'What is JavaScript?',
              type: 'text',
              content: 'JavaScript is a versatile programming language that enables interactive web pages and is an essential part of web applications. Originally developed by Netscape as LiveScript, it was later renamed JavaScript and standardized by ECMA International as ECMAScript.',
              duration: 15,
              order: 1
            },
            {
              title: 'Setting Up Your Environment',
              type: 'video',
              content: 'https://res.cloudinary.com/mr5school/video/upload/v1/js-setup.mp4',
              duration: 10,
              order: 2
            }
          ]
        },
        {
          title: 'Variables and Data Types',
          description: 'Understanding variables, data types, and basic operations.',
          order: 2,
          lessons: [
            {
              title: 'Variables and Constants',
              type: 'text',
              content: 'In JavaScript, variables are containers for storing data values. JavaScript variables can be declared using var, let, or const. Variables declared with var are function-scoped, while those declared with let and const are block-scoped.',
              duration: 15,
              order: 1
            }
          ]
        }
      ]
    });

    const aiCourse = new Course({
      title: 'Advanced AI Concepts and Applications',
      description: 'Deep dive into machine learning algorithms, neural networks, and practical AI applications.',
      teacherId: users[1]._id, // John Teacher
      category: 'Artificial Intelligence',
      difficulty: 'advanced',
      price: 149.99,
      thumbnail: 'https://res.cloudinary.com/mr5school/image/upload/v1/ai-concepts-thumbnail.jpg',
      published: true,
      modules: [
        {
          title: 'Machine Learning Fundamentals',
          description: 'Core concepts and algorithms in machine learning.',
          order: 1,
          lessons: [
            {
              title: 'Supervised vs Unsupervised Learning',
              type: 'text',
              content: 'Machine learning algorithms can be broadly classified into supervised learning, unsupervised learning, and reinforcement learning. Supervised learning uses labeled training data, while unsupervised learning finds patterns in unlabeled data.',
              duration: 20,
              order: 1
            }
          ]
        }
      ]
    });

    const courses = await Course.insertMany([javascriptCourse, aiCourse]);
    console.log('Created sample courses');

    // Create sample enrollments
    const enrollment1 = new Enrollment({
      userId: users[2]._id, // Alice Student
      courseId: courses[0]._id, // JavaScript Course
      enrolledAt: new Date(),
      status: 'active'
    });

    const enrollment2 = new Enrollment({
      userId: users[2]._id, // Alice Student
      courseId: courses[1]._id, // AI Course
      enrolledAt: new Date(),
      status: 'active'
    });

    await Enrollment.insertMany([enrollment1, enrollment2]);
    console.log('Created sample enrollments');

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
});