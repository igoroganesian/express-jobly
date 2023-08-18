
"use strict";
const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");


class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity } ??
   *
   * Returns { id, title, salary, equity, company_handle } ??
   *
   * Throws BadRequestError if job already in database.
   * */


    static async create({ title, salary, equity, companyHandle }) {

      //make sure companyHandle finds a match
      const companyHandleCheck = await db.query(`
        SELECT handle
        FROM companies
        WHERE handle =$1`,[companyHandle]);

      if (!companyHandleCheck.rows[0]){
        throw new BadRequestError(
          `No company exists with handle ${companyHandle}`
        )
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


  //find all


  //Find by id


  //Update by id
  //Updating a job should never change the ID of a job, nor the company associated with a job.


  //DELETE by id
}

module.exports = Job;

//*********SCHEMA FOR REFERENCE****
// CREATE TABLE jobs (
//   id SERIAL PRIMARY KEY***,
//   title TEXT NOT NULL,
//   salary INTEGER CHECK (salary >= 0),
//   equity NUMERIC CHECK (equity <= 1.0),
//   company_handle VARCHAR(25) NOT NULL
//     REFERENCES companies ON DELETE CASCADE***
// );