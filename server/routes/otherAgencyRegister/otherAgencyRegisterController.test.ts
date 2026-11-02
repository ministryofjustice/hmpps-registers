import type { Request, Response } from 'express'
import HMPPSAgencyRegisterApi from '../../services/hmppsAgencyRegisterApi'
import OtherAgencyRegisterController from './otherAgencyRegisterController'
import HmppsAuthClient from '../../data/hmppsAuthClient'
import data from '../testutils/mockOtherAgencyData'

jest.mock('../../services/hmppsAgencyRegisterApi')

describe('Other Agency Register controller', () => {
  let hmppsAgencyRegisterApiService: jest.Mocked<HMPPSAgencyRegisterApi>
  let controller: OtherAgencyRegisterController
  let req = {
    query: {},
    session: {},
    flash: jest.fn(),
  } as unknown as Request
  let res = {
    locals: {},
    render: jest.fn(),
    redirect: jest.fn(),
  } as unknown as Response

  beforeEach(() => {
    hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(
      {} as HmppsAuthClient,
    ) as jest.Mocked<HMPPSAgencyRegisterApi>
    controller = new OtherAgencyRegisterController(hmppsAgencyRegisterApiService)
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

  describe('showAllOtherAgencies', () => {
    beforeEach(() => {
      hmppsAgencyRegisterApiService.getOtherAgencies.mockResolvedValue([data.otherAgency({ agencyId: 'SHFPECS' })])
    })

    it('will render all other agencies page with other agencies', async () => {
      res.locals.user = {
        username: 'tom',
      }
      await controller.showAllOtherAgencies(req, res)

      expect(hmppsAgencyRegisterApiService.getOtherAgencies).toHaveBeenCalledWith({ username: 'tom' }, {})
      expect(res.render).toHaveBeenCalledWith(
        'pages/other-agency-register/allOtherAgencies',
        expect.objectContaining({
          otherAgencies: [expect.objectContaining({ id: 'SHFPECS' })],
        }),
      )
    })

    it('it will call register service with no filter params', async () => {
      await controller.showAllOtherAgencies(req, res)

      expect(hmppsAgencyRegisterApiService.getOtherAgencies).toHaveBeenCalledWith({}, {})
    })

    it('it will call register service with active filter param', async () => {
      req.query.active = 'true'

      await controller.showAllOtherAgencies(req, res)

      expect(hmppsAgencyRegisterApiService.getOtherAgencies).toHaveBeenCalledWith({}, { active: true })
    })

    it('it will call register service with textSearch filter param', async () => {
      req.query.textSearch = 'Sheffield'

      await controller.showAllOtherAgencies(req, res)

      expect(hmppsAgencyRegisterApiService.getOtherAgencies).toHaveBeenCalledWith({}, { textSearch: 'Sheffield' })
    })

    it('it will call register service with type filter param', async () => {
      req.query.otherAgencyTypeCodes = ['PECS', 'AIRPORT']

      await controller.showAllOtherAgencies(req, res)

      expect(hmppsAgencyRegisterApiService.getOtherAgencies).toHaveBeenCalledWith(
        {},
        { otherAgencyTypeCodes: ['PECS', 'AIRPORT'] },
      )
    })

    it('will set the list page link in the session', async () => {
      const reqWithQueryParms = {
        query: {},
        session: {},
        flash: jest.fn(),
      } as unknown as Request
      await controller.showAllOtherAgencies(reqWithQueryParms, res)
      expect(reqWithQueryParms.session.allListPageLink).toEqual('/other-agency-register')
    })
  })

  describe('viewOtherAgency', () => {
    beforeEach(() => {
      hmppsAgencyRegisterApiService.getOtherAgency.mockResolvedValue(data.otherAgency({ agencyId: 'SHFPECS' }))
      req.query.id = 'SHFPECS'
    })

    it('will render other agency page with other agency', async () => {
      res.locals.user = {
        username: 'tom',
      }
      await controller.viewOtherAgency(req, res)

      expect(hmppsAgencyRegisterApiService.getOtherAgency).toHaveBeenCalledWith({ username: 'tom' }, 'SHFPECS')
      expect(res.render).toHaveBeenCalledWith(
        'pages/other-agency-register/otherAgencyDetails',
        expect.objectContaining({
          otherAgency: expect.objectContaining({ agencyId: 'SHFPECS' }),
        }),
      )
    })

    it('it will call register service with agency Id parameter', async () => {
      await controller.viewOtherAgency(req, res)

      expect(hmppsAgencyRegisterApiService.getOtherAgency).toHaveBeenCalledWith({}, 'SHFPECS')
    })
  })

  describe('updates', () => {
    beforeEach(() => {
      hmppsAgencyRegisterApiService.getOtherAgency.mockResolvedValue(
        data.otherAgency({
          agencyId: 'SHFPECS',
          cjitCode: 'C00SH00',
          area: { code: 'SY', description: 'South Yorkshire' },
          emailAddresses: [{ id: 3, address: 'a@b.com' }],
        }),
      )
      hmppsAgencyRegisterApiService.updateOtherAgencyDetails.mockResolvedValue({ success: true })
      req.query.id = 'SHFPECS'
      ;(req.flash as jest.Mock).mockReturnValue([])
    })

    it('saves a name change while keeping the other fields', async () => {
      req.body = { name: 'New name', description: 'New description' }

      await controller.submitUpdateNameDescription(req, res)

      expect(hmppsAgencyRegisterApiService.updateOtherAgencyDetails).toHaveBeenCalledWith({}, 'SHFPECS', {
        agencyName: 'New name',
        description: 'New description',
        active: true,
        accessibleAccess: 'NONE',
        otherAgencyType: 'PECS',
        inactiveDate: undefined,
        cjitCode: 'C00SH00',
        areaCode: 'SY',
        regionCode: 'YH',
        geographicalAreaCode: 'YH',
        localAuthorityCode: 'YH',
        payrollRegionCode: 'YH',
      })
      expect(res.redirect).toHaveBeenCalledWith('/other-agency-register/details?id=SHFPECS&action=UPDATED')
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
      hmppsAgencyRegisterApiService.addOtherAgencyEmailAddress.mockResolvedValue({ success: true })
      req.body = { emailAddress: 'new@b.com' }

      await controller.submitAddEmail(req, res)

      expect(hmppsAgencyRegisterApiService.addOtherAgencyEmailAddress).toHaveBeenCalledWith({}, 'SHFPECS', {
        address: 'new@b.com',
      })
      expect(res.redirect).toHaveBeenCalledWith('/other-agency-register/details?id=SHFPECS&action=UPDATED')
    })

    it('saves an agency type change while keeping the other fields', async () => {
      req.body = { agencyType: 'AIRPORT' }

      await controller.submitUpdateAgencyType(req, res)

      expect(hmppsAgencyRegisterApiService.updateOtherAgencyDetails).toHaveBeenCalledWith(
        {},
        'SHFPECS',
        expect.objectContaining({ otherAgencyType: 'AIRPORT', agencyName: 'Sheffield PECS Agency' }),
      )
      expect(res.redirect).toHaveBeenCalledWith('/other-agency-register/details?id=SHFPECS&action=UPDATED')
    })

    it('saves an accessible access change', async () => {
      req.body = { accessibleAccess: 'WHEELCHAIR_ACCESS' }

      await controller.submitUpdateAccessibleAccess(req, res)

      expect(hmppsAgencyRegisterApiService.updateOtherAgencyDetails).toHaveBeenCalledWith(
        {},
        'SHFPECS',
        expect.objectContaining({ accessibleAccess: 'WHEELCHAIR_ACCESS' }),
      )
      expect(res.redirect).toHaveBeenCalledWith('/other-agency-register/details?id=SHFPECS&action=UPDATED')
    })

    it('clears accessible access when unknown is selected', async () => {
      req.body = { accessibleAccess: 'UNKNOWN' }

      await controller.submitUpdateAccessibleAccess(req, res)

      expect(hmppsAgencyRegisterApiService.updateOtherAgencyDetails).toHaveBeenCalledWith(
        {},
        'SHFPECS',
        expect.not.objectContaining({ accessibleAccess: expect.anything() }),
      )
    })

    it('renders the agency type page with the current type', async () => {
      await controller.updateAgencyType(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'pages/other-agency-register/updateAgencyType',
        expect.objectContaining({ name: 'Sheffield PECS Agency' }),
      )
    })
  })
})
