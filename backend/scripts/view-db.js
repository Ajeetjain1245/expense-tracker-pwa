import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../src/models/User.js';
import { Expense } from '../src/models/Expense.js';

dotenv.config();

const viewDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/expense_tracker';
    console.log(`\nConnecting to: ${mongoUri}\n`);

    await mongoose.connect(mongoUri);

    console.log('====================================================');
    console.log('📊 DATABASE CONTENTS: expense_tracker');
    console.log('====================================================\n');

    // 1. Fetch Users
    const users = await User.find({}).select('name email createdAt');
    console.log(`👤 USERS (${users.length} registered):`);
    if (users.length === 0) {
      console.log('   (No users found yet)\n');
    } else {
      console.table(
        users.map((u) => ({
          ID: u._id.toString(),
          Name: u.name,
          Email: u.email,
          'Signed Up At': new Date(u.createdAt).toLocaleString('en-IN')
        }))
      );
    }

    // 2. Fetch Expenses
    const expenses = await Expense.find({}).populate('user', 'name email').sort({ date: -1 });
    console.log(`\n💳 EXPENSES (${expenses.length} total recorded):`);
    if (expenses.length === 0) {
      console.log('   (No expenses found yet)\n');
    } else {
      console.table(
        expenses.map((e) => ({
          ID: e._id.toString(),
          User: e.user?.name || e.user?.email || e.user?.toString() || 'N/A',
          Amount: `₹${e.amount}`,
          Category: e.category,
          Mode: e.paymentMode,
          SubType: e.onlineSubType || '-',
          Note: e.note || '-',
          Date: new Date(e.date).toLocaleDateString('en-IN')
        }))
      );
    }

    console.log('\n====================================================');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error viewing database:', err.message);
    if (err.message.includes('ECONNREFUSED')) {
      console.error('\n⚠️ Note: Make sure MongoDB is running locally on port 27017 or verify your MONGODB_URI in backend/.env');
    }
    process.exit(1);
  }
};

viewDatabase();
