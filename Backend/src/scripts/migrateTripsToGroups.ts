import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Group from '../models/Group.model';

dotenv.config();

interface ITrip {
  _id: mongoose.Types.ObjectId;
  name: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed';
  createdBy: mongoose.Types.ObjectId;
  members: Array<{
    email: string;
    userId?: mongoose.Types.ObjectId;
    status: 'invited' | 'joined' | 'rejected';
  }>;
  expenses: mongoose.Types.ObjectId[];
  createdAt: Date;
}

async function migrateTripsToGroups() {
  try {
    console.log('🔄 Starting migration from Trip collection to Group collection...\n');

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smartsplit';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Get the Trip collection
    const tripCollection = mongoose.connection.collection('trips');
    const allTrips = await tripCollection.find({}).toArray() as unknown as ITrip[];

    console.log(`\n📊 Found ${allTrips.length} trips to migrate\n`);

    if (allTrips.length === 0) {
      console.log('ℹ️  No trips to migrate');
      await mongoose.connection.close();
      return;
    }

    // Convert each trip to group format
    const groupsToInsert = allTrips.map((trip) => {
      // Ensure members have required fields
      const convertedMembers = trip.members.map((member) => {
        // Try to get user data if we have a userId
        return {
          userId: member.userId || new mongoose.Types.ObjectId(),
          userName: member.email?.split('@')[0] || 'User', // Fallback: use email prefix as name
          email: member.email,
          role: (member.userId || member.status === 'joined') ? 'member' : 'member', // Default all to member
          status: member.status || 'joined',
        };
      });

      // Ensure createdBy member exists in the members array
      const createdByMember = convertedMembers.find(m => m.userId?.toString() === trip.createdBy?.toString());
      if (!createdByMember && trip.createdBy) {
        convertedMembers.unshift({
          userId: trip.createdBy,
          userName: 'Creator', // Will be updated with actual user data
          email: '', // Will be updated with actual user data
          role: 'creator',
          status: 'joined',
        });
      }

      return {
        _id: trip._id,
        name: trip.name,
        type: 'trip', // Set type to 'trip'
        emoji: '✈️', // Default emoji for migrated trips
        description: '', // No description in old model
        createdBy: trip.createdBy,
        members: convertedMembers,
        expenses: trip.expenses || [],
        totalSpent: 0, // Will be calculated from expenses
        netBalance: 0, // Will be calculated from expenses
        isActive: trip.status === 'active',
        status: trip.status,
        tripStartDate: trip.startDate,
        tripEndDate: trip.endDate,
        tripDestination: trip.destination,
        tripBudget: null, // Old trips don't have budget
        trackBudget: false,
        createdAt: trip.createdAt || new Date(),
        updatedAt: trip.createdAt || new Date(),
        __v: 0,
      };
    });

    console.log('📝 Converting trips to group format...\n');
    groupsToInsert.forEach((group, index) => {
      console.log(`  ${index + 1}. "${group.name}" (${group.tripDestination})`);
      console.log(`     Members: ${group.members.length}`);
      console.log(`     Status: ${group.status}`);
    });

    // Insert groups into the Group collection
    console.log(`\n⏳ Inserting ${groupsToInsert.length} groups into Group collection...\n`);
    
    const result = await Group.insertMany(groupsToInsert, { ordered: false });

    console.log(`\n✅ Successfully migrated ${result.length} trips to groups`);
    console.log(`\n📊 Migration Summary:`);
    console.log(`   Total trips migrated: ${result.length}`);
    console.log(`   Status: COMPLETE`);

    // Optional: Show backup notice
    console.log(`\n⚠️  Next Steps:`);
    console.log(`   1. Verify the migrated groups in MongoDB Compass`);
    console.log(`   2. Update all queries to use Group model only`);
    console.log(`   3. Delete Trip.model.ts when ready`);
    console.log(`   4. Run: db.trips.drop() in MongoDB to delete old collection\n`);

    await mongoose.connection.close();
    console.log('✅ Migration complete and database connection closed');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run migration
migrateTripsToGroups();
