const request = require("supertest");
const nodemailer = require("nodemailer");

const app = require("../../src/app");
const truncate = require("../utils/truncate");

const factory = require("../factories");

// toda vez que que o jest utilizar o nodemailer ele faz criar um módulo fake
jest.mock("nodemailer");

//objeto que eequivale ao transporter do nodemailer
const trasnport = {
  sendMail: jest.fn() //mock de uma funcao sem resultado, porèm monitoravel
};

describe("Authentication", () => {
  beforeEach(async () => {
    await truncate();
  });

  beforeAll(() => {
    nodemailer.createTransport.mockReturnValue(trasnport);
  });

  it("should be able to authenticate with valid credentials", async () => {
    const user = await factory.create("User", {
      password: "123123"
    });

    const response = await request(app)
      .post("/sessions")
      .send({ email: user.email, password: "123123" });

    expect(response.status).toBe(200);
  });

  it("shoud not be able to authenticate with invalid credentials", async () => {
    const user = await factory.create("User", {
      password: "1111 "
    });

    const response = await request(app)
      .post("/sessions")
      .send({ email: user.email, password: "123456" });

    expect(response.status).toBe(401);
  });

  it("should return jwt token when authenticated", async () => {
    const user = await factory.create("User", {
      password: "123123"
    });

    const response = await request(app)
      .post("/sessions")
      .send({ email: user.email, password: "123123" });

    expect(response.body).toHaveProperty("token");
  });

  it("should be able to access private routes when authenticated", async () => {
    const user = await factory.create("User");

    const response = await request(app)
      .get("/dashboard")
      .set("Authorization", `Bearer ${user.generateToken()}`);

    expect(response.status).toBe(200);
  });

  it("should not be able to access private routes when not authenticated", async () => {
    const response = await request(app).get("/dashboard");

    expect(response.status).toBe(401);
  });
  it("should not be able to access private routes when not authenticated", async () => {
    const response = await request(app)
      .get("/dashboard")
      .set("Authorization", "Bearer 123123");
    expect(response.status).toBe(401);
  });
  it("should receive email notificantion when authenticated", async () => {
    const user = await factory.create("User", {
      password: "123123"
    });

    const response = await request(app)
      .post("/sessions")
      .send({ email: user.email, password: "123123" });

    expect(trasnport.sendMail).toHaveBeenCalledTimes(1);
  });
});
