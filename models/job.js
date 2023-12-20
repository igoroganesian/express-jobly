
"use strict";
const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate, sqlForFindByQuery } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * Accepts { title, salary, equity, companyHandle }
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws BadRequestError if job already in database.
   * */


  static async create({ title, salary, equity, companyHandle }) {

    //make sure companyHandle finds a match
    const companyHandleCheck = await db.query(`
        SELECT handle
        FROM companies
        WHERE handle =$1`,
      [companyHandle]);
    const company = companyHandleCheck.rows[0];

    if (!company) {
      throw new BadRequestError(
        `No company exists with handle ${companyHandle}`
      );
    }

    const result = await db.query(`
                  INSERT INTO jobs (title,
                                    salary,
                                    equity,
                                    company_handle)
                  VALUES ($1, $2, $3, $4)
                  RETURNING
                      id,
                      title,
                      salary,
                      equity,
                      company_handle AS "companyHandle"
                  `, [
      title,
      salary,
      equity,
      companyHandle,
    ],
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all jobs.
   *
   * Returns [{ title, salary, equity, companyHandle }, ...]
   * */

  static async findAll() {

    let result = await db.query(
      `SELECT title,
                salary,
                equity,
                company_handle AS "companyHandle"
         FROM jobs
         ORDER BY company_handle
        `);

    return result.rows;
  }

  /** Given a job id, return data about job.
   *
   * Returns { title, salary, equity, companyHandle }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const jobRes = await db.query(`
        SELECT title,
               salary,
               equity,
               company_handle AS "companyHandle"
        FROM jobs
        WHERE id = $1`, [id]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Update job data with `data` (partial).
     *
     * Data can include: { title, salary, equity }
     *
     * Returns { id, title, salary, equity, companyHandle}
     *
     * Throws NotFoundError if not found.
     */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {});
    const idVarIdx = "$" + (values.length + 1);
    const companyHandleIdx = "$" + (values.length + 1);
    id = Number(id);

    const querySql = `
      UPDATE jobs
      SET ${setCols}
      WHERE id = ${idVarIdx}
      RETURNING
          id,
          title,
          salary,
          equity,
          company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No company: ${id}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(id) {
    const result = await db.query(
        `DELETE
         FROM jobs
         WHERE id = $1
         RETURNING id`, [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);
  }
}

module.exports = Job;