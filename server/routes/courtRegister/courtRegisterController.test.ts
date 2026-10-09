import type { Request, Response } from 'express'
import PrisonRegisterService from '../../services/prisonRegisterService'
import CourtRegisterController from './courtRegisterController'
import HmppsAuthClient from '../../data/hmppsAuthClient'
import data from '../testutils/mockCourtData'

jest.mock('../../services/prisonRegisterService')

describe('Court Register controller', () => {
  let prisonRegisterService: jest.Mocked<PrisonRegisterService>
  let controller: CourtRegisterController
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
    prisonRegisterService = new PrisonRegisterService({} as HmppsAuthClient) as jest.Mocked<PrisonRegisterService>
    controller = new CourtRegisterController(prisonRegisterService)
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

  describe('showAllCourts', () => {
    beforeEach(() => {
      prisonRegisterService.getCourts.mockResolvedValue([data.court({ courtId: 'SHFCC' })])
    })

    it('will render all courts page with courts', async () => {
      res.locals.user = {
        username: 'tom',
      }
      await controller.showAllCourts(req, res)

      expect(prisonRegisterService.getCourts).toHaveBeenCalledWith({ username: 'tom' }, {})
      expect(res.render).toHaveBeenCalledWith(
        'pages/court-register/allCourts',
        expect.objectContaining({
          courts: [expect.objectContaining({ id: 'SHFCC' })],
        }),
      )
    })

    it('it will call register service with no filter params', async () => {
      await controller.showAllCourts(req, res)

      expect(prisonRegisterService.getCourts).toHaveBeenCalledWith({}, {})
    })

    it('it will call register service with no filter params', async () => {
      await controller.showAllCourts(req, res)

      expect(prisonRegisterService.getCourts).toHaveBeenCalledWith({}, {})
    })

    it('it will call register service with active filter param', async () => {
      req.query.active = 'true'

      await controller.showAllCourts(req, res)

      expect(prisonRegisterService.getCourts).toHaveBeenCalledWith({}, { active: true })
    })

    it('it will call register service with textSearch filter param', async () => {
      req.query.textSearch = 'Sheffield'

      await controller.showAllCourts(req, res)

      expect(prisonRegisterService.getCourts).toHaveBeenCalledWith({}, { textSearch: 'Sheffield' })
    })

    it('it will call register service with type filter param', async () => {
      req.query.courtTypeCodes = ['CC', 'MC']

      await controller.showAllCourts(req, res)

      expect(prisonRegisterService.getCourts).toHaveBeenCalledWith({}, { courtTypeCodes: ['CC', 'MC'] })
    })

    it('will set the list page link in the session', async () => {
      const reqWithQueryParms = {
        query: {},
        session: {},
        flash: jest.fn(),
      } as unknown as Request
      await controller.showAllCourts(reqWithQueryParms, res)
      expect(reqWithQueryParms.session.allListPageLink).toEqual('/court-register')
    })
  })

  describe('viewCourt', () => {
    beforeEach(() => {
      prisonRegisterService.getCourt.mockResolvedValue(data.court({ courtId: 'SHFCC' }))
      req.query.id = 'SHFCC'
    })

    it('will render court page with court', async () => {
      res.locals.user = {
        username: 'tom',
      }
      await controller.viewCourt(req, res)

      expect(prisonRegisterService.getCourt).toHaveBeenCalledWith({ username: 'tom' }, 'SHFCC')
      expect(res.render).toHaveBeenCalledWith(
        'pages/court-register/courtDetails',
        expect.objectContaining({
          court: expect.objectContaining({ courtId: 'SHFCC' }),
        }),
      )
    })

    it('it will call register service with court Id parameter', async () => {
      await controller.viewCourt(req, res)

      expect(prisonRegisterService.getCourt).toHaveBeenCalledWith({}, 'SHFCC')
    })
  })

  describe('addEmail', () => {
    beforeEach(() => {
      prisonRegisterService.getCourt.mockResolvedValue(
        data.court({ courtId: 'SHFCC', courtName: 'Sheffield Crown Court' }),
      )
      req.query.id = 'SHFCC'
    })

    it('will get the court using the court Id and username', async () => {
      res.locals.user = {
        username: 'tom',
      }
      await controller.addEmail(req, res)

      expect(prisonRegisterService.getCourt).toHaveBeenCalledWith({ username: 'tom' }, 'SHFCC')
    })

    it('will render add email page with court name and cancel link back to court details', async () => {
      ;(req.flash as jest.Mock).mockReturnValue([])

      await controller.addEmail(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/components/edit/addAgencyEmail', {
        name: 'Sheffield Crown Court',
        navigation: { cancelButton: '/court-register/details?id=SHFCC' },
        errors: [],
        emailAddress: undefined,
      })
    })

    it('will render any validation errors from a previous submission', async () => {
      const errors = [{ href: '#emailAddress', text: 'Enter an email address' }]
      ;(req.flash as jest.Mock).mockReturnValue(errors)

      await controller.addEmail(req, res)

      expect(req.flash).toHaveBeenCalledWith('errors')
      expect(res.render).toHaveBeenCalledWith(
        'pages/components/edit/addAgencyEmail',
        expect.objectContaining({ errors }),
      )
    })

    it('will redisplay the submitted email address when there are validation errors', async () => {
      ;(req.flash as jest.Mock).mockReturnValue([{ href: '#emailAddress', text: 'Enter a valid email address' }])
      req.session.addEmailAddressForm = { emailAddress: 'not-an-email' }

      await controller.addEmail(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'pages/components/edit/addAgencyEmail',
        expect.objectContaining({ emailAddress: 'not-an-email' }),
      )
    })

    it('will start with an empty form and clear any previous form when there are no errors', async () => {
      ;(req.flash as jest.Mock).mockReturnValue([])
      req.session.addEmailAddressForm = { emailAddress: 'previous@example.com' }

      await controller.addEmail(req, res)

      expect(req.session.addEmailAddressForm).toBeUndefined()
      expect(res.render).toHaveBeenCalledWith(
        'pages/components/edit/addAgencyEmail',
        expect.objectContaining({ emailAddress: undefined }),
      )
    })
  })

  describe('submitAddEmail', () => {
    beforeEach(() => {
      prisonRegisterService.addCourtEmailAddress.mockResolvedValue({ id: 1, address: 'sheffield.court@example.com' })
      req.query.id = 'SHFCC'
    })

    describe('with a valid email address', () => {
      beforeEach(() => {
        req.body = { emailAddress: 'sheffield.court@example.com' }
      })

      it('will add the email address to the court', async () => {
        res.locals.user = {
          username: 'tom',
        }
        await controller.submitAddEmail(req, res)

        expect(prisonRegisterService.addCourtEmailAddress).toHaveBeenCalledWith({ username: 'tom' }, 'SHFCC', {
          address: 'sheffield.court@example.com',
        })
      })

      it('will redirect to the court details page', async () => {
        await controller.submitAddEmail(req, res)

        expect(res.redirect).toHaveBeenCalledWith('/court-register/details?id=SHFCC')
      })

      it('will clear the form from the session once the email address has been added', async () => {
        req.session.addEmailAddressForm = { emailAddress: 'previous@example.com' }

        await controller.submitAddEmail(req, res)

        expect(req.session.addEmailAddressForm).toBeUndefined()
      })
    })

    it('will keep the form in the session when adding the email address fails', async () => {
      prisonRegisterService.addCourtEmailAddress.mockRejectedValue(new Error('Server error'))
      req.body = { emailAddress: 'sheffield.court@example.com' }

      await expect(controller.submitAddEmail(req, res)).rejects.toThrow('Server error')

      expect(req.session.addEmailAddressForm).toEqual({ emailAddress: 'sheffield.court@example.com' })
      expect(res.redirect).not.toHaveBeenCalled()
    })

    it('will trim the email address before adding it', async () => {
      req.body = { emailAddress: '  sheffield.court@example.com  ' }

      await controller.submitAddEmail(req, res)

      expect(prisonRegisterService.addCourtEmailAddress).toHaveBeenCalledWith({}, 'SHFCC', {
        address: 'sheffield.court@example.com',
      })
    })

    describe('with an invalid email address', () => {
      beforeEach(() => {
        req.body = { emailAddress: 'not-an-email' }
      })

      it('will not add the email address', async () => {
        await controller.submitAddEmail(req, res)

        expect(prisonRegisterService.addCourtEmailAddress).not.toHaveBeenCalled()
      })

      it('will flash the validation errors', async () => {
        await controller.submitAddEmail(req, res)

        expect(req.flash).toHaveBeenCalledWith('errors', [
          { href: '#emailAddress', text: 'Enter a valid email address' },
        ])
      })

      it('will redirect back to the add email page', async () => {
        await controller.submitAddEmail(req, res)

        expect(res.redirect).toHaveBeenCalledWith('/court-register/email/create?id=SHFCC')
      })

      it('will keep the submitted form in the session so it can be redisplayed', async () => {
        await controller.submitAddEmail(req, res)

        expect(req.session.addEmailAddressForm).toEqual({ emailAddress: 'not-an-email' })
      })

      it('will replace rather than merge with a previously submitted form', async () => {
        req.session.addEmailAddressForm = { emailAddress: 'previous@example.com', extra: 'stale' } as never
        await controller.submitAddEmail(req, res)

        expect(req.session.addEmailAddressForm).toEqual({ emailAddress: 'not-an-email' })
      })
    })

    it('will redirect back to the add email page when the email address is missing', async () => {
      req.body = { emailAddress: '' }

      await controller.submitAddEmail(req, res)

      expect(prisonRegisterService.addCourtEmailAddress).not.toHaveBeenCalled()
      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#emailAddress', text: 'Enter an email address' }])
      expect(res.redirect).toHaveBeenCalledWith('/court-register/email/create?id=SHFCC')
    })
  })

  describe('updateEmail', () => {
    beforeEach(() => {
      prisonRegisterService.getCourt.mockResolvedValue(
        data.court({
          courtId: 'SHFCC',
          courtName: 'Sheffield Crown Court',
          emailAddresses: [{ id: 10000, address: 'sheffield.court@example.com' }],
        }),
      )
      req.query.id = 'SHFCC'
      req.query.emailId = '10000'
    })

    it('will get the court using the court Id and username', async () => {
      res.locals.user = { username: 'tom' }

      await controller.updateEmail(req, res)

      expect(prisonRegisterService.getCourt).toHaveBeenCalledWith({ username: 'tom' }, 'SHFCC')
    })

    it('will render update email page with court name, email address, email id and cancel link', async () => {
      ;(req.flash as jest.Mock).mockReturnValue([])

      await controller.updateEmail(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/components/edit/updateAgencyEmail', {
        name: 'Sheffield Crown Court',
        navigation: { cancelButton: '/court-register/details?id=SHFCC' },
        errors: [],
        emailAddress: 'sheffield.court@example.com',
        emailId: 10000,
      })
    })

    it('will redisplay the submitted email address when there are validation errors', async () => {
      const errors = [{ href: '#emailAddress', text: 'Enter a valid email address' }]
      ;(req.flash as jest.Mock).mockReturnValue(errors)
      req.session.updateEmailAddressForm = { emailId: 10000, emailAddress: 'not-an-email' }

      await controller.updateEmail(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'pages/components/edit/updateAgencyEmail',
        expect.objectContaining({ errors, emailAddress: 'not-an-email', emailId: 10000 }),
      )
    })

    it('will start with the selected email address and clear any previous form when there are no errors', async () => {
      ;(req.flash as jest.Mock).mockReturnValue([])
      req.session.updateEmailAddressForm = { emailId: 10000, emailAddress: 'previous@example.com' }

      await controller.updateEmail(req, res)

      expect(req.session.updateEmailAddressForm).toBeUndefined()
      expect(res.render).toHaveBeenCalledWith(
        'pages/components/edit/updateAgencyEmail',
        expect.objectContaining({ emailAddress: 'sheffield.court@example.com', emailId: 10000 }),
      )
    })
  })

  describe('submitUpdateEmail', () => {
    beforeEach(() => {
      prisonRegisterService.updateCourtEmailAddress.mockResolvedValue({
        id: 10000,
        address: 'sheffield.court.updated@example.com',
      })
      req.query.id = 'SHFCC'
      req.body = { emailId: '10000', emailAddress: 'sheffield.court.updated@example.com' }
    })

    it('will update the email address for the court', async () => {
      res.locals.user = { username: 'tom' }

      await controller.submitUpdateEmail(req, res)

      expect(prisonRegisterService.updateCourtEmailAddress).toHaveBeenCalledWith({ username: 'tom' }, 'SHFCC', 10000, {
        address: 'sheffield.court.updated@example.com',
      })
    })

    it('will redirect to the court details page', async () => {
      await controller.submitUpdateEmail(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/court-register/details?id=SHFCC')
    })

    it('will clear the form from the session once the email address has been updated', async () => {
      req.session.updateEmailAddressForm = { emailId: 10000, emailAddress: 'previous@example.com' }

      await controller.submitUpdateEmail(req, res)

      expect(req.session.updateEmailAddressForm).toBeUndefined()
    })

    it('will keep the form in the session when updating the email address fails', async () => {
      prisonRegisterService.updateCourtEmailAddress.mockRejectedValue(new Error('Server error'))

      await expect(controller.submitUpdateEmail(req, res)).rejects.toThrow('Server error')

      expect(req.session.updateEmailAddressForm).toEqual({
        emailId: '10000',
        emailAddress: 'sheffield.court.updated@example.com',
      })
      expect(res.redirect).not.toHaveBeenCalled()
    })

    it('will trim the email address before updating it', async () => {
      req.body.emailAddress = '  sheffield.court.updated@example.com  '

      await controller.submitUpdateEmail(req, res)

      expect(prisonRegisterService.updateCourtEmailAddress).toHaveBeenCalledWith({}, 'SHFCC', 10000, {
        address: 'sheffield.court.updated@example.com',
      })
    })

    it('will not update the email address when it is invalid', async () => {
      req.body.emailAddress = 'not-an-email'

      await controller.submitUpdateEmail(req, res)

      expect(prisonRegisterService.updateCourtEmailAddress).not.toHaveBeenCalled()
      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#emailAddress', text: 'Enter a valid email address' }])
      expect(res.redirect).toHaveBeenCalledWith('/court-register/email/update?id=SHFCC&emailId=10000')
      expect(req.session.updateEmailAddressForm).toEqual({ emailId: '10000', emailAddress: 'not-an-email' })
    })

    it('will redirect back to the update email page when the email address is missing', async () => {
      req.body.emailAddress = ''

      await controller.submitUpdateEmail(req, res)

      expect(prisonRegisterService.updateCourtEmailAddress).not.toHaveBeenCalled()
      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#emailAddress', text: 'Enter an email address' }])
      expect(res.redirect).toHaveBeenCalledWith('/court-register/email/update?id=SHFCC&emailId=10000')
    })
  })

  describe('deleteEmail', () => {
    beforeEach(() => {
      prisonRegisterService.getCourt.mockResolvedValue(
        data.court({
          courtId: 'SHFCC',
          courtName: 'Sheffield Crown Court',
          emailAddresses: [{ id: 10000, address: 'sheffield.court@example.com' }],
        }),
      )
      req.query.id = 'SHFCC'
      req.query.emailId = '10000'
    })

    it('will get the court using the court Id and username', async () => {
      res.locals.user = { username: 'tom' }

      await controller.deleteEmail(req, res)

      expect(prisonRegisterService.getCourt).toHaveBeenCalledWith({ username: 'tom' }, 'SHFCC')
    })

    it('will render the delete email page with the court, selected email address and cancel link', async () => {
      await controller.deleteEmail(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/components/edit/deleteAgencyEmail', {
        name: 'Sheffield Crown Court',
        navigation: { cancelButton: '/court-register/details?id=SHFCC' },
        emailAddress: 'sheffield.court@example.com',
        emailId: 10000,
      })
    })
  })

  describe('submitDeleteEmail', () => {
    beforeEach(() => {
      req.query.id = 'SHFCC'
      req.body = { emailId: '10000' }
    })

    it('will delete the email address using the court, email and user details', async () => {
      res.locals.user = { username: 'tom' }

      await controller.submitDeleteEmail(req, res)

      expect(prisonRegisterService.deleteCourtEmailAddress).toHaveBeenCalledWith({ username: 'tom' }, 'SHFCC', 10000)
    })

    it('will redirect to the court details page after deleting the email address', async () => {
      await controller.submitDeleteEmail(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/court-register/details?id=SHFCC')
    })

    it('will not redirect when the delete fails', async () => {
      prisonRegisterService.deleteCourtEmailAddress.mockRejectedValue(new Error('Server error'))

      await expect(controller.submitDeleteEmail(req, res)).rejects.toThrow('Server error')

      expect(res.redirect).not.toHaveBeenCalled()
    })
  })
})
