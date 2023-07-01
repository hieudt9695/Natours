const lodash = require('lodash');

class APIFeature {
  constructor(query, requestQuery, queryKeys) {
    this.query = query;
    this.requestQuery = requestQuery;
    this.queryKeys = queryKeys;
  }

  filter() {
    let queryObj = {};

    this.queryKeys.forEach((key) => {
      queryObj[key] = this.requestQuery[key];
    });

    const queryStr = JSON.stringify(queryObj);
    queryObj = JSON.parse(
      queryStr.replace(/\b(gt|gte|lt|lte|regex)\b/g, (match) => `$${match}`)
    );

    Object.keys(queryObj).forEach((key) => {
      const value = lodash.get(queryObj[key], '$regex');
      lodash.set(queryObj[key], '$regex', new RegExp(value, 'i'));
    });

    this.query.find(queryObj);
    return this;
  }

  sort() {
    if (this.requestQuery.sort) {
      const sortBy = this.requestQuery.sort.split(',').join(' ');
      // sortBy = '-price -ratingsAverage'
      this.query.sort(sortBy);
    }
    return this;
  }

  fieldLimit() {
    // Field limiting
    if (this.requestQuery.fields) {
      console.log(this.requestQuery.fields);
      const selectBy = this.requestQuery.fields.split(',').join(' ');
      // selectBy = "name price difficulty"
      this.query.select(selectBy);
    } else {
      // query.select('-imageCover');
    }

    return this;
  }

  paginate() {
    const page = this.requestQuery.page * 1 || 1;
    const limit = this.requestQuery.limit * 1 || 25;

    const skip = (page - 1) * limit;
    this.query.skip(skip).limit(limit);
    return this;
  }

  exec() {
    return this.query;
  }
}

module.exports = APIFeature;
