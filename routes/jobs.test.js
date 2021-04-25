"use strict"

const request = require('supertest');
const app = require('../app');

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    testJobIds,
    u1Token,
    adminToken
} = require('./_testCommon');

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */
describe("POST /jobs", () => {
    test("works for admin", async () => {
        const resp = await request(app)
                    .post("/jobs")
                    .send({
                        companyHandle: "c1",
                        title: "J-new",
                        salary: 10,
                        equity: "0.2"
                    })
                    .set("authorization", `Bearer ${adminToken}`);

        // expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({
            job: {
                id: expect.any(Number),
                title: "J-new",
                salary: 10,
                equity: "0.2",
                companyHandle: "c1"
            }
        });
    });

    test("unauth for users", async () => {
        const resp = await request(app)
                    .post('/jobs')
                    .send({
                        companyHandle: "c1",
                        title: "J-new",
                        salary: 10,
                        equity: "0.2"
                    })
                    .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(401);
    });

    test("bad request with missing data", async () => {
        const resp = await request(app)
                    .post('/jobs')
                    .send({
                        companyHandle: "c1",
                    })
                    .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(400);
    });

    test("bad request with invalid data", async () => {
        const resp = await request(app)
                    .post('/jobs')
                    .send({
                        companyHandle: "c1",
                        title: "J-new",
                        salary: "not-a-number",
                        equity: "0.2"                    })
                    .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(400);
    });
});

// /************************************** GET /jobs */

describe("Get / jobs", () => {
    test("works for anon", async () => {
        const resp = await request(app).get("/jobs");
        expect(resp.body).toEqual({
          jobs: [
            {
              id: expect.any(Number),
              title: "J1",
              salary: 1,
              equity: "0.1",
              companyHandle: "c1",
              companyName: "C1",
            },
            {
              id: expect.any(Number),
              title: "J2",
              salary: 2,
              equity: "0.2",
              companyHandle: "c1",
              companyName: "C1",
            },
            {
              id: expect.any(Number),
              title: "J3",
              salary: 3,
              equity: null,
              companyHandle: "c1",
              companyName: "C1",
            },
          ],
        });
    });

    test("works: filtering", async () => {
        const resp = await request(app)
                    .get("/jobs")
                    .query({hasEquity: true});
        expect(resp.body).toEqual({
          jobs: [
            {
              id: expect.any(Number),
              title: "J1",
              salary: 1,
              equity: "0.1",
              companyHandle: "c1",
              companyName: "C1",
            },
            {
              id: expect.any(Number),
              title: "J2",
              salary: 2,
              equity: "0.2",
              companyHandle: "c1",
              companyName: "C1",
            },
          ],
        });
    });

    test("works: filtering on 2 filters", async () => {
        const resp = await request(app)
                        .get('/jobs')
                        .query({minSalary: 2, title: "3"});

        expect(resp.body).toEqual({
            jobs: [
                {
                id: expect.any(Number),
                title: "J3",
                salary: 3,
                equity: null,
                companyHandle: "c1",
                companyName: "C1",
                },
            ],
        });
    });

    test("bad request on invalid filter key", async () => {
        const resp = await request(app)
                            .get('/jobs')
                            .query({minSalary: 2, nope: "nope"});
        expect(resp.statusCode).toEqual(400);
    });
});

// /************************************** GET /jobs/:id */

describe("GET /jobs/:id", () => {
    test("works for anon", async () => {
        const resp = await request(app).get(`/jobs/${testJobIds[0]}`);
        expect(resp.body).toEqual({
            job: {
                id: testJobIds[0],
                title: "J1",
                salary: 1,
                equity: "0.1",
                company: {
                    handle: "c1",
                    name: "C1",
                    description: "Desc1",
                    numEmployees: 1,
                    logoUrl: "http://c1.img",
                },
            },
        });
    });

    test("not found for no such job", async () => {
        const resp = await request(app).get(`/jobs/999`);
        expect(resp.statusCode).toEqual(404);
    });
});

// /************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .patch(`/jobs/${testJobIds[0]}`)
        .send({
          title: "J-New",
        })
        .set("authorization", `Bearer ${adminToken}`);

    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "J-New",
        salary: 1,
        equity: "0.1",
        companyHandle: "c1",
      },
    });
  });

  test("unauth for others", async function () {
    const resp = await request(app)
        .patch(`/jobs/${testJobIds[0]}`)
        .send({
          title: "J-New",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such job", async function () {
    const resp = await request(app)
        .patch(`/jobs/0`)
        .send({
          handle: "new",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on handle change attempt", async function () {
    const resp = await request(app)
        .patch(`/jobs/${testJobIds[0]}`)
        .send({
          handle: "new",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .patch(`/jobs/${testJobIds[0]}`)
        .send({
          salary: "not-a-number",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

// /************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .delete(`/jobs/${testJobIds[0]}`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: testJobIds[0] });
  });

  test("unauth for others", async function () {
    const resp = await request(app)
        .delete(`/jobs/${testJobIds[0]}`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .delete(`/jobs/${testJobIds[0]}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
        .delete(`/jobs/99999`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});
