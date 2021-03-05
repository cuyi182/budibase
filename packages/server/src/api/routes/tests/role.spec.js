const { BUILTIN_ROLE_IDS } = require("../../../utilities/security/roles")
const {
  BUILTIN_PERMISSION_IDS,
} = require("../../../utilities/security/permissions")
const { basicRole } = require("./utilities/structures")
const setup = require("./utilities")

describe("/roles", () => {
  let request = setup.getRequest()
  let config = setup.getConfig()

  afterAll(setup.afterAll)

  beforeEach(async () => {
    await config.init()
  })

  describe("create", () => {
    it("returns a success message when role is successfully created", async () => {
      const res = await request
        .post(`/api/roles`)
        .send(basicRole())
        .set(config.defaultHeaders())
        .expect("Content-Type", /json/)
        .expect(200)

      expect(res.res.statusMessage).toEqual(
        "Role 'NewRole' created successfully."
      )
      expect(res.body._id).toBeDefined()
      expect(res.body._rev).toBeDefined()
    })
  })

  describe("fetch", () => {
    it("should list custom roles, plus 2 default roles", async () => {
      const createRes = await request
        .post(`/api/roles`)
        .send(basicRole())
        .set(config.defaultHeaders())
        .expect("Content-Type", /json/)
        .expect(200)

      const customRole = createRes.body

      const res = await request
        .get(`/api/roles`)
        .set(config.defaultHeaders())
        .expect("Content-Type", /json/)
        .expect(200)

      expect(res.body.length).toBe(5)

      const adminRole = res.body.find(r => r._id === BUILTIN_ROLE_IDS.ADMIN)
      expect(adminRole).toBeDefined()
      expect(adminRole.inherits).toEqual(BUILTIN_ROLE_IDS.POWER)
      expect(adminRole.permissionId).toEqual(BUILTIN_PERMISSION_IDS.ADMIN)

      const powerUserRole = res.body.find(r => r._id === BUILTIN_ROLE_IDS.POWER)
      expect(powerUserRole).toBeDefined()
      expect(powerUserRole.inherits).toEqual(BUILTIN_ROLE_IDS.BASIC)
      expect(powerUserRole.permissionId).toEqual(BUILTIN_PERMISSION_IDS.POWER)

      const customRoleFetched = res.body.find(r => r._id === customRole._id)
      expect(customRoleFetched).toBeDefined()
      expect(customRoleFetched.inherits).toEqual(BUILTIN_ROLE_IDS.BASIC)
      expect(customRoleFetched.permissionId).toEqual(
        BUILTIN_PERMISSION_IDS.READ_ONLY
      )
    })
  })

  describe("destroy", () => {
    it("should delete custom roles", async () => {
      const createRes = await request
        .post(`/api/roles`)
        .send({ name: "user", permissionId: BUILTIN_PERMISSION_IDS.READ_ONLY })
        .set(config.defaultHeaders())
        .expect("Content-Type", /json/)
        .expect(200)

      const customRole = createRes.body

      await request
        .delete(`/api/roles/${customRole._id}/${customRole._rev}`)
        .set(config.defaultHeaders())
        .expect(200)

      await request
        .get(`/api/roles/${customRole._id}`)
        .set(config.defaultHeaders())
        .expect(404)
    })
  })
})
