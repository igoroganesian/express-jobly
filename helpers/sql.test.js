"use strict";

const supertest = require("supertest");
const { sqlForPartialUpdate, sqlForFindByQuery } = require("./sql");
const { BadRequestError } = require("../expressError");


describe("Tests for sql.js (sqlForPartialUpdate)", function () {

  test(`sqlForPartialUpdate should return well structured object with
  correct values`, function () {
    //create objects for good args
    //dataToUpdate, jsToSql
    const dataToUpdate = {
      firstName: "Joel",
      lastName: "Burton"
    };

    const jsToSql = {
      firstName: "first_name",
      lastName: "last_name",
    };

    //call function with args
    const resultObj = sqlForPartialUpdate(dataToUpdate, jsToSql);

    //expect good output
    expect(resultObj).toEqual(
      {
        setCols: '"first_name"=$1, "last_name"=$2',
        values: ["Joel", "Burton"],
      });
  });

  test('sqlForPartialUpdate: empty dataToUpdate throws an error', function () {

    expect(() => (sqlForPartialUpdate({}, { firstName: "Joel" })))
      .toThrow(new BadRequestError("No data"));
  });

  test(`sqlForPartialUpdate: empty jsToSql uses dataToUpdate keys to return
  expected object`, function () {
    const dataToUpdate = {
      firstName: "Joel",
      lastName: "Burton"
    };

    const resultObj = sqlForPartialUpdate(dataToUpdate, {});

    expect(resultObj).toEqual(
      {
        setCols: '"firstName"=$1, "lastName"=$2',
        values: ["Joel", "Burton"],
      });
  });

});

// *Input: {
//   minEmployees: (number)
//   maxEmployees: (number)
//   nameLike: (string)
// }
// *
// * Returns {
// *    fullWhereStatement: "num_employees >=2 AND num_employees <= 5"
// *    values:[ 2, 5,...]
// * }
// */

describe("Tests for sql.js (sqlForFindByQuery)", function () {

  test(`sqlForFindByQuery should return well structured object with
  correct values (works with minEmployees & maxEmployees)`, function () {
    //create object for good queries

    const queries = {
      minEmployees: 2,
      maxEmployees: 5
    };

    //call function with args
    const resultObj = sqlForFindByQuery(queries);

    //expect good output
    expect(resultObj).toEqual(
      {
        fullWhereStatement: "WHERE num_employees >= $1 AND num_employees <= $2",
        values: [2, 5]
      });
  });

  //TODO: add WHERE to full...

  test(`sqlForFindByQuery should return well structured object with
  correct values (works with all 3 queries)`, function () {
    //create object for good queries

    const queries = {
      nameLike: "off",
      minEmployees: 2,
      maxEmployees: 5
    };

    //call function with args
    const resultObj = sqlForFindByQuery(queries);

    //expect good output
    expect(resultObj).toEqual(
      {
        fullWhereStatement:
        `WHERE name ILIKE $1 AND num_employees >= $2 AND num_employees <= $3`,
        values: [ '%off%', 2, 5 ]
      });
  });

  test('sqlForFindByQuery: empty search throws an error', function () {

    expect(() => (sqlForFindByQuery()))
      .toThrow(new BadRequestError("No queries provided"));
  });

});