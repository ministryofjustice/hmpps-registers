import type { Request, Response } from 'express'
import HMPPSAgencyRegisterApi from '../../services/hmppsAgencyRegisterApi'
import PoliceCustodySuiteRegisterController from './policeCustodySuiteRegisterController'
import HmppsAuthClient from '../../data/hmppsAuthClient'
import data from '../testutils/mockPoliceCustodySuiteData'

jest.mock('../../services/hmppsAgencyRegisterApi')

describe('Police Custody Suite Register controller', () => {
  let hmppsAgencyRegisterApiService: jest.Mocked<HMPPSAgencyRegisterApi>
  let controller: PoliceCustodySuiteRegisterController
  let req: Request
  let res: Response

  beforeEach(() => {
    hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(
      {} as HmppsAuthClient,
    ) as jest.Mocked<HMPPSAgencyRegisterApi>
    controller = new PoliceCustodySuiteRegisterController(hmppsAgencyRegisterApiService)
    req = {
      query: {},
      session: {},
      flash: jest.fn(),
    } as unknown as Request
    res = {
      locals: {},
      render: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Response
  })

  afterEach(jest.resetAllMocks)

  describe('showAllPoliceCustodySuites', () => {
    beforeEach(() => {
      hmppsAgencyRegisterApiService.getPoliceCustodySuites.mockResolvedValue([
        data.policeCustodySuite({ policeCustodySuiteId: 'SHFPCS' }),
      ])
    })

    it('will render all police custody suites page with police custody suites', async () => {
      res.locals.user = {
        username: 'tom',
      }
      await controller.showAllPoliceCustodySuites(req, res)

      expect(hmppsAgencyRegisterApiService.getPoliceCustodySuites).toHaveBeenCalledWith({ username: 'tom' }, {})
      expect(res.render).toHaveBeenCalledWith(
        'pages/police-custody-suite-register/allPoliceCustodySuites',
        expect.objectContaining({
          policeCustodySuites: [expect.objectContaining({ id: 'SHFPCS' })],
        }),
      )
    })

    it('will call register service with no filter params', async () => {
      await controller.showAllPoliceCustodySuites(req, res)

      expect(hmppsAgencyRegisterApiService.getPoliceCustodySuites).toHaveBeenCalledWith({}, {})
    })

    it('will call register service with active filter param', async () => {
      req.query.active = 'false'

      await controller.showAllPoliceCustodySuites(req, res)

      expect(hmppsAgencyRegisterApiService.getPoliceCustodySuites).toHaveBeenCalledWith({}, { active: false })
    })

    it('will call register service with textSearch filter param', async () => {
      req.query.textSearch = 'Sheffield'

      await controller.showAllPoliceCustodySuites(req, res)

      expect(hmppsAgencyRegisterApiService.getPoliceCustodySuites).toHaveBeenCalledWith({}, { textSearch: 'Sheffield' })
    })

    it('will ignore unsupported filter params', async () => {
      req.query.highSecurity = 'true'

      await controller.showAllPoliceCustodySuites(req, res)

      expect(hmppsAgencyRegisterApiService.getPoliceCustodySuites).toHaveBeenCalledWith({}, {})
    })

    it('will set the list page link in the session', async () => {
      await controller.showAllPoliceCustodySuites(req, res)

      expect(req.session.allListPageLink).toEqual('/police-custody-suite-register')
    })
  })

  describe('viewPoliceCustodySuite', () => {
    beforeEach(() => {
      hmppsAgencyRegisterApiService.getPoliceCustodySuite.mockResolvedValue(
        data.policeCustodySuite({ policeCustodySuiteId: 'SHFPCS' }),
      )
      req.query.id = 'SHFPCS'
    })

    it('will render police custody suite page with police custody suite', async () => {
      res.locals.user = {
        username: 'tom',
      }
      await controller.viewPoliceCustodySuite(req, res)

      expect(hmppsAgencyRegisterApiService.getPoliceCustodySuite).toHaveBeenCalledWith({ username: 'tom' }, 'SHFPCS')
      expect(res.render).toHaveBeenCalledWith(
        'pages/police-custody-suite-register/policeCustodySuiteDetails',
        expect.objectContaining({
          policeCustodySuite: expect.objectContaining({ policeCustodySuiteId: 'SHFPCS' }),
        }),
      )
    })

    it('will call register service with police custody suite Id parameter', async () => {
      await controller.viewPoliceCustodySuite(req, res)

      expect(hmppsAgencyRegisterApiService.getPoliceCustodySuite).toHaveBeenCalledWith({}, 'SHFPCS')
    })
  })

  describe('updates', () => {
    beforeEach(() => {
      hmppsAgencyRegisterApiService.getPoliceCustodySuite.mockResolvedValue(
        data.policeCustodySuite({
          policeCustodySuiteId: 'SHFPCS',
          cjitCode: 'C00SH00',
          area: { code: 'SY', description: 'South Yorkshire' },
          emailAddresses: [{ id: 3, address: 'a@b.com' }],
        }),
      )
      hmppsAgencyRegisterApiService.updatePoliceCustodySuiteDetails.mockResolvedValue({ success: true })
      req.query.id = 'SHFPCS'
      ;(req.flash as jest.Mock).mockReturnValue([])
    })

    it('saves a name change while keeping the other fields', async () => {
      req.body = { name: 'New name', description: 'New description' }

      await controller.submitUpdateNameDescription(req, res)

      expect(hmppsAgencyRegisterApiService.updatePoliceCustodySuiteDetails).toHaveBeenCalledWith({}, 'SHFPCS', {
        policeCustodySuiteName: 'New name',
        description: 'New description',
        active: true,
        inactiveDate: undefined,
        cjitCode: 'C00SH00',
        areaCode: 'SY',
        regionCode: 'YH',
        geographicalAreaCode: 'YH',
        localAuthorityCode: 'YH',
        payrollRegionCode: 'YH',
      })
      expect(res.redirect).toHaveBeenCalledWith('/police-custody-suite-register/details?id=SHFPCS&action=UPDATED')
    })

    it('prefills the email update page from the existing email address', async () => {
      req.query.emailId = '3'

      await controller.updateEmail(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'pages/components/edit/updateAgencyEmail',
        expect.objectContaining({ emailAddress: 'a@b.com', emailId: 3 }),
      )
    })

    it('adds an email address and returns to the details page', async () => {
      hmppsAgencyRegisterApiService.addPoliceCustodySuiteEmailAddress.mockResolvedValue({ success: true })
      req.body = { emailAddress: 'new@b.com' }

      await controller.submitAddEmail(req, res)

      expect(hmppsAgencyRegisterApiService.addPoliceCustodySuiteEmailAddress).toHaveBeenCalledWith({}, 'SHFPCS', {
        address: 'new@b.com',
      })
      expect(res.redirect).toHaveBeenCalledWith('/police-custody-suite-register/details?id=SHFPCS&action=UPDATED')
    })

    it('deletes only the selected email address', async () => {
      req.body = { emailId: '3' }

      await controller.submitDeleteEmail(req, res)

      expect(hmppsAgencyRegisterApiService.deletePoliceCustodySuiteEmailAddress).toHaveBeenCalledWith({}, 'SHFPCS', 3)
      expect(res.redirect).toHaveBeenCalledWith('/police-custody-suite-register/details?id=SHFPCS&action=UPDATED')
    })
  })
})
