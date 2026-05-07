/**
 * MongoDB Connection Test Script
 * 
 * This script tests the MongoDB connection using the same configuration
 * as the main application to help diagnose connection issues.
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

async function testMongoConnection() {
  console.log('🔍 Testing MongoDB Connection...\n');
  
  // Check if MONGO_URI is defined
  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI is not defined in environment variables');
    console.log('   Please check your .env file and ensure MONGO_URI is set correctly');
    process.exit(1);
  }
  
  console.log('📋 Environment Variables Check:');
  console.log(`   MONGO_URI: ${process.env.MONGO_URI.substring(0, 30)}...${process.env.MONGO_URI.slice(-10)}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
  console.log('');
  
  try {
    // Test connection with verbose logging
    console.log('🔌 Attempting to connect to MongoDB...');
    
    const connection = await mongoose.connect(process.env.MONGO_URI, {
      // Connection options for testing
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      socketTimeoutMS: 45000,
      bufferCommands: false,
    });
    
    console.log('  Successfully connected to MongoDB!');
    console.log(`   Host: ${connection.connection.host}`);
    console.log(`   Database: ${connection.connection.name}`);
    console.log(`   Port: ${connection.connection.port}`);
    
    // Test a simple operation
    console.log('\n🧪 Testing database operation...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`   Found ${collections.length} collections in database`);
    
    // Close connection
    await mongoose.connection.close();
    console.log('\n🔒 Connection closed successfully');
    
    console.log('\n🎉 All tests passed! MongoDB connection is working correctly.');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ MongoDB Connection Failed!');
    console.error(`   Error: ${error.message}`);
    
    // Provide specific troubleshooting guidance
    if (error.message.includes('authentication failed')) {
      console.log('\n🔧 Troubleshooting Tips:');
      console.log('   1. Check that your username and password in MONGO_URI are correct');
      console.log('   2. Ensure the user exists in your MongoDB database');
      console.log('   3. Verify the user has proper permissions for the database');
      console.log('   4. If using special characters in password, make sure they are URL encoded');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.log('\n🔧 Troubleshooting Tips:');
      console.log('   1. Check that your MongoDB cluster URL is correct');
      console.log('   2. Ensure you have internet connectivity');
      console.log('   3. Verify that your DNS can resolve the MongoDB hostname');
    } else if (error.message.includes('timed out')) {
      console.log('\n🔧 Troubleshooting Tips:');
      console.log('   1. Check your network connectivity');
      console.log('   2. Verify that MongoDB Atlas is not blocked by your firewall');
      console.log('   3. Try connecting with MongoDB Compass to test connectivity');
    }
    
    console.log('\n📝 Debug Information:');
    console.log('   MONGO_URI format should be:');
    console.log('   mongodb+srv://username:password@cluster/database');
    
    process.exit(1);
  }
}

// Run the test
testMongoConnection();