import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.model';
import Group from '../models/Group.model';
import Trip from '../models/Trip.model';

dotenv.config();

const DEFAULT_EMAIL = 'app@gmail.com';
const DEFAULT_PASSWORD = '123456';

const getArgValue = (flag: string): string | undefined => {
  const index = process.argv.indexOf(flag);
  if (index === -1) return undefined;
  return process.argv[index + 1];
};

const run = async () => {
  const email = (getArgValue('--email') || DEFAULT_EMAIL).trim().toLowerCase();
  const password = (getArgValue('--password') || DEFAULT_PASSWORD).trim();

  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not defined in .env');
  }

  await mongoose.connect(mongoUri, { bufferCommands: false });

  let user = await User.findOne({ email: { $regex: `^${email}$`, $options: 'i' } }).select('+password');

  const hashedPassword = await bcrypt.hash(password, 10);

  if (!user) {
    user = await User.create({
      name: email.split('@')[0],
      email,
      password: hashedPassword,
      authProvider: 'credentials',
    });
    console.log(`[SETUP] Created user ${email}`);
  } else {
    user.password = hashedPassword;
    user.authProvider = 'credentials';
    await user.save();
    console.log(`[SETUP] Updated credentials for ${email}`);
  }

  const userId = user._id;

  const groups = await Group.find({}).select('_id members createdBy name');
  let groupsUpdated = 0;

  for (const group of groups) {
    const alreadyMember = group.members.some((m: any) => String(m.userId) === String(userId));
    if (!alreadyMember) {
      group.members.push({
        userId,
        userName: user.name || email,
        email: user.email,
        role: 'member',
        status: 'joined',
      } as any);
      groupsUpdated += 1;
      await group.save();
    }
  }

  const trips = await Trip.find({}).select('_id members createdBy name');
  let tripsUpdated = 0;

  for (const trip of trips) {
    const alreadyMember = trip.members.some((m: any) => String(m.userId) === String(userId));
    if (!alreadyMember) {
      trip.members.push({
        email: user.email,
        userId,
        status: 'joined',
      } as any);
      tripsUpdated += 1;
      await trip.save();
    } else {
      let mutated = false;
      trip.members = trip.members.map((member: any) => {
        if (String(member.userId) === String(userId) && member.status !== 'joined') {
          mutated = true;
          return {
            ...member.toObject?.() ?? member,
            status: 'joined',
          };
        }
        return member;
      }) as any;

      if (mutated) {
        tripsUpdated += 1;
        await trip.save();
      }
    }
  }

  console.log('[DONE] Global access granted successfully');
  console.log(`User ID: ${String(userId)}`);
  console.log(`Groups updated: ${groupsUpdated}`);
  console.log(`Trips updated: ${tripsUpdated}`);
};

run()
  .catch((error) => {
    console.error('[ERROR]', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
