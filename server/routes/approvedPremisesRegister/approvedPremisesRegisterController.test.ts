import type { Request, Response } from 'express'
import HMPPSAgencyRegisterApi from '../../services/hmppsAgencyRegisterApi'
import ApprovedPremisesRegisterController from './approvedPremisesRegisterController'
import HmppsAuthClient from '../../data/hmppsAuthClient'
import data from '../testutils/mockApprovedPremisesData'

jest.mock('../../services/hmppsAgencyRegisterApi')

describe('Approved Premises Register controller', () => {
  let hmppsAgencyRegisterApiService: jest.Mocked<HMPPSAgencyRegisterApi>
  let controller: ApprovedPremisesRegisterController
  let req: Request
  let res: Response

  beforeEach(() => {
    hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(
      {} as HmppsAuthClient,
    ) as jest.Mocked<HMPPSAgencyRegisterApi>
    controller = new ApprovedPremisesRegisterController(hmppsAgencyRegisterApiService)
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

  describe('showAllApprovedPremises', () => {
    beforeEach(() => {
      hmppsAgencyRegisterApiService.getAllApprovedPremises.mockResolvedValue([
        data.approvedPremises({ approvedPremisesId: 'SHFAP' }),
      ])
    })

    it('will render all approved premises page with approved premises', async () => {
      res.locals.user = {
        username: 'tom',
      }
      await controller.showAllApprovedPremises(req, res)

      expect(hmppsAgencyRegisterApiService.getAllApprovedPremises).toHaveBeenCalledWith({ username: 'tom' }, {})
      expect(res.render).toHaveBeenCalledWith(
        'pages/approved-premises-register/allApprovedPremises',
        expect.objectContaining({
          approvedPremisesList: [expect.objectContaining({ id: 'SHFAP' })],
        }),
      )
    })

    it('will call register service with no filter params', async () => {
      await controller.showAllApprovedPremises(req, res)

      expect(hmppsAgencyRegisterApiService.getAllApprovedPremises).toHaveBeenCalledWith({}, {})
    })

    it('will call register service with active filter param', async () => {
      req.query.active = 'false'

      await controller.showAllApprovedPremises(req, res)

      expect(hmppsAgencyRegisterApiService.getAllApprovedPremises).toHaveBeenCalledWith({}, { active: false })
    })

    it('will call register service with textSearch filter param', async () => {
      req.query.textSearch = 'Sheffield'

      await controller.showAllApprovedPremises(req, res)

      expect(hmppsAgencyRegisterApiService.getAllApprovedPremises).toHaveBeenCalledWith({}, { textSearch: 'Sheffield' })
    })

    it('will ignore unsupported filter params', async () => {
      req.query.highSecurity = 'true'

      await controller.showAllApprovedPremises(req, res)

      expect(hmppsAgencyRegisterApiService.getAllApprovedPremises).toHaveBeenCalledWith({}, {})
    })

    it('will set the list page link in the session', async () => {
      await controller.showAllApprovedPremises(req, res)

      expect(req.session.allListPageLink).toEqual('/approved-premises-register')
    })
  })

  describe('viewApprovedPremises', () => {
    beforeEach(() => {
      hmppsAgencyRegisterApiService.getApprovedPremises.mockResolvedValue(
        data.approvedPremises({ approvedPremisesId: 'SHFAP' }),
      )
      req.query.id = 'SHFAP'
    })

    it('will render approved premises page with approved premises', async () => {
      res.locals.user = {
        username: 'tom',
      }
      await controller.viewApprovedPremises(req, res)

      expect(hmppsAgencyRegisterApiService.getApprovedPremises).toHaveBeenCalledWith({ username: 'tom' }, 'SHFAP')
      expect(res.render).toHaveBeenCalledWith(
        'pages/approved-premises-register/approvedPremisesDetails',
        expect.objectContaining({
          approvedPremises: expect.objectContaining({ approvedPremisesId: 'SHFAP' }),
        }),
      )
    })

    it('will call register service with approved premises Id parameter', async () => {
      await controller.viewApprovedPremises(req, res)

      expect(hmppsAgencyRegisterApiService.getApprovedPremises).toHaveBeenCalledWith({}, 'SHFAP')
    })
  })

  describe('updates', () => {
    beforeEach(() => {
      hmppsAgencyRegisterApiService.getApprovedPremises.mockResolvedValue(
        data.approvedPremises({
          approvedPremisesId: 'SHFPO',
          cjitCode: 'C00SH00',
          area: { code: 'SY', description: 'South Yorkshire' },
          emailAddresses: [{ id: 3, address: 'a@b.com' }],
        }),
      )
      hmppsAgencyRegisterApiService.updateApprovedPremisesDetails.mockResolvedValue({ success: true })
      req.query.id = 'SHFPO'
      ;(req.flash as jest.Mock).mockReturnValue([])
    })

    it('saves a name change while keeping the other fields', async () => {
      req.body = { name: 'New name', description: 'New description' }

      await controller.submitUpdateNameDescription(req, res)

      expect(hmppsAgencyRegisterApiService.updateApprovedPremisesDetails).toHaveBeenCalledWith({}, 'SHFPO', {
        approvedPremisesName: 'New name',
        description: 'New description',
        contact: 'Duty Officer',
        active: true,
        accessibleAccess: undefined,
        inactiveDate: undefined,
        cjitCode: 'C00SH00',
        areaCode: 'SY',
        regionCode: 'YH',
        geographicalAreaCode: 'YH',
        localAuthorityCode: 'YH',
        payrollRegionCode: 'YH',
      })
      expect(res.redirect).toHaveBeenCalledWith('/approved-premises-register/details?id=SHFPO&action=UPDATED')
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
      hmppsAgencyRegisterApiService.addApprovedPremisesEmailAddress.mockResolvedValue({ success: true })
      req.body = { emailAddress: 'new@b.com' }

      await controller.submitAddEmail(req, res)

      expect(hmppsAgencyRegisterApiService.addApprovedPremisesEmailAddress).toHaveBeenCalledWith({}, 'SHFPO', {
        address: 'new@b.com',
      })
      expect(res.redirect).toHaveBeenCalledWith('/approved-premises-register/details?id=SHFPO&action=UPDATED')
    })

    it('saves a contact change while keeping the other fields', async () => {
      req.body = { contact: 'Front desk' }

      await controller.submitUpdateContact(req, res)

      expect(hmppsAgencyRegisterApiService.updateApprovedPremisesDetails).toHaveBeenCalledWith(
        {},
        'SHFPO',
        expect.objectContaining({ contact: 'Front desk', approvedPremisesName: 'Sheffield Approved Premises' }),
      )
      expect(res.redirect).toHaveBeenCalledWith('/approved-premises-register/details?id=SHFPO&action=UPDATED')
    })

    it('saves an accessible access change', async () => {
      req.body = { accessibleAccess: 'WHEELCHAIR_ACCESS' }

      await controller.submitUpdateAccessibleAccess(req, res)

      expect(hmppsAgencyRegisterApiService.updateApprovedPremisesDetails).toHaveBeenCalledWith(
        {},
        'SHFPO',
        expect.objectContaining({ accessibleAccess: 'WHEELCHAIR_ACCESS' }),
      )
      expect(res.redirect).toHaveBeenCalledWith('/approved-premises-register/details?id=SHFPO&action=UPDATED')
    })

    it('clears accessible access when unknown is selected', async () => {
      req.body = { accessibleAccess: 'UNKNOWN' }

      await controller.submitUpdateAccessibleAccess(req, res)

      expect(hmppsAgencyRegisterApiService.updateApprovedPremisesDetails).toHaveBeenCalledWith(
        {},
        'SHFPO',
        expect.not.objectContaining({ accessibleAccess: expect.anything() }),
      )
    })

    it('renders the contact page with the current contact', async () => {
      await controller.updateContact(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'pages/components/edit/updateAgencyContact',
        expect.objectContaining({ contact: 'Duty Officer' }),
      )
    })
  })
})
