"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(`
        SELECT handle
        FROM companies
        WHERE handle = $1`, [handle]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(`
                INSERT INTO companies (handle,
                                       name,
                                       description,
                                       num_employees,
                                       logo_url)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING
                    handle,
                    name,
                    description,
                    num_employees AS "numEmployees",
                    logo_url AS "logoUrl"`, [
      handle,
      name,
      description,
      numEmployees,
      logoUrl,
    ],
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all companies.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findAll(searchQueries) {
    const companiesRes = await db.query(`
        SELECT handle,
               name,
               description,
               num_employees AS "numEmployees",
               logo_url      AS "logoUrl"
        FROM companies
        ORDER BY name`);
    return companiesRes.rows;
  }

  /** Accepts a searchQuery including any of the following keys:
   * {minEmployees, maxEmployees, name}
   *
   * Returns a list of companies that match the search criteria:
   *  [{ handle, name, description, numEmployees, logoUrl }, ...]*/

  static async findByQuery(searchQueries) {

    const queryKeys = Object.keys(searchQueries);
    const queryValues = Object.values(searchQueries);
    console.log(`keys: ${queryKeys}`);
    console.log(`searchQueries.minEmployees: ${searchQueries.minEmployees > searchQueries.maxEmployees}`);

    //validate min > max
    if (searchQueries.minEmployees > searchQueries.maxEmployees){
      console.log(`MIN: ${searchQueries.minEmployees}, MAX: ${searchQueries.maxEmployees}`);
      throw new BadRequestError("maxEmployees must be greater than minEmployees");
    }

    const values = [];
    const whereClauses = [];

    // console.log(`searchQueries: ${searchQueries}`);

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
      // console.log(`reached line 104`);

      // console.log(`reached line 108 (pushed to ${values})`);

      //add AND if this is not the last filter
      if (i !== (queryKeys.length - 1)){
        // console.log(`entered keys.length check`);
        whereClauses.push(" AND ");
        // console.log(`pushed AND to whereClauses`);
      }
      console.log(`passed push to WHERE`);
    }

    console.log(`values: ${values}, whereClauses: ${whereClauses}`);
    console.log(`values spread: ${[...values]}`);

    const fullWhereStatement = whereClauses.join("");

    console.log(`fullWhereStatement: ${fullWhereStatement}`);

    const companiesRes = await db.query(`
        SELECT handle,
                name,
                description,
                num_employees AS "numEmployees",
                logo_url      AS "logoUrl"
        FROM companies
        WHERE ${fullWhereStatement}
        ORDER BY name`,
        [...values]
        );

    const testStatement = `
    SELECT handle,
            name,
            description,
            num_employees AS "numEmployees",
            logo_url      AS "logoUrl"
    FROM companies
    WHERE ${fullWhereStatement}
    ORDER BY name`;

    console.log(`testStatement: ${testStatement} valuesSpread: ${[...values]}`);

    return companiesRes.rows;
    }


  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(`
        SELECT handle,
               name,
               description,
               num_employees AS "numEmployees",
               logo_url      AS "logoUrl"
        FROM companies
        WHERE handle = $1`, [handle]);

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(
      data,
      {
        numEmployees: "num_employees",
        logoUrl: "logo_url",
      });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `
        UPDATE companies
        SET ${setCols}
        WHERE handle = ${handleVarIdx}
        RETURNING
            handle,
            name,
            description,
            num_employees AS "numEmployees",
            logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(`
        DELETE
        FROM companies
        WHERE handle = $1
        RETURNING handle`, [handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}


module.exports = Company;




