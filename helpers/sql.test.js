"use strict";

const supertest = require("supertest");
const { sqlForPartialUpdate } = require("./sql");
const { BadRequestError } = require("../expressError");


describe("Tests for sql.js ", function(){

  test(`sqlForPartialUpdate should return well structured object with
  correct values`, function(){
    //create objects for good args
    //dataToUpdate, jsToSql
    const dataToUpdate = {
      firstName:"Joel",
      lastName:"Burton"
    }

    const jsToSql = {
      firstName: "first_name",
      lastName: "last_name",
    }

    //call function with args
    const resultObj = sqlForPartialUpdate(dataToUpdate,jsToSql);

    //expect good output
    expect(resultObj).toEqual(
      {
        setCols: '"first_name"=$1, "last_name"=$2',
        values: ["Joel", "Burton"],
      })
  })

  test('sqlForPartialUpdate: empty dataToUpdate throws an error', function(){

    expect(()=>(sqlForPartialUpdate({},{firstName:"Joel"})))
      .toThrow(new BadRequestError("No data"));
  })

  //TODO: necessary? requires jsToSql anyway
  test(`sqlForPartialUpdate: empty jsToSql uses dataToUpdate keys to return
  expected object`, function() {
    const dataToUpdate = {
      firstName:"Joel",
      lastName:"Burton"
    }

    const resultObj = sqlForPartialUpdate(dataToUpdate, {});

    expect(resultObj).toEqual(
      {
        setCols: '"firstName"=$1, "lastName"=$2',
        values: ["Joel", "Burton"],
      })
  })

});