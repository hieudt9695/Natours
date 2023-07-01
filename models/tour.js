const mongoose = require('mongoose');
const validator = require('validator');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tour must have name'],
      unique: true,
      maxLength: [30, 'Max is 30'],
      minLength: [10, 'Min is 10'],
      validate: [
        (value) =>
          validator.isAlpha(value, 'en-US', {
            ignore: ' ',
          }),
        'The name must only contain characters',
      ],
    },
    duration: Number,
    maxGroupSize: Number,
    difficulty: {
      type: String,
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Invalid difficulty value',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating should be more than equal 1'],
      max: [5, 'Rating should be less than equal 5'],
    },
    ratingsQuantity: Number,
    price: {
      type: Number,
      validate: {
        validator: function (val) {
          return val > 0;
        },
        message: 'price must > 0',
      },
    },
    summary: String,
    description: String,
    imageCover: String,
    images: [String],
    createdAt: Date,
    startDates: [Date],
    slug: String,
    isSecret: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.post('save', (doc, next) => {
//   console.log(doc);
//   next();
// });

tourSchema.pre(/^find/, function (next) {
  this.find({ isSecret: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (doc, next) {
  console.log(`query took ${Date.now() - this.start} miliseconds`);

  next();
});

tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isSecret: { $ne: true } } });

  next();
});

tourSchema.virtual('durationWeek').get(function () {
  return this.duration / 7;
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
