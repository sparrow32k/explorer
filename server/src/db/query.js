import { Op } from 'sequelize';

const MAX_PAGINATION_COUNT = 100;

const toPagination = (option) => {
  let { from, limit, to } = option;
  from = +from;
  to = +to;
  limit = +limit;
  if (!from) {
    from = 0;
  }
  if (limit) {
    if (to) {
      console.log('limit is ignored'); // eslint-disable-line no-console
    } else {
      limit = Math.min(limit, MAX_PAGINATION_COUNT);
    }
  } else if (!to) {
    to = from + MAX_PAGINATION_COUNT - 1;
  }
  if (to) {
    if (to < from) {
      console.log('to must not be smaller than from. set default count'); // eslint-disable-line no-console
      to = from + MAX_PAGINATION_COUNT - 1; // eslint-disable-line no-param-reassign
    }
    limit = to - from + 1;
  }
  return { offset: from, limit, to };
};

export const listQuery = ({ // eslint-disable-line import/prefer-default-export, max-len
  from, limit, q, to,
}, searchColumns) => {
  const param = {
    ...toPagination({ from, limit, to }),
  };

  // where (= search, handle q)
  if (q) {
    const where = [];
    if (+q) {
      where.push({ id: +q });
    }
    if (searchColumns) {
      searchColumns.forEach((col) => {
        if (col.type.constructor.key === 'INTEGER') {
          if (+q) {
            where.push({ [col.fieldName]: +q });
          }
        } else {
          where.push({ [col.fieldName]: { [Op.like]: `%${q}%` } });
        }
      });
    }

    param.where = { [Op.or]: where };
  }
  // ordering
  param.order = [['id', 'DESC']];

  return param;
};
