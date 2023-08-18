"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  jobIds
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("Tests for Job.create", function () {

  test("works", async function () {
    const job = await Job.create({
      title: "CEO",
      salary: 100,
      equity: 0.5,
      companyHandle: "c1"
    });

    expect(job).toEqual({
      id: expect.any(Number),
      title: "CEO",
      salary: 100,
      equity: "0.5",
      companyHandle: "c1"
    });
  });

  test("Should throw error if companyHandle doesn't match a record",
    function () {
      expect(async () =>
        await Job.create({
          title: "CEO",
          salary: 100,
          equity: 0.5,
          companyHandle: "nope"
        })
          .rejects
          .toThrow(new BadRequestError(`No company exists with handle nope`))
      );
    });

});

/************************************** findAll */

describe("Tests for Job.findAll", function () {

  describe("findAll", function () {
    test("works: no filter", async function () {
      let jobs = await Job.findAll();
      expect(jobs).toEqual([
        {
          title: "j1",
          salary: 100,
          equity: "0.11",
          companyHandle: "c1"
        },
        {
          title: "j2",
          salary: 200,
          equity: "0.22",
          companyHandle: "c1"
        },
        {
          title: "j3",
          salary: 300,
          equity: "0.33",
          companyHandle: "c2"
        },
        {
          title: "j4",
          salary: 400,
          equity: "0.44",
          companyHandle: "c2"
        }
      ]);
    });
  });

});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let job = await Job.get(jobIds[0]);
    expect(job).toEqual({
      title: "j1",
      salary: 100,
      equity: "0.11",
      companyHandle: "c1"
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get("nope");
      // throw new Error("test failed [B^[");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });



});