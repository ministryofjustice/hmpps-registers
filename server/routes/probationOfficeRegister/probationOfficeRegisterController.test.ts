import type { Request, Response } from 'express'
import HMPPSAgencyRegisterApi from '../../services/hmppsAgencyRegisterApi'
import ProbationOfficeRegisterController from './probationOfficeRegisterController'
import HmppsAuthClient from '../../data/hmppsAuthClient'
import data from '../testutils/mockProbationOfficeData'

jest.mock('../../services/hmppsAgencyRegisterApi')

describe('Police Custody Office Register controller', () => {
  let hmppsAgencyRegisterApiService: jest.Mocked<HMPPSAgencyRegisterApi>
  let controller: ProbationOfficeRegisterController
  let req: Request
  let res: Response

  beforeEach(() => {
    hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(
      {} as HmppsAuthClient,
    ) as jest.Mocked<HMPPSAgencyRegisterApi>
    controller = new ProbationOfficeRegisterController(hmppsAgencyRegisterApiService)
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

  describe('showAllProbationOffices', () => {
    beforeEach(() => {
      hmppsAgencyRegisterApiService.getProbationOffices.mockResolvedValue([
        data.probationOffice({ probationOfficeId: 'SHFPO' }),
      ])
    })

    it('will render all probation offices page with probation offices', async () => {
      res.locals.user = {
        username: 'tom',
      }
      await controller.showAllProbationOffices(req, res)

      expect(hmppsAgencyRegisterApiService.getProbationOffices).toHaveBeenCalledWith({ username: 'tom' }, {})
      expect(res.render).toHaveBeenCalledWith(
        'pages/probation-office-register/allProbationOffices',
        expect.objectContaining({
          probationOffices: [expect.objectContaining({ id: 'SHFPO' })],
        }),
      )
    })

    it('will call register service with no filter params', async () => {
      await controller.showAllProbationOffices(req, res)

      expect(hmppsAgencyRegisterApiService.getProbationOffices).toHaveBeenCalledWith({}, {})
    })

    it('will call register service with active filter param', async () => {
      req.query.active = 'false'

      await controller.showAllProbationOffices(req, res)

      expect(hmppsAgencyRegisterApiService.getProbationOffices).toHaveBeenCalledWith({}, { active: false })
    })

    it('will call register service with textSearch filter param', async () => {
      req.query.textSearch = 'Sheffield'

      await controller.showAllProbationOffices(req, res)

      expect(hmppsAgencyRegisterApiService.getProbationOffices).toHaveBeenCalledWith({}, { textSearch: 'Sheffield' })
    })

    it('will ignore unsupported filter params', async () => {
      req.query.highSecurity = 'true'

      await controller.showAllProbationOffices(req, res)

      expect(hmppsAgencyRegisterApiService.getProbationOffices).toHaveBeenCalledWith({}, {})
    })

    it('will set the list page link in the session', async () => {
      await controller.showAllProbationOffices(req, res)

      expect(req.session.allListPageLink).toEqual('/probation-office-register')
    })
  })

  describe('viewProbationOffice', () => {
    beforeEach(() => {
      hmppsAgencyRegisterApiService.getProbationOffice.mockResolvedValue(
        data.probationOffice({ probationOfficeId: 'SHFPO' }),
      )
      req.query.id = 'SHFPO'
    })

    it('will render probation office page with probation office', async () => {
      res.locals.user = {
        username: 'tom',
      }
      await controller.viewProbationOffice(req, res)

      expect(hmppsAgencyRegisterApiService.getProbationOffice).toHaveBeenCalledWith({ username: 'tom' }, 'SHFPO')
      expect(res.render).toHaveBeenCalledWith(
        'pages/probation-office-register/probationOfficeDetails',
        expect.objectContaining({
          probationOffice: expect.objectContaining({ probationOfficeId: 'SHFPO' }),
        }),
      )
    })

    it('will call register service with probation office Id parameter', async () => {
      await controller.viewProbationOffice(req, res)

      expect(hmppsAgencyRegisterApiService.getProbationOffice).toHaveBeenCalledWith({}, 'SHFPO')
    })
  })

  describe('updates', () => {
    beforeEach(() => {
      hmppsAgencyRegisterApiService.getProbationOffice.mockResolvedValue(
        data.probationOffice({
          probationOfficeId: 'SHFPO',
          cjitCode: 'C00SH00',
          area: { code: 'SY', description: 'South Yorkshire' },
          emailAddresses: [{ id: 3, address: 'a@b.com' }],
        }),
      )
      hmppsAgencyRegisterApiService.updateProbationOfficeDetails.mockResolvedValue({ success: true })
      req.query.id = 'SHFPO'
      ;(req.flash as jest.Mock).mockReturnValue([])
    })

    it('saves a name change while keeping the other fields', async () => {
      req.body = { name: 'New name', description: 'New description' }

      await controller.submitUpdateNameDescription(req, res)

      expect(hmppsAgencyRegisterApiService.updateProbationOfficeDetails).toHaveBeenCalledWith({}, 'SHFPO', {
        probationOfficeName: 'New name',
        description: 'New description',
        contact: 'Duty Officer',
        active: true,
        accessibleAccess: undefined,
        inactiveDate: undefined,
        cjitCode: 'C00SH00',
        areaCode: 'SY',
        subareaCode: 'SY',
        regionCode: 'YH',
        geographicalAreaCode: 'YH',
        localAuthorityCode: 'YH',
        payrollRegionCode: 'YH',
      })
      expect(res.redirect).toHaveBeenCalledWith('/probation-office-register/details?id=SHFPO&action=UPDATED')
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
      hmppsAgencyRegisterApiService.addProbationOfficeEmailAddress.mockResolvedValue({ success: true })
      req.body = { emailAddress: 'new@b.com' }

      await controller.submitAddEmail(req, res)

      expect(hmppsAgencyRegisterApiService.addProbationOfficeEmailAddress).toHaveBeenCalledWith({}, 'SHFPO', {
        address: 'new@b.com',
      })
      expect(res.redirect).toHaveBeenCalledWith('/probation-office-register/details?id=SHFPO&action=UPDATED')
    })

    it('saves a contact change while keeping the other fields', async () => {
      req.body = { contact: 'Front desk' }

      await controller.submitUpdateContact(req, res)

      expect(hmppsAgencyRegisterApiService.updateProbationOfficeDetails).toHaveBeenCalledWith(
        {},
        'SHFPO',
        expect.objectContaining({ contact: 'Front desk', probationOfficeName: 'Sheffield Probation Office' }),
      )
      expect(res.redirect).toHaveBeenCalledWith('/probation-office-register/details?id=SHFPO&action=UPDATED')
    })

    it('saves an accessible access change', async () => {
      req.body = { accessibleAccess: 'WHEELCHAIR_ACCESS' }

      await controller.submitUpdateAccessibleAccess(req, res)

      expect(hmppsAgencyRegisterApiService.updateProbationOfficeDetails).toHaveBeenCalledWith(
        {},
        'SHFPO',
        expect.objectContaining({ accessibleAccess: 'WHEELCHAIR_ACCESS' }),
      )
      expect(res.redirect).toHaveBeenCalledWith('/probation-office-register/details?id=SHFPO&action=UPDATED')
    })

    it('clears accessible access when unknown is selected', async () => {
      req.body = { accessibleAccess: 'UNKNOWN' }

      await controller.submitUpdateAccessibleAccess(req, res)

      expect(hmppsAgencyRegisterApiService.updateProbationOfficeDetails).toHaveBeenCalledWith(
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
