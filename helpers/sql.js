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
      //TODO: better example of first obj
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

/**Helper function that allows us to build WHERE clause(s) for filtering
 * companies.
 *
 * Accepts an object with any or all of the keys below:
 *  Input: {
      minEmployees: 2,
      maxEmployees: 5,
      nameLike: "off"
    }
 *
 * Returns:
 *  {
 *    fullWhereStatement:
 *      "name ILIKE $1 AND
 *       num_employees >= $2 AND
 *       num_employees <= $3",
 *    values:[ '%off%', 2, 5 ]
 *  }
*/

//TODO: naming: more specific to match route, currently only for companies
function sqlForFindByQuery(searchQueries) {
  if (searchQueries === undefined) throw new BadRequestError(
    "No queries provided"
  );

  const queryKeys = Object.keys(searchQueries);
  const queryValues = Object.values(searchQueries);

  const values = [];
  const whereClauses = ["WHERE "];

  //TODO: can check obj keys and adjust by length ie if .min etc.

  //generate SQL clause for each type of filter
  for (let i = 0; i < queryKeys.length; i++) {
    if (queryKeys[i] === "minEmployees") {
      whereClauses.push(`num_employees >= $${i + 1}`);
      values.push(queryValues[i]);
    } else if (queryKeys[i] === "maxEmployees") {
      whereClauses.push(`num_employees <= $${i + 1}`);
      values.push(queryValues[i]);
    } else {
      whereClauses.push(`name ILIKE $${i + 1}`);
      values.push(`%${queryValues[i]}%`);
    }

    //add AND if this is not the last filter
    if (i !== (queryKeys.length - 1)) {
      whereClauses.push(" AND ");
    }
  }

  const fullWhereStatement = whereClauses.join("");

  return { fullWhereStatement, values };
}



module.exports = { sqlForPartialUpdate, sqlForFindByQuery };

