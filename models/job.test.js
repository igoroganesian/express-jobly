"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("Tests for Job.create", function(){

  test("works", async function(){
    const job = await Job.create({
      title: "CEO",
      salary: 100,
      equity: 0.5,
      companyHandle: "c1"
    })

    expect(job).toEqual({
      id: expect.any(Number),
      title: "CEO",
      salary: 100,
      equity: "0.5",
      companyHandle: "c1"
    })
  })


  test("Should throw error if companyHandle doesn't match a record",
  function(){
    expect( async ()=>
      await Job.create({
        title: "CEO",
        salary: 100,
        equity: 0.5,
        companyHandle: "nope"
      })
      .rejects
      .toThrow( new BadRequestError(`No company exists with handle nope`))
    )

  })
  //should error if company DNE
  //should return { id, title, salary, equity, company_handle } if good
})