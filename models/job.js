// CREATE TABLE jobs (
//   id SERIAL PRIMARY KEY***,
//   title TEXT NOT NULL,
//   salary INTEGER CHECK (salary >= 0),
//   equity NUMERIC CHECK (equity <= 1.0),
//   company_handle VARCHAR(25) NOT NULL
//     REFERENCES companies ON DELETE CASCADE***
// );

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity } ??
   *
   * Returns { id, title, salary, equity, company_handle } ??
   *
   * Throws BadRequestError if job already in database.
   * */

  //Updating a job should never change the ID of a job, nor the company associated with a job.