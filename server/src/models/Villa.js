import mongoose from 'mongoose';

const bankDetailsSchema = new mongoose.Schema({
  bank: {
    type: String,
    required: [true, 'Bank name is required'],
    trim: true
  },
  accountNumber: {
    type: String,
    required: [true, 'Account number is required'],
    trim: true
  },
  accountName: {
    type: String,
    required: [true, 'Account name is required'],
    trim: true
  }
});

const promptPaySchema = new mongoose.Schema({
  qrImage: {
    type: String,
    trim: true
  }
});

const roomSchema = new mongoose.Schema({
  name: {
    th: {
      type: String,
      trim: true
    },
    en: {
      type: String,
      trim: true
    }
  },
  description: {
    th: {
      type: String,
      trim: true
    },
    en: {
      type: String,
      trim: true
    }
  },
  images: [{
    type: String
  }]
});

const villaSchema = new mongoose.Schema({
  name: {
    en: {
      type: String,
      required: [true, 'English villa name is required'],
      trim: true
    },
    th: {
      type: String,
      required: [true, 'Thai villa name is required'],
      trim: true
    }
  },
  title: {
    en: {
      type: String,
      required: [true, 'English title is required'],
      trim: true
    },
    th: {
      type: String,
      required: [true, 'Thai title is required'],
      trim: true
    }
  },
  description: {
    en: {
      type: String,
      required: [true, 'English description is required'],
      trim: true
    },
    th: {
      type: String,
      required: [true, 'Thai description is required'],
      trim: true
    }
  },
  address: {
    en: {
      type: String,
      trim: true
    },
    th: {
      type: String,
      trim: true
    }
  },
  beachfront: {
    en: {
      type: String,
      default: 'Direct access to the beach',
      trim: true
    },
    th: {
      type: String,
      default: 'เข้าถึงชายหาดได้โดยตรง',
      trim: true
    }
  },

  weekdayPrice: {
    type: Number,
    required: [true, 'Weekday price is required'],
    min: [0, 'Weekday price cannot be negative']
  },
  weekdayDiscountedPrice: {
    type: Number,
    min: [0, 'Weekday discounted price cannot be negative'],
    validate: {
      validator: function(value) {
        return !value || value <= this.weekdayPrice;
      },
      message: 'Discounted price must be less than or equal to regular price'
    }
  },
  weekendPrice: {
    type: Number,
    required: [true, 'Weekend price is required'],
    min: [0, 'Weekend price cannot be negative']
  },
  weekendDiscountedPrice: {
    type: Number,
    min: [0, 'Weekend discounted price cannot be negative'],
    validate: {
      validator: function(value) {
        return !value || value <= this.weekendPrice;
      },
      message: 'Discounted price must be less than or equal to regular price'
    }
  },
  priceReductionPerRoom: {
    type: Number,
    min: [0, 'Price reduction cannot be negative'],
    default: 2000,
    required: [true, 'Price reduction per room is required']
  },
  maxGuests: {
    type: Number,
    required: true,
    default: 6
  },
  bedrooms: {
    type: Number,
    required: [true, 'Number of bedrooms is required'],
    min: [1, 'Must have at least 1 bedroom']
  },
  minRooms: {
    type: Number,
    required: [true, 'Minimum number of rooms is required'],
    min: [1, 'Must have at least 1 minimum room'],
    validate: {
      validator: function(value) {
        return value <= this.bedrooms;
      },
      message: 'Minimum rooms cannot be greater than total bedrooms'
    },
    default: 1
  },
  bathrooms: {
    type: Number,
    required: true,
    default: 3
  },
  bankDetails: [bankDetailsSchema],
  promptPay: promptPaySchema,
  backgroundImage: {
    type: String
  },
  slideImages: [{
    type: String
  }],
  rooms: [roomSchema],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create a default villa if none exists
villaSchema.statics.ensureDefaultVilla = async function() {
  const count = await this.countDocuments();
  if (count === 0) {
    const defaultVilla = new this({
      name: {
        en: 'Luxury Beach Villa',
        th: 'วิลล่าหรูริมทะเล'
      },
      title: {
        en: 'Beachfront Paradise',
        th: 'สวรรค์ริมทะเล'
      },
      description: {
        en: 'Experience luxury living by the beach',
        th: 'สัมผัสประสบการณ์การพักผ่อนสุดหรูริมทะเล'
      },
      address: {
        en: '123 Beach Road',
        th: '123 ถนนริมทะเล'
      },
      weekdayPrice: 5000,
      weekendPrice: 6000,
      priceReductionPerRoom: 2000,
      maxGuests: 6,
      bedrooms: 3,
      bathrooms: 3,
      minRooms: 1,
      bankDetails: [
        {
          bank: 'Kasikorn Bank (KBank)',
          accountNumber: 'xxx-x-xxxxx-x',
          accountName: 'Your Company Name Co., Ltd.'
        }
      ]
    });
    await defaultVilla.save();
  }
};

const Villa = mongoose.model('Villa', villaSchema);

// Ensure a default villa exists
Villa.ensureDefaultVilla().catch(console.error);

export default Villa;
