import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required for each expense'],
      index: true
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    paymentMode: {
      type: String,
      required: [true, 'Payment mode is required'],
      enum: {
        values: ['cash', 'online'],
        message: '{VALUE} is not a valid payment mode (must be "cash" or "online")'
      }
    },
    onlineSubType: {
      type: String,
      trim: true,
      required: [
        function () {
          return this.paymentMode === 'online';
        },
        'onlineSubType is required and must be "UPI", "card", or "wallet" when paymentMode is "online"'
      ],
      validate: {
        validator: function (val) {
          if (this.paymentMode === 'online') {
            return ['UPI', 'card', 'wallet'].includes(val);
          }
          return val === null || val === undefined || val === '';
        },
        message: 'onlineSubType must not be set when paymentMode is "cash"'
      }
    },
    note: {
      type: String,
      trim: true,
      default: ''
    },
    date: {
      type: Date,
      required: [true, 'Expense date is required'],
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Pre-validation cleanup: If paymentMode is cash, strip onlineSubType
expenseSchema.pre('validate', function (next) {
  if (this.paymentMode === 'cash') {
    this.onlineSubType = undefined;
  }
  next();
});

// Indexes for high performance querying, filtering, and user isolation
expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ user: 1, category: 1, date: -1 });
expenseSchema.index({ user: 1, paymentMode: 1, date: -1 });

export const Expense = mongoose.model('Expense', expenseSchema);
