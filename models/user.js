const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      maxLength: 100,
      validate: [
        {
          validator: (val) =>
            validator.isAlpha(val, 'en-US', {
              ignore: ' ',
            }),
          msg: 'The name must only contain characters',
        },
      ],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      validate: [validator.isEmail, 'Email is invalid!'],
    },
    photo: String,
    password: {
      type: String,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    passwordResetToken: {
      type: String,
      // select: false,
    },
    passwordResetExpires: {
      type: Date,
      // select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

userSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  }
  next();
});

userSchema.virtual('slug').get(function () {
  return `${this.name}-${this.email}`;
});

userSchema.methods.correctPassword = async (loginPassword, userPassword) =>
  await bcrypt.compare(loginPassword, userPassword);

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
