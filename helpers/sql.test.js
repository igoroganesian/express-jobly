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

    //TODO: why do we need an anonymous function here?
    expect(()=>(sqlForPartialUpdate({},{firstName:"Joel"})))
      .toThrow(new BadRequestError("No data"));
  })

});


//empty dataToUpdate throws an error
  //call function with empty dataToUpdate
  //expect toThrow BadRequestError "No data"
//success: jsToSql is missing should still use keys from dataToUpdate
  //create dataToUpdate obj with good data
  //call function with only dataToUpdate arg
  //expect result