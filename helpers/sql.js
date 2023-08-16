"use strict";

const { BadRequestError } = require("../expressError");

/** Helper function that allows us to sanitize an unknown number
 *  of inputs in an sql query
 *
 * Accepts first argument of data object with fields for partial update
 * of a given instance (user/company etc.)
 *
 * Second argument of object containing JS key: value, mapping JS-formatted
 * column names to SQL
 *
 *    ex. {
        firstName: "first_name",
        lastName: "last_name"
      }
 *
 * Returns an object containing:
 *    setCols: a string of formatted SQL ready to be fed into the SET command
 *    for input sanitation
 *    values: a list of values for each column that needs to be updated
 *
 *    ex. {
 *      setCols: '"first_name"=$1, "last_name"=$2',
 *      values: ["Joel", "Burton"]
 *    }
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  console.log("keys length", keys.length);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };


