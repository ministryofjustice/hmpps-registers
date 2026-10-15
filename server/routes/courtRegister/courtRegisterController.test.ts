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

  describe('addAddress', () => {
    beforeEach(() => {
      prisonRegisterService.getCourt.mockResolvedValue(
        data.court({ courtId: 'SHFCC', courtName: 'Sheffield Crown Court' }),
      )
      req.query.id = 'SHFCC'
    })

    it('will get the court using the court Id and username', async () => {
      res.locals.user = { username: 'tom' }

      await controller.addAddress(req, res)

      expect(prisonRegisterService.getCourt).toHaveBeenCalledWith({ username: 'tom' }, 'SHFCC')
    })

    it('will render the add address page with an empty form and a cancel link', async () => {
      ;(req.flash as jest.Mock).mockReturnValue([])

      await controller.addAddress(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/components/edit/addAgencyAddress', {
        name: 'Sheffield Crown Court',
        navigation: { cancelButton: '/court-register/details?id=SHFCC' },
        errors: [],
        form: {},
      })
    })

    it('will render validation errors and redisplay the submitted address', async () => {
      const errors = [{ href: '#addresstown', text: 'Enter the town or city' }]
      ;(req.flash as jest.Mock).mockReturnValue(errors)
      req.session.addAddressForm = { addresstown: '', addresspostcode: 'S1 2BJ', addresscountry: 'England' }

      await controller.addAddress(req, res)

      expect(req.flash).toHaveBeenCalledWith('errors')
      expect(res.render).toHaveBeenCalledWith(
        'pages/components/edit/addAgencyAddress',
        expect.objectContaining({
          errors,
          form: { addresstown: '', addresspostcode: 'S1 2BJ', addresscountry: 'England' },
        }),
      )
    })

    it('will clear any previous form when there are no errors', async () => {
      ;(req.flash as jest.Mock).mockReturnValue([])
      req.session.addAddressForm = { addresstown: 'Leeds', addresspostcode: 'LS1 1AA', addresscountry: 'England' }

      await controller.addAddress(req, res)

      expect(req.session.addAddressForm).toBeUndefined()
      expect(res.render).toHaveBeenCalledWith(
        'pages/components/edit/addAgencyAddress',
        expect.objectContaining({ form: {} }),
      )
    })
  })

  describe('submitAddAddress', () => {
    const validBody = {
      addressline1: '1 High Street',
      addressline2: '',
      addresstown: 'Sheffield',
      addresscounty: 'South Yorkshire',
      addresspostcode: 'S1 2BJ',
      addresscountry: 'England',
    }

    beforeEach(() => {
      prisonRegisterService.addCourtAddress.mockResolvedValue({ success: true })
      req.query.id = 'SHFCC'
      req.body = { ...validBody }
    })

    it('will add the address to the court using the username', async () => {
      res.locals.user = { username: 'tom' }

      await controller.submitAddAddress(req, res)

      expect(prisonRegisterService.addCourtAddress).toHaveBeenCalledWith({ username: 'tom' }, 'SHFCC', {
        addressLine1: '1 High Street',
        addressLine2: '',
        town: 'Sheffield',
        county: 'South Yorkshire',
        postcode: 'S1 2BJ',
        country: 'England',
      })
    })

    it('will redirect to court details with a success confirmation and clear the form', async () => {
      await controller.submitAddAddress(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/court-register/details?id=SHFCC&action=UPDATED')
      expect(req.session.addAddressForm).toBeUndefined()
    })

    it('will trim the address fields before adding them', async () => {
      req.body = { ...validBody, addressline1: '  1 High Street  ', addresstown: '  Sheffield  ' }

      await controller.submitAddAddress(req, res)

      expect(prisonRegisterService.addCourtAddress).toHaveBeenCalledWith(
        {},
        'SHFCC',
        expect.objectContaining({ addressLine1: '1 High Street', town: 'Sheffield' }),
      )
    })

    it('will keep the form in the session when adding the address fails', async () => {
      prisonRegisterService.addCourtAddress.mockRejectedValue(new Error('Server error'))

      await expect(controller.submitAddAddress(req, res)).rejects.toThrow('Server error')

      expect(req.session.addAddressForm).toEqual(validBody)
      expect(res.redirect).not.toHaveBeenCalled()
    })

    it('will retain the form and show the API user message when the address is rejected', async () => {
      req.body = { ...validBody, addressline1: '  1 High Street  ' }
      prisonRegisterService.addCourtAddress.mockResolvedValue({
        success: false,
        userMessage: 'This address already exists',
      })

      await controller.submitAddAddress(req, res)

      expect(req.session.addAddressForm).toEqual(validBody)
      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#addressline1', text: 'This address already exists' }])
      expect(res.redirect).toHaveBeenCalledWith('/court-register/address/create?id=SHFCC')
    })

    it('will reject an invalid address, keep the form and redirect back to the add address page', async () => {
      req.body = { ...validBody, addresspostcode: 'BANANAS' }

      await controller.submitAddAddress(req, res)

      expect(prisonRegisterService.addCourtAddress).not.toHaveBeenCalled()
      expect(req.flash).toHaveBeenCalledWith('errors', [
        { href: '#addresspostcode', text: 'Enter a real postcode, like AA11AA' },
      ])
      expect(res.redirect).toHaveBeenCalledWith('/court-register/address/create?id=SHFCC')
      expect(req.session.addAddressForm).toEqual({ ...validBody, addresspostcode: 'BANANAS' })
    })
  })

  describe('updateAddress', () => {
    const currentAddress = {
      addressId: 2,
      addressline1: '1 High Street',
      addressline2: 'City Centre',
      addresstown: 'Sheffield',
      addresscounty: 'South Yorkshire',
      addresspostcode: 'S1 2BJ',
      addresscountry: 'England',
    }

    beforeEach(() => {
      req.query.id = 'SHFCC'
      req.query.addressId = '2'
      ;(req.flash as jest.Mock).mockReturnValue([])
      prisonRegisterService.getCourt.mockResolvedValue(
        data.court({
          courtId: 'SHFCC',
          courtName: 'Sheffield Crown Court',
          addresses: [
            data.address({ id: 1 }),
            data.address({
              id: 2,
              addressLine1: '1 High Street',
              addressLine2: 'City Centre',
              town: 'Sheffield',
              county: 'South Yorkshire',
              postcode: 'S1 2BJ',
              country: 'England',
            }),
          ],
        }),
      )
    })

    it('will load the selected address using the username and render the prefilled form', async () => {
      res.locals.user = { username: 'tom' }

      await controller.updateAddress(req, res)

      expect(prisonRegisterService.getCourt).toHaveBeenCalledWith({ username: 'tom' }, 'SHFCC')
      expect(res.render).toHaveBeenCalledWith('pages/components/edit/updateAgencyAddress', {
        name: 'Sheffield Crown Court',
        navigation: { cancelButton: '/court-register/details?id=SHFCC' },
        errors: [],
        form: currentAddress,
      })
    })

    it('will retain all submitted fields including empty values on validation errors', async () => {
      const errors = [{ href: '#addresstown', text: 'Enter the town or city' }]
      ;(req.flash as jest.Mock).mockReturnValue(errors)
      const form = { ...currentAddress, addresstown: '', addresscounty: '', addresscountry: '' }
      req.session.updateAddressForm = form

      await controller.updateAddress(req, res)

      expect(req.flash).toHaveBeenCalledWith('errors')
      expect(res.render).toHaveBeenCalledWith(
        'pages/components/edit/updateAgencyAddress',
        expect.objectContaining({ errors, form }),
      )
    })

    it('will clear a previous submission on a fresh visit', async () => {
      req.session.updateAddressForm = { ...currentAddress, addresstown: 'Leeds' }

      await controller.updateAddress(req, res)

      expect(req.session.updateAddressForm).toBeUndefined()
      expect(res.render).toHaveBeenCalledWith(
        'pages/components/edit/updateAgencyAddress',
        expect.objectContaining({ form: currentAddress }),
      )
    })

    it('will not display a submitted form for a different address', async () => {
      ;(req.flash as jest.Mock).mockReturnValue([{ href: '#addresstown', text: 'Enter the town or city' }])
      req.session.updateAddressForm = { ...currentAddress, addressId: 1, addresstown: 'Leeds' }

      await controller.updateAddress(req, res)

      expect(req.session.updateAddressForm).toBeUndefined()
      expect(res.render).toHaveBeenCalledWith(
        'pages/components/edit/updateAgencyAddress',
        expect.objectContaining({ form: currentAddress }),
      )
    })

    it('will display null address fields as empty values', async () => {
      prisonRegisterService.getCourt.mockResolvedValue(
        data.court({
          addresses: [
            { id: 2, addressLine1: null, addressLine2: null, town: null, county: null, postcode: null, country: null },
          ],
        }),
      )

      await controller.updateAddress(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'pages/components/edit/updateAgencyAddress',
        expect.objectContaining({
          form: {
            addressId: 2,
            addressline1: '',
            addressline2: '',
            addresstown: '',
            addresscounty: '',
            addresspostcode: '',
            addresscountry: '',
          },
        }),
      )
    })

    it('will return not found for an address not belonging to the court', async () => {
      req.query.addressId = '99'

      await expect(controller.updateAddress(req, res)).rejects.toMatchObject({ status: 404 })
      expect(res.render).not.toHaveBeenCalled()
    })
  })

  describe('submitUpdateAddress', () => {
    const validForm = {
      addressId: '2',
      addressline1: '1 High Street',
      addressline2: 'City Centre',
      addresstown: 'Sheffield',
      addresscounty: 'South Yorkshire',
      addresspostcode: 'S1 2BJ',
      addresscountry: 'England',
    }

    beforeEach(() => {
      req.query.id = 'SHFCC'
      req.body = { ...validForm }
      prisonRegisterService.updateCourtAddress.mockResolvedValue({ success: true })
    })

    it('will update the selected address using the username and clear the form on success', async () => {
      res.locals.user = { username: 'tom' }

      await controller.submitUpdateAddress(req, res)

      expect(prisonRegisterService.updateCourtAddress).toHaveBeenCalledWith({ username: 'tom' }, 'SHFCC', 2, {
        addressLine1: '1 High Street',
        addressLine2: 'City Centre',
        town: 'Sheffield',
        county: 'South Yorkshire',
        postcode: 'S1 2BJ',
        country: 'England',
      })
      expect(req.session.updateAddressForm).toBeUndefined()
      expect(res.redirect).toHaveBeenCalledWith('/court-register/details?id=SHFCC&action=UPDATED')
    })

    it('will trim submitted address fields', async () => {
      req.body = {
        ...validForm,
        addressline1: '  1 High Street  ',
        addressline2: '  City Centre  ',
        addresstown: '  Sheffield  ',
        addresscounty: '  South Yorkshire  ',
        addresspostcode: '  S1 2BJ  ',
      }

      await controller.submitUpdateAddress(req, res)

      expect(prisonRegisterService.updateCourtAddress).toHaveBeenCalledWith({}, 'SHFCC', 2, {
        addressLine1: '1 High Street',
        addressLine2: 'City Centre',
        town: 'Sheffield',
        county: 'South Yorkshire',
        postcode: 'S1 2BJ',
        country: 'England',
      })
    })

    it('will retain the form and show the API user message when the address update is rejected', async () => {
      req.body.addressline1 = '  1 High Street  '
      prisonRegisterService.updateCourtAddress.mockResolvedValue({
        success: false,
        userMessage: 'This address already exists',
      })

      await controller.submitUpdateAddress(req, res)

      expect(req.session.updateAddressForm).toEqual({ ...validForm, addressId: 2 })
      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#addressline1', text: 'This address already exists' }])
      expect(res.redirect).toHaveBeenCalledWith('/court-register/address/update?id=SHFCC&addressId=2')
    })

    it('will retain an invalid form and redirect to the selected address', async () => {
      req.body.addresspostcode = 'BANANAS'

      await controller.submitUpdateAddress(req, res)

      expect(prisonRegisterService.updateCourtAddress).not.toHaveBeenCalled()
      expect(req.flash).toHaveBeenCalledWith('errors', [
        { href: '#addresspostcode', text: 'Enter a real postcode, like AA11AA' },
      ])
      expect(req.session.updateAddressForm).toEqual({ ...validForm, addressId: 2, addresspostcode: 'BANANAS' })
      expect(res.redirect).toHaveBeenCalledWith('/court-register/address/update?id=SHFCC&addressId=2')
    })

    it('will propagate API errors and retain the form without redirecting', async () => {
      prisonRegisterService.updateCourtAddress.mockRejectedValue(new Error('Server error'))

      await expect(controller.submitUpdateAddress(req, res)).rejects.toThrow('Server error')

      expect(req.session.updateAddressForm).toEqual({ ...validForm, addressId: 2 })
      expect(res.redirect).not.toHaveBeenCalled()
    })
  })

  describe('addPhone', () => {
    beforeEach(() => {
      prisonRegisterService.getCourt.mockResolvedValue(
        data.court({ courtId: 'SHFCC', courtName: 'Sheffield Crown Court' }),
      )
      req.query.id = 'SHFCC'
    })

    it('will get the court using the court Id and username', async () => {
      res.locals.user = { username: 'tom' }

      await controller.addPhone(req, res)

      expect(prisonRegisterService.getCourt).toHaveBeenCalledWith({ username: 'tom' }, 'SHFCC')
    })

    it('will render add phone page with court name and cancel link back to court details', async () => {
      ;(req.flash as jest.Mock).mockReturnValue([])

      await controller.addPhone(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/components/edit/addAgencyPhone', {
        name: 'Sheffield Crown Court',
        navigation: { cancelButton: '/court-register/details?id=SHFCC' },
        errors: [],
        phoneNumber: undefined,
      })
    })

    it('will render validation errors and redisplay the submitted phone number', async () => {
      const errors = [
        { href: '#phoneNumber', text: 'Enter a phone number using only numbers, spaces, plus signs and dashes' },
      ]
      ;(req.flash as jest.Mock).mockReturnValue(errors)
      req.session.addPhoneNumberForm = { phoneNumber: 'not-a-number' }

      await controller.addPhone(req, res)

      expect(req.flash).toHaveBeenCalledWith('errors')
      expect(res.render).toHaveBeenCalledWith(
        'pages/components/edit/addAgencyPhone',
        expect.objectContaining({ errors, phoneNumber: 'not-a-number' }),
      )
    })

    it('will clear any previous form when there are no errors', async () => {
      ;(req.flash as jest.Mock).mockReturnValue([])
      req.session.addPhoneNumberForm = { phoneNumber: '0114 555 9898' }

      await controller.addPhone(req, res)

      expect(req.session.addPhoneNumberForm).toBeUndefined()
      expect(res.render).toHaveBeenCalledWith(
        'pages/components/edit/addAgencyPhone',
        expect.objectContaining({ phoneNumber: undefined }),
      )
    })
  })

  describe('submitAddPhone', () => {
    beforeEach(() => {
      prisonRegisterService.addCourtPhoneNumber.mockResolvedValue({ success: true })
      req.query.id = 'SHFCC'
      req.body = { phoneNumber: '0114 555 9898' }
    })

    it('will add the phone number to the court using the username and redirect to court details', async () => {
      res.locals.user = { username: 'tom' }

      await controller.submitAddPhone(req, res)

      expect(prisonRegisterService.addCourtPhoneNumber).toHaveBeenCalledWith({ username: 'tom' }, 'SHFCC', {
        number: '0114 555 9898',
      })
      expect(res.redirect).toHaveBeenCalledWith('/court-register/details?id=SHFCC&action=UPDATED')
      expect(req.session.addPhoneNumberForm).toBeUndefined()
    })

    it('will trim the phone number before adding it', async () => {
      req.body = { phoneNumber: '  +44 114-555-9898  ' }

      await controller.submitAddPhone(req, res)

      expect(prisonRegisterService.addCourtPhoneNumber).toHaveBeenCalledWith({}, 'SHFCC', {
        number: '+44 114-555-9898',
      })
    })

    it('will retain the form and show the API user message when the phone number is rejected', async () => {
      req.body.phoneNumber = '  0114 555 9898  '
      prisonRegisterService.addCourtPhoneNumber.mockResolvedValue({
        success: false,
        userMessage: 'This phone number already exists',
      })

      await controller.submitAddPhone(req, res)

      expect(req.session.addPhoneNumberForm).toEqual({ phoneNumber: '0114 555 9898' })
      expect(req.flash).toHaveBeenCalledWith('errors', [
        { href: '#phoneNumber', text: 'This phone number already exists' },
      ])
      expect(res.redirect).toHaveBeenCalledWith('/court-register/phone/create?id=SHFCC')
    })

    it('will keep the form in the session when adding the phone number fails', async () => {
      prisonRegisterService.addCourtPhoneNumber.mockRejectedValue(new Error('Server error'))

      await expect(controller.submitAddPhone(req, res)).rejects.toThrow('Server error')

      expect(req.session.addPhoneNumberForm).toEqual({ phoneNumber: '0114 555 9898' })
      expect(res.redirect).not.toHaveBeenCalled()
    })

    it.each([
      ['', 'Enter a phone number'],
      ['   ', 'Enter a phone number'],
      ['not-a-number', 'Enter a phone number using only numbers, spaces, plus signs and dashes'],
    ])('will reject an invalid phone number and retain the trimmed form: %s', async (phoneNumber, text) => {
      req.session.addPhoneNumberForm = { phoneNumber: 'previous number' }
      req.body = { phoneNumber }

      await controller.submitAddPhone(req, res)

      expect(prisonRegisterService.addCourtPhoneNumber).not.toHaveBeenCalled()
      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#phoneNumber', text }])
      expect(res.redirect).toHaveBeenCalledWith('/court-register/phone/create?id=SHFCC')
      expect(req.session.addPhoneNumberForm).toEqual({ phoneNumber: phoneNumber.trim() })
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
      prisonRegisterService.addCourtEmailAddress.mockResolvedValue({ success: true })
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

        expect(res.redirect).toHaveBeenCalledWith('/court-register/details?id=SHFCC&action=UPDATED')
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

    it('will retain the form and show the API user message when the email address is rejected', async () => {
      req.body = { emailAddress: '  sheffield.court@example.com  ' }
      prisonRegisterService.addCourtEmailAddress.mockResolvedValue({
        success: false,
        userMessage: 'This email address already exists',
      })

      await controller.submitAddEmail(req, res)

      expect(req.session.addEmailAddressForm).toEqual({ emailAddress: 'sheffield.court@example.com' })
      expect(req.flash).toHaveBeenCalledWith('errors', [
        { href: '#emailAddress', text: 'This email address already exists' },
      ])
      expect(res.redirect).toHaveBeenCalledWith('/court-register/email/create?id=SHFCC')
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

  describe('updatePhone', () => {
    beforeEach(() => {
      prisonRegisterService.getCourt.mockResolvedValue(
        data.court({
          courtId: 'SHFCC',
          courtName: 'Sheffield Crown Court',
          phoneNumbers: [
            { id: 1, number: '0114 555 1111' },
            { id: 10000, number: '0114 555 9898' },
          ],
        }),
      )
      req.query.id = 'SHFCC'
      req.query.phoneId = '10000'
    })

    it('will get the court using the court Id and username', async () => {
      res.locals.user = { username: 'tom' }

      await controller.updatePhone(req, res)

      expect(prisonRegisterService.getCourt).toHaveBeenCalledWith({ username: 'tom' }, 'SHFCC')
    })

    it('will render update phone page with the selected number, id, court name and cancel link', async () => {
      ;(req.flash as jest.Mock).mockReturnValue([])

      await controller.updatePhone(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/components/edit/updateAgencyPhone', {
        name: 'Sheffield Crown Court',
        navigation: { cancelButton: '/court-register/details?id=SHFCC' },
        errors: [],
        phoneNumber: '0114 555 9898',
        phoneId: 10000,
      })
    })

    it.each(['not-a-number', ''])(
      'will redisplay submitted input when there are validation errors: %s',
      async phoneNumber => {
        const errors = [{ href: '#phoneNumber', text: 'Enter a phone number' }]
        ;(req.flash as jest.Mock).mockReturnValue(errors)
        req.session.updatePhoneNumberForm = { phoneId: 10000, phoneNumber }

        await controller.updatePhone(req, res)

        expect(req.flash).toHaveBeenCalledWith('errors')
        expect(res.render).toHaveBeenCalledWith(
          'pages/components/edit/updateAgencyPhone',
          expect.objectContaining({ errors, phoneNumber, phoneId: 10000 }),
        )
      },
    )

    it('will clear the previous form and show the current number when there are no errors', async () => {
      ;(req.flash as jest.Mock).mockReturnValue([])
      req.session.updatePhoneNumberForm = { phoneId: 10000, phoneNumber: 'previous number' }

      await controller.updatePhone(req, res)

      expect(req.session.updatePhoneNumberForm).toBeUndefined()
      expect(res.render).toHaveBeenCalledWith(
        'pages/components/edit/updateAgencyPhone',
        expect.objectContaining({ phoneNumber: '0114 555 9898', phoneId: 10000 }),
      )
    })
  })

  describe('submitUpdatePhone', () => {
    beforeEach(() => {
      prisonRegisterService.updateCourtPhoneNumber.mockResolvedValue({ success: true })
      req.query.id = 'SHFCC'
      req.body = { phoneId: '10000', phoneNumber: '+44 114-555-9898' }
    })

    it('will update the selected court phone number using the username', async () => {
      res.locals.user = { username: 'tom' }

      await controller.submitUpdatePhone(req, res)

      expect(prisonRegisterService.updateCourtPhoneNumber).toHaveBeenCalledWith({ username: 'tom' }, 'SHFCC', 10000, {
        number: '+44 114-555-9898',
      })
    })

    it('will redirect to court details with a success confirmation and clear the form', async () => {
      req.session.updatePhoneNumberForm = { phoneId: 10000, phoneNumber: 'previous number' }

      await controller.submitUpdatePhone(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/court-register/details?id=SHFCC&action=UPDATED')
      expect(req.session.updatePhoneNumberForm).toBeUndefined()
    })

    it('will trim the phone number before updating it', async () => {
      req.body.phoneNumber = '  +44 114-555-9898  '

      await controller.submitUpdatePhone(req, res)

      expect(prisonRegisterService.updateCourtPhoneNumber).toHaveBeenCalledWith({}, 'SHFCC', 10000, {
        number: '+44 114-555-9898',
      })
    })

    it('will retain the form and show the API user message when the phone update is rejected', async () => {
      req.body.phoneNumber = '  +44 114-555-9898  '
      prisonRegisterService.updateCourtPhoneNumber.mockResolvedValue({
        success: false,
        userMessage: 'This phone number already exists',
      })

      await controller.submitUpdatePhone(req, res)

      expect(req.session.updatePhoneNumberForm).toEqual({ phoneId: '10000', phoneNumber: '+44 114-555-9898' })
      expect(req.flash).toHaveBeenCalledWith('errors', [
        { href: '#phoneNumber', text: 'This phone number already exists' },
      ])
      expect(res.redirect).toHaveBeenCalledWith('/court-register/phone/update?id=SHFCC&phoneId=10000')
    })

    it('will retain the form and propagate errors when updating fails', async () => {
      prisonRegisterService.updateCourtPhoneNumber.mockRejectedValue(new Error('Server error'))

      await expect(controller.submitUpdatePhone(req, res)).rejects.toThrow('Server error')

      expect(req.session.updatePhoneNumberForm).toEqual({ phoneId: '10000', phoneNumber: '+44 114-555-9898' })
      expect(res.redirect).not.toHaveBeenCalled()
    })

    it.each([
      ['', 'Enter a phone number'],
      ['   ', 'Enter a phone number'],
      ['not-a-number', 'Enter a phone number using only numbers, spaces, plus signs and dashes'],
    ])(
      'will reject invalid input, retain the form and redirect to the selected phone number: %s',
      async (phoneNumber, text) => {
        req.body.phoneNumber = phoneNumber

        await controller.submitUpdatePhone(req, res)

        expect(prisonRegisterService.updateCourtPhoneNumber).not.toHaveBeenCalled()
        expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#phoneNumber', text }])
        expect(res.redirect).toHaveBeenCalledWith('/court-register/phone/update?id=SHFCC&phoneId=10000')
        expect(req.session.updatePhoneNumberForm).toEqual({ phoneId: '10000', phoneNumber: phoneNumber.trim() })
      },
    )
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
        success: true,
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

      expect(res.redirect).toHaveBeenCalledWith('/court-register/details?id=SHFCC&action=UPDATED')
    })

    it('will clear the form from the session once the email address has been updated', async () => {
      req.session.updateEmailAddressForm = { emailId: 10000, emailAddress: 'previous@example.com' }

      await controller.submitUpdateEmail(req, res)

      expect(req.session.updateEmailAddressForm).toBeUndefined()
    })

    it('will retain the form and show the API user message when the email update is rejected', async () => {
      req.body.emailAddress = '  sheffield.court.updated@example.com  '
      prisonRegisterService.updateCourtEmailAddress.mockResolvedValue({
        success: false,
        userMessage: 'This email address already exists',
      })

      await controller.submitUpdateEmail(req, res)

      expect(req.session.updateEmailAddressForm).toEqual({
        emailId: '10000',
        emailAddress: 'sheffield.court.updated@example.com',
      })
      expect(req.flash).toHaveBeenCalledWith('errors', [
        { href: '#emailAddress', text: 'This email address already exists' },
      ])
      expect(res.redirect).toHaveBeenCalledWith('/court-register/email/update?id=SHFCC&emailId=10000')
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

  describe('updateNameDescription', () => {
    beforeEach(() => {
      prisonRegisterService.getCourt.mockResolvedValue(
        data.court({ courtId: 'SHFCC', courtName: 'Sheffield Crown Court', description: 'Sheffield Main Crown Court' }),
      )
      req.query.id = 'SHFCC'
    })

    it('will get the court using the court Id and username', async () => {
      res.locals.user = { username: 'tom' }

      await controller.updateNameDescription(req, res)

      expect(prisonRegisterService.getCourt).toHaveBeenCalledWith({ username: 'tom' }, 'SHFCC')
    })

    it('will render the update page prefilled with the current name and description', async () => {
      ;(req.flash as jest.Mock).mockReturnValue([])

      await controller.updateNameDescription(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/components/edit/updateAgencyNameDescription', {
        name: 'Sheffield Crown Court',
        navigation: { cancelButton: '/court-register/details?id=SHFCC' },
        errors: [],
        form: { name: 'Sheffield Crown Court', description: 'Sheffield Main Crown Court' },
      })
    })

    it('will use an empty description when the court does not have one', async () => {
      ;(req.flash as jest.Mock).mockReturnValue([])
      prisonRegisterService.getCourt.mockResolvedValue(
        data.court({ courtName: 'Sheffield Crown Court', description: null }),
      )

      await controller.updateNameDescription(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'pages/components/edit/updateAgencyNameDescription',
        expect.objectContaining({ form: { name: 'Sheffield Crown Court', description: '' } }),
      )
    })

    it('will redisplay the submitted values when there are validation errors', async () => {
      const errors = [{ href: '#description', text: 'Enter a description' }]
      ;(req.flash as jest.Mock).mockReturnValue(errors)
      req.session.updateNameDescriptionForm = { name: 'New name', description: '' }

      await controller.updateNameDescription(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'pages/components/edit/updateAgencyNameDescription',
        expect.objectContaining({ errors, form: { name: 'New name', description: '' } }),
      )
    })

    it('will clear any previous form when there are no errors', async () => {
      ;(req.flash as jest.Mock).mockReturnValue([])
      req.session.updateNameDescriptionForm = { name: 'Old', description: 'Old' }

      await controller.updateNameDescription(req, res)

      expect(req.session.updateNameDescriptionForm).toBeUndefined()
      expect(res.render).toHaveBeenCalledWith(
        'pages/components/edit/updateAgencyNameDescription',
        expect.objectContaining({
          form: { name: 'Sheffield Crown Court', description: 'Sheffield Main Crown Court' },
        }),
      )
    })
  })

  describe('submitUpdateNameDescription', () => {
    beforeEach(() => {
      prisonRegisterService.getCourt.mockResolvedValue(
        data.court({
          courtId: 'SHFCC',
          courtName: 'Sheffield Crown Court',
          description: 'Sheffield Main Crown Court',
          active: true,
          cjitCode: 'C00SH00',
          accessibleAccess: 'NONE',
          courtType: { code: 'CC', description: 'Crown Court' },
        }),
      )
      prisonRegisterService.updateCourtDetails.mockResolvedValue({ success: true })
      req.query.id = 'SHFCC'
      req.body = { name: '  Sheffield Crown Court Updated  ', description: '  Updated description  ' }
    })

    it('will update the court with all existing fields plus the new name and description', async () => {
      res.locals.user = { username: 'tom' }

      await controller.submitUpdateNameDescription(req, res)

      expect(prisonRegisterService.getCourt).toHaveBeenCalledWith({ username: 'tom' }, 'SHFCC')
      expect(prisonRegisterService.updateCourtDetails).toHaveBeenCalledWith({ username: 'tom' }, 'SHFCC', {
        courtName: 'Sheffield Crown Court Updated',
        description: 'Updated description',
        active: true,
        inactiveDate: undefined,
        cjitCode: 'C00SH00',
        accessibleAccess: 'NONE',
        areaCode: 'YH',
        regionCode: 'YH',
        geographicalAreaCode: 'YH',
        localAuthorityCode: 'YH',
        payrollRegionCode: 'YH',
        courtTypeCode: 'CC',
      })
    })

    it('will redirect to the court details page and clear the form', async () => {
      await controller.submitUpdateNameDescription(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/court-register/details?id=SHFCC&action=UPDATED')
      expect(req.session.updateNameDescriptionForm).toBeUndefined()
    })

    it('will retain the form and show the API user message when the update is rejected', async () => {
      prisonRegisterService.updateCourtDetails.mockResolvedValue({
        success: false,
        userMessage: 'Court name already in use',
      })

      await controller.submitUpdateNameDescription(req, res)

      expect(req.session.updateNameDescriptionForm).toEqual({
        name: 'Sheffield Crown Court Updated',
        description: 'Updated description',
      })
      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#name', text: 'Court name already in use' }])
      expect(res.redirect).toHaveBeenCalledWith('/court-register/name-description/update?id=SHFCC')
    })

    it('will keep the form in the session when updating fails unexpectedly', async () => {
      prisonRegisterService.updateCourtDetails.mockRejectedValue(new Error('Server error'))

      await expect(controller.submitUpdateNameDescription(req, res)).rejects.toThrow('Server error')

      expect(req.session.updateNameDescriptionForm).toEqual({
        name: 'Sheffield Crown Court Updated',
        description: 'Updated description',
      })
      expect(res.redirect).not.toHaveBeenCalled()
    })

    it('will not update the court when the name and description are missing', async () => {
      req.body = { name: '  ', description: '' }

      await controller.submitUpdateNameDescription(req, res)

      expect(prisonRegisterService.updateCourtDetails).not.toHaveBeenCalled()
      expect(req.flash).toHaveBeenCalledWith('errors', [
        { href: '#name', text: 'Enter a name' },
        { href: '#description', text: 'Enter a description' },
      ])
      expect(res.redirect).toHaveBeenCalledWith('/court-register/name-description/update?id=SHFCC')
      expect(req.session.updateNameDescriptionForm).toEqual({ name: '', description: '' })
    })
  })

  describe('deletePhone', () => {
    beforeEach(() => {
      prisonRegisterService.getCourt.mockResolvedValue(
        data.court({
          courtId: 'SHFCC',
          courtName: 'Sheffield Crown Court',
          phoneNumbers: [
            { id: 1, number: '0114 555 1111' },
            { id: 10000, number: '0114 555 9898' },
          ],
        }),
      )
      req.query.id = 'SHFCC'
      req.query.phoneId = '10000'
    })

    it('will get the court using the court Id and username', async () => {
      res.locals.user = { username: 'tom' }

      await controller.deletePhone(req, res)

      expect(prisonRegisterService.getCourt).toHaveBeenCalledWith({ username: 'tom' }, 'SHFCC')
    })

    it('will render the delete phone page with the court, selected phone number and cancel link', async () => {
      await controller.deletePhone(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/components/edit/deleteAgencyPhone', {
        name: 'Sheffield Crown Court',
        navigation: { cancelButton: '/court-register/details?id=SHFCC' },
        phoneNumber: '0114 555 9898',
        phoneId: 10000,
      })
    })

    it('will not call the delete API when showing the confirmation page', async () => {
      await controller.deletePhone(req, res)

      expect(prisonRegisterService.deleteCourtPhoneNumber).not.toHaveBeenCalled()
    })
  })

  describe('submitDeletePhone', () => {
    beforeEach(() => {
      req.query.id = 'SHFCC'
      req.body = { phoneId: '10000' }
    })

    it('will delete the phone number using the court, phone and user details', async () => {
      res.locals.user = { username: 'tom' }

      await controller.submitDeletePhone(req, res)

      expect(prisonRegisterService.deleteCourtPhoneNumber).toHaveBeenCalledWith({ username: 'tom' }, 'SHFCC', 10000)
    })

    it('will redirect to the court details page after deleting the phone number', async () => {
      await controller.submitDeletePhone(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/court-register/details?id=SHFCC&action=UPDATED')
    })

    it('will not redirect when the delete fails', async () => {
      prisonRegisterService.deleteCourtPhoneNumber.mockRejectedValue(new Error('Server error'))

      await expect(controller.submitDeletePhone(req, res)).rejects.toThrow('Server error')

      expect(res.redirect).not.toHaveBeenCalled()
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

      expect(res.redirect).toHaveBeenCalledWith('/court-register/details?id=SHFCC&action=UPDATED')
    })

    it('will not redirect when the delete fails', async () => {
      prisonRegisterService.deleteCourtEmailAddress.mockRejectedValue(new Error('Server error'))

      await expect(controller.submitDeleteEmail(req, res)).rejects.toThrow('Server error')

      expect(res.redirect).not.toHaveBeenCalled()
    })
  })
})
