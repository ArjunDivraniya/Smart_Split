/**
 * Migration Script: Move Trip documents to Group collection
 * 
 * This script migrates all Trip documents from the trips collection
 * into the groups collection, converting them to Group type='trip' documents.
 * 
 * Usage: npx ts-node src/scripts/migrate-trips-to-groups.ts
 * 
 * What it does:
 * 1. Connects to MongoDB
 * 2. Reads all Trip documents
 * 3. Creates corresponding Group documents with type='trip'
 * 4. Maps Trip fields to Group fields (startDate → tripStartDate, etc)
 * 5. Preserves members, expenses, and other data
 * 6. Creates a backup record of the migration
 * 7. Does NOT delete Trip documents (for safety)
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Models
interface ITrip extends mongoose.Document {
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
  updatedAt: Date;
}

interface IGroup extends mongoose.Document {
  name: string;
  type: string;
  emoji: string;
  description?: string;
  createdBy: mongoose.Types.ObjectId;
  members: Array<{
    userId: mongoose.Types.ObjectId;
    userName: string;
    email: string;
    role: 'creator' | 'member';
    status?: 'invited' | 'joined' | 'rejected';
  }>;
  expenses: mongoose.Types.ObjectId[];
  totalSpent: number;
  netBalance: number;
  isActive: boolean;
  status?: 'active' | 'completed';
  tripStartDate?: Date;
  tripEndDate?: Date;
  tripDestination?: string;
  tripBudget?: number;
  trackBudget?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Define schemas inline
const TripSchema = new mongoose.Schema({
  name: String,
  destination: String,
  startDate: Date,
  endDate: Date,
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [
    {
      email: String,
      userId: mongoose.Schema.Types.ObjectId,
      status: {
        type: String,
        enum: ['invited', 'joined', 'rejected'],
      },
    },
  ],
  expenses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expense',
    },
  ],
  createdAt: Date,
  updatedAt: Date,
});

const GroupSchema = new mongoose.Schema({
  name: String,
  type: {
    type: String,
    enum: ['personal', 'trip', 'college', 'food', 'flatmates', 'event', 'custom'],
    required: true,
  },
  emoji: String,
  description: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [
    {
      userId: mongoose.Schema.Types.ObjectId,
      userName: String,
      email: String,
      role: {
        type: String,
        enum: ['creator', 'member'],
        default: 'member',
      },
      status: {
        type: String,
        enum: ['invited', 'joined', 'rejected'],
        default: 'joined',
      },
    },
  ],
  expenses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expense',
    },
  ],
  totalSpent: { type: Number, default: 0 },
  netBalance: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  status: String,
  tripStartDate: Date,
  tripEndDate: Date,
  tripDestination: String,
  tripBudget: Number,
  trackBudget: Boolean,
  createdAt: Date,
  updatedAt: Date,
});

const Trip = mongoose.model<ITrip>('Trip', TripSchema);
const Group = mongoose.model<IGroup>('Group', GroupSchema);

// Migration function
async function migrateTripsToGroups() {
  try {
    console.log('🚀 Starting Trip to Group migration...\n');

    // Connect to MongoDB
    const mongoUrl = process.env.MONGODB_URI;
    if (!mongoUrl) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB\n');

    // Fetch all trips
    console.log('📊 Fetching all trips from the database...');
    const trips = await Trip.find().lean();
    console.log(`✅ Found ${trips.length} trips to migrate\n`);

    if (trips.length === 0) {
      console.log('ℹ️  No trips found. Migration complete.');
      await mongoose.disconnect();
      return;
    }

    let successCount = 0;
    let errorCount = 0;
    const migrationRecords: any[] = [];

    // Migrate each trip
    for (const trip of trips) {
      try {
        console.log(`\n📝 Migrating trip: "${trip.name}"`);

        // Get creator details for the group
        let creatorName = 'Unknown';
        let creatorEmail = 'unknown@example.com';
        
        try {
          const User = mongoose.model('User');
          const creator = (await User.findById(trip.createdBy).lean()) as any;
          if (creator) {
            creatorName = creator.name || 'Unknown';
            creatorEmail = creator.email || 'unknown@example.com';
          }
        } catch (e) {
          // If User model not found, continue with defaults
        }

        // Convert Trip members to Group members format
        const groupMembers = [
          {
            userId: trip.createdBy,
            userName: creatorName,
            email: creatorEmail,
            role: 'creator',
            status: 'joined',
          },
          ...trip.members.map((member: any) => ({
            userId: member.userId || null,
            userName: member.email.split('@')[0],
            email: member.email,
            role: 'member',
            status: member.status,
          })),
        ];

        // Create Group document from Trip
        const newGroup = new Group({
          name: trip.name,
          type: 'trip',
          emoji: '✈️', // Trip emoji
          description: `Trip to ${trip.destination}`,
          createdBy: trip.createdBy,
          members: groupMembers,
          expenses: trip.expenses || [],
          totalSpent: 0,
          netBalance: 0,
          isActive: trip.status === 'active',
          status: trip.status,
          tripStartDate: trip.startDate,
          tripEndDate: trip.endDate,
          tripDestination: trip.destination,
          tripBudget: null,
          trackBudget: false,
          createdAt: trip.createdAt,
          updatedAt: trip.updatedAt,
        });

        // Save the group
        const savedGroup = await newGroup.save();
        console.log(`✅ Successfully migrated trip "${trip.name}" (ID: ${savedGroup._id})`);

        successCount++;
        migrationRecords.push({
          tripId: trip._id,
          tripName: trip.name,
          groupId: savedGroup._id,
          status: 'success',
          timestamp: new Date(),
        });
      } catch (error: any) {
        console.error(`❌ Error migrating trip "${trip.name}":`, error.message);
        errorCount++;
        migrationRecords.push({
          tripId: trip._id,
          tripName: trip.name,
          groupId: null,
          status: 'failed',
          error: error.message,
          timestamp: new Date(),
        });
      }
    }

    // Summary
    console.log('\n\n🎉 Migration Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Successfully migrated: ${successCount} trip(s)`);
    console.log(`❌ Failed migrations: ${errorCount} trip(s)`);
    console.log(`📦 Total trips processed: ${trips.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Save migration log
    try {
      const MigrationLog = mongoose.model(
        'MigrationLog',
        new mongoose.Schema({
          migrationName: String,
          records: mongoose.Schema.Types.Mixed,
          summary: mongoose.Schema.Types.Mixed,
          timestamp: Date,
        })
      );

      await MigrationLog.create({
        migrationName: 'trip-to-group-migration',
        records: migrationRecords,
        summary: {
          totalTrips: trips.length,
          successCount,
          errorCount,
        },
        timestamp: new Date(),
      });

      console.log('📋 Migration log saved to database');
    } catch (e) {
      console.log('⚠️  Could not save migration log (collection may not exist yet)');
    }

    // Provide next steps
    console.log('\n📋 Next Steps:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1. Verify the migrated groups in MongoDB');
    console.log('2. Test the mobile app to ensure all trips display as groups');
    console.log('3. If all looks good, you can optionally delete the trips collection');
    console.log('   (Backup your database first!)');
    console.log('4. Update any API routes that reference the Trip model to use Group instead');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB. Migration complete!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Critical error during migration:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run migration
migrateTripsToGroups();
