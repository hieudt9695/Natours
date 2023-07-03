const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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

userSchema.methods.correctPassword = async (loginPassword, userPassword) => {
  console.log(
    loginPassword,
    userPassword,
    await bcrypt.compare(loginPassword, userPassword)
  );
  return await bcrypt.compare(loginPassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
