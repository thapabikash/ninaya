const pagination = (
  pageSize,
  pageLimit,
  search = {},
  order = [],
  attributes = [],
  group = [],
  include = [],
  noLimit = false
) => {
  const maxSize = 50;
  let limit = parseInt(pageLimit, 10) || maxSize;
  let page = parseInt(pageSize, 10) || 1;

  // create an options object
  let options = {};
  if (!noLimit) {
    options = {
      offset: getOffset(page, limit),
      limit: limit,
    };
  }

  // check if the search object is empty
  if (Object.keys(search).length) {
    options["where"] = search;
  }
  // check if the order array is empty
  if (order && order.length) {
    options["order"] = order;
  }
  // checking if the attributes array is empty
  if (attributes && attributes.length > 0) {
    options["attributes"] = attributes;
  }
  // checking if the group by array is empty
  if (group && group.length > 0) {
    options["group"] = group;
  }
  // checking if the include array is empty
  if (include && include.length > 0) {
    options["include"] = include;
  }
  options["where"] = search;
  return options;
};

const getOffset = (page, limit) => {
  return page * limit - limit;
};

module.exports = { pagination };
