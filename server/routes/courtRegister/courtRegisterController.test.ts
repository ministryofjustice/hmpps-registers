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

  describe('updateCjitCode', () => {
    beforeEach(() => {
      prisonRegisterService.getCourt.mockResolvedValue(
        data.court({ courtId: 'SHFCC', courtName: 'Sheffield Crown Court', cjitCode: 'C00SH00' }),
      )
      req.query.id = 'SHFCC'
      ;(req.flash as jest.Mock).mockReturnValue([])
    })

    it('fetches the court with the user context and renders the current code and cancel link', async () => {
      res.locals.user = { username: 'tom' }

      await controller.updateCjitCode(req, res)

      expect(prisonRegisterService.getCourt).toHaveBeenCalledWith({ username: 'tom' }, 'SHFCC')
      expect(req.flash).toHaveBeenCalledWith('errors')
      expect(res.render).toHaveBeenCalledWith('pages/components/edit/updateAgencyCjitCode', {
        name: 'Sheffield Crown Court',
        navigation: { cancelButton: '/court-register/details?id=SHFCC' },
        errors: [],
        cjitCode: 'C00SH00',
      })
    })

    it.each([null, undefined])('prefills an empty code when the current value is %j', async cjitCode => {
      const court = data.court({})
      court.cjitCode = cjitCode
      prisonRegisterService.getCourt.mockResolvedValue(court)

      await controller.updateCjitCode(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'pages/components/edit/updateAgencyCjitCode',
        expect.objectContaining({ cjitCode: '' }),
      )
    })

    it.each([{ errors: [] }, { errors: undefined }])(
      'clears a stale form when there are no errors: %j',
      async ({ errors }) => {
        ;(req.flash as jest.Mock).mockReturnValue(errors)
        req.session.updateCjitCodeForm = { cjitCode: 'OLD' }

        await controller.updateCjitCode(req, res)

        expect(req.session.updateCjitCodeForm).toBeUndefined()
        expect(res.render).toHaveBeenCalledWith(
          'pages/components/edit/updateAgencyCjitCode',
          expect.objectContaining({ errors: [], cjitCode: 'C00SH00' }),
        )
      },
    )

    it.each([{ cjitCode: '1234567890123' }, { cjitCode: '' }, {}])(
      'retains the submitted code rather than the current value when errors exist: %j',
      async form => {
        const errors = [{ href: '#cjitCode', text: 'Could not update CJIT code' }]
        ;(req.flash as jest.Mock).mockReturnValue(errors)
        req.session.updateCjitCodeForm = form

        await controller.updateCjitCode(req, res)

        expect(req.session.updateCjitCodeForm).toEqual(form)
        expect(res.render).toHaveBeenCalledWith(
          'pages/components/edit/updateAgencyCjitCode',
          expect.objectContaining({ errors, cjitCode: form.cjitCode }),
        )
      },
    )

    it('uses the current code when errors exist but there is no saved form', async () => {
      const errors = [{ href: '#cjitCode', text: 'Could not update CJIT code' }]
      ;(req.flash as jest.Mock).mockReturnValue(errors)

      await controller.updateCjitCode(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'pages/components/edit/updateAgencyCjitCode',
        expect.objectContaining({ errors, cjitCode: 'C00SH00' }),
      )
    })
  })

  describe('submitUpdateCjitCode', () => {
    beforeEach(() => {
      prisonRegisterService.getCourt.mockResolvedValue(data.court({ cjitCode: 'C00SH00' }))
      prisonRegisterService.updateCourtDetails.mockResolvedValue({ success: true })
      req.query.id = 'SHFCC'
      req.body = { cjitCode: 'NEWCODE' }
    })

    it('fetches the latest court and preserves every other update field with the user context', async () => {
      res.locals.user = { username: 'tom' }
      prisonRegisterService.getCourt.mockResolvedValue(
        data.court({
          courtName: 'Latest court name',
          description: 'Latest description',
          active: false,
          inactiveDate: '2026-10-01',
          courtType: { code: 'MC', description: 'Magistrates Court' },
          accessibleAccess: 'BY_ARRANGEMENT_ONLY',
          area: { code: 'AREA', description: 'Area' },
          region: { code: 'REGION', description: 'Region' },
          geographicalArea: { code: 'GEO', description: 'Geographical area' },
          localAuthority: { code: 'LOCAL', description: 'Local authority' },
          payrollRegion: { code: 'PAYROLL', description: 'Payroll region' },
        }),
      )

      await controller.submitUpdateCjitCode(req, res)

      expect(prisonRegisterService.getCourt).toHaveBeenCalledWith({ username: 'tom' }, 'SHFCC')
      expect(prisonRegisterService.updateCourtDetails).toHaveBeenCalledWith({ username: 'tom' }, 'SHFCC', {
        courtName: 'Latest court name',
        description: 'Latest description',
        active: false,
        inactiveDate: '2026-10-01',
        courtTypeCode: 'MC',
        accessibleAccess: 'BY_ARRANGEMENT_ONLY',
        areaCode: 'AREA',
        regionCode: 'REGION',
        geographicalAreaCode: 'GEO',
        localAuthorityCode: 'LOCAL',
        payrollRegionCode: 'PAYROLL',
        cjitCode: 'NEWCODE',
      })
    })

    it('redirects to court details and clears the form only after a successful update', async () => {
      req.session.updateCjitCodeForm = { cjitCode: 'OLD' }

      await controller.submitUpdateCjitCode(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/court-register/details?id=SHFCC&action=UPDATED')
      expect(req.session.updateCjitCodeForm).toBeUndefined()
      expect(req.flash).not.toHaveBeenCalled()
    })

    it('trims before validating so a padded 12-character code is accepted', async () => {
      req.body.cjitCode = '  123456789012  '

      await controller.submitUpdateCjitCode(req, res)

      expect(prisonRegisterService.updateCourtDetails).toHaveBeenCalledWith(
        {},
        'SHFCC',
        expect.objectContaining({ cjitCode: '123456789012' }),
      )
      expect(res.redirect).toHaveBeenCalledWith('/court-register/details?id=SHFCC&action=UPDATED')
    })

    it.each([{ cjitCode: '' }, { cjitCode: '   ' }, {}])(
      'clears the code for a blank or missing value: %j',
      async body => {
        req.body = body

        await controller.submitUpdateCjitCode(req, res)

        expect(prisonRegisterService.updateCourtDetails).toHaveBeenCalledWith(
          {},
          'SHFCC',
          expect.objectContaining({ cjitCode: '' }),
        )
        expect(req.session.updateCjitCodeForm).toBeUndefined()
        expect(res.redirect).toHaveBeenCalledWith('/court-register/details?id=SHFCC&action=UPDATED')
      },
    )

    it('rejects a 13-character code before fetching or updating the court and retains the trimmed form', async () => {
      req.body.cjitCode = '  1234567890123  '

      await controller.submitUpdateCjitCode(req, res)

      expect(prisonRegisterService.getCourt).not.toHaveBeenCalled()
      expect(prisonRegisterService.updateCourtDetails).not.toHaveBeenCalled()
      expect(req.session.updateCjitCodeForm).toEqual({ cjitCode: '1234567890123' })
      expect(req.flash).toHaveBeenCalledWith('errors', [
        { href: '#cjitCode', text: 'CJIT code must be 12 characters or fewer' },
      ])
      expect(res.redirect).toHaveBeenCalledWith('/court-register/cjit-code/update?id=SHFCC')
    })

    it.each([{ cjitCode: '  NEWCODE  ' }, { cjitCode: '' }, {}])(
      'retains the submitted form and flashes the API user message when rejected: %j',
      async body => {
        req.body = body
        prisonRegisterService.updateCourtDetails.mockResolvedValue({
          success: false,
          userMessage: 'CJIT code could not be updated',
        })

        await controller.submitUpdateCjitCode(req, res)

        expect(req.session.updateCjitCodeForm).toEqual(
          body.cjitCode === undefined ? {} : { cjitCode: body.cjitCode.trim() },
        )
        expect(req.flash).toHaveBeenCalledWith('errors', [
          { href: '#cjitCode', text: 'CJIT code could not be updated' },
        ])
        expect(res.redirect).toHaveBeenCalledWith('/court-register/cjit-code/update?id=SHFCC')
      },
    )

    it.each(['getCourt', 'updateCourtDetails'] as const)(
      'retains the trimmed form and propagates unexpected %s errors',
      async method => {
        const error = new Error('Server error')
        req.body.cjitCode = '  NEWCODE  '
        prisonRegisterService[method].mockRejectedValue(error)

        await expect(controller.submitUpdateCjitCode(req, res)).rejects.toBe(error)

        expect(req.session.updateCjitCodeForm).toEqual({ cjitCode: 'NEWCODE' })
        expect(res.redirect).not.toHaveBeenCalled()
        expect(req.flash).not.toHaveBeenCalled()
        if (method === 'getCourt') {
          expect(prisonRegisterService.updateCourtDetails).not.toHaveBeenCalled()
        }
      },
    )
  })

  describe('updateActive', () => {
    beforeEach(() => {
      jest.useFakeTimers({
        now: new Date(2026, 9, 15, 9, 0),
        doNotFake: ['nextTick', 'setImmediate', 'queueMicrotask'],
      })
      prisonRegisterService.getCourt.mockResolvedValue(
        data.court({ courtId: 'SHFCC', courtName: 'Sheffield Crown Court', active: true }),
      )
      req.query.id = 'SHFCC'
      ;(req.flash as jest.Mock).mockReturnValue([])
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('fetches the court with the user context and renders the current status, today and cancel link', async () => {
      res.locals.user = { username: 'tom' }

      await controller.updateActive(req, res)

      expect(prisonRegisterService.getCourt).toHaveBeenCalledWith({ username: 'tom' }, 'SHFCC')
      expect(req.flash).toHaveBeenCalledWith('errors')
      expect(res.render).toHaveBeenCalledWith('pages/components/edit/updateAgencyActive', {
        name: 'Sheffield Crown Court',
        navigation: { cancelButton: '/court-register/details?id=SHFCC' },
        errors: [],
        form: { active: 'true', inactiveDay: '15', inactiveMonth: '10', inactiveYear: '2026' },
      })
    })

    it('preselects inactive and prefills the existing inactive date', async () => {
      prisonRegisterService.getCourt.mockResolvedValue(data.court({ active: false, inactiveDate: '2025-03-09' }))

      await controller.updateActive(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'pages/components/edit/updateAgencyActive',
        expect.objectContaining({
          form: { active: 'false', inactiveDay: '9', inactiveMonth: '3', inactiveYear: '2025' },
        }),
      )
    })

    it.each([null, undefined])('defaults the date to today when the inactive date is %j', async inactiveDate => {
      const court = data.court({ active: false })
      court.inactiveDate = inactiveDate
      prisonRegisterService.getCourt.mockResolvedValue(court)

      await controller.updateActive(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'pages/components/edit/updateAgencyActive',
        expect.objectContaining({
          form: { active: 'false', inactiveDay: '15', inactiveMonth: '10', inactiveYear: '2026' },
        }),
      )
    })

    it.each([{ errors: [] }, { errors: undefined }])(
      'clears a stale form on a fresh visit with no errors: %j',
      async ({ errors }) => {
        ;(req.flash as jest.Mock).mockReturnValue(errors)
        req.session.updateActiveForm = { active: 'false', inactiveDay: '1', inactiveMonth: '1', inactiveYear: '2020' }

        await controller.updateActive(req, res)

        expect(req.session.updateActiveForm).toBeUndefined()
        expect(res.render).toHaveBeenCalledWith(
          'pages/components/edit/updateAgencyActive',
          expect.objectContaining({
            errors: [],
            form: { active: 'true', inactiveDay: '15', inactiveMonth: '10', inactiveYear: '2026' },
          }),
        )
      },
    )

    it.each([
      { active: 'false', inactiveDay: '31', inactiveMonth: '2', inactiveYear: '2026' },
      { active: 'false', inactiveDay: '', inactiveMonth: '', inactiveYear: '' },
      {},
    ])('retains the submitted form, including blank fields, when errors exist: %j', async form => {
      const errors = [{ href: '#inactiveDate', text: 'Date deactivated must be a real date' }]
      ;(req.flash as jest.Mock).mockReturnValue(errors)
      req.session.updateActiveForm = form

      await controller.updateActive(req, res)

      expect(req.session.updateActiveForm).toEqual(form)
      expect(res.render).toHaveBeenCalledWith('pages/components/edit/updateAgencyActive', {
        name: 'Sheffield Crown Court',
        navigation: { cancelButton: '/court-register/details?id=SHFCC' },
        errors,
        form,
      })
    })

    it('uses the current values when errors exist but there is no saved form', async () => {
      const errors = [{ href: '#active', text: 'Court could not be updated' }]
      ;(req.flash as jest.Mock).mockReturnValue(errors)

      await controller.updateActive(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'pages/components/edit/updateAgencyActive',
        expect.objectContaining({
          errors,
          form: { active: 'true', inactiveDay: '15', inactiveMonth: '10', inactiveYear: '2026' },
        }),
      )
    })
  })

  describe('submitUpdateActive', () => {
    const latestCourt = () =>
      data.court({
        courtName: 'Latest court name',
        description: 'Latest description',
        active: false,
        inactiveDate: '2025-01-01',
        cjitCode: 'LATEST',
        courtType: { code: 'MC', description: 'Magistrates Court' },
        accessibleAccess: 'BY_ARRANGEMENT_ONLY',
        area: { code: 'AREA', description: 'Area' },
        region: { code: 'REGION', description: 'Region' },
        geographicalArea: { code: 'GEO', description: 'Geographical area' },
        localAuthority: { code: 'LOCAL', description: 'Local authority' },
        payrollRegion: { code: 'PAYROLL', description: 'Payroll region' },
      })
    const preservedFields = {
      courtName: 'Latest court name',
      description: 'Latest description',
      cjitCode: 'LATEST',
      courtTypeCode: 'MC',
      accessibleAccess: 'BY_ARRANGEMENT_ONLY',
      areaCode: 'AREA',
      regionCode: 'REGION',
      geographicalAreaCode: 'GEO',
      localAuthorityCode: 'LOCAL',
      payrollRegionCode: 'PAYROLL',
    }

    beforeEach(() => {
      prisonRegisterService.getCourt.mockResolvedValue(latestCourt())
      prisonRegisterService.updateCourtDetails.mockResolvedValue({ success: true })
      req.query.id = 'SHFCC'
      req.body = { active: 'false', inactiveDay: '15', inactiveMonth: '10', inactiveYear: '2026' }
    })

    it('fetches the latest court with the user context and preserves every other field when deactivating', async () => {
      res.locals.user = { username: 'tom' }

      await controller.submitUpdateActive(req, res)

      expect(prisonRegisterService.getCourt).toHaveBeenCalledWith({ username: 'tom' }, 'SHFCC')
      expect(prisonRegisterService.updateCourtDetails).toHaveBeenCalledTimes(1)
      expect(prisonRegisterService.updateCourtDetails.mock.calls[0]).toStrictEqual([
        { username: 'tom' },
        'SHFCC',
        { ...preservedFields, active: false, inactiveDate: '2026-10-15' },
      ])
    })

    it('omits the inactive date property entirely when activating, ignoring any submitted date', async () => {
      req.body = { active: 'true', inactiveDay: '31', inactiveMonth: '2', inactiveYear: 'bad' }

      await controller.submitUpdateActive(req, res)

      const update = prisonRegisterService.updateCourtDetails.mock.calls[0][2]
      expect(update).toStrictEqual({ ...preservedFields, active: true })
      expect(Object.prototype.hasOwnProperty.call(update, 'inactiveDate')).toBe(false)
      expect(res.redirect).toHaveBeenCalledWith('/court-register/details?id=SHFCC&action=UPDATED')
    })

    it('assigns the submitted date when the court has no existing inactive date', async () => {
      prisonRegisterService.getCourt.mockResolvedValue(data.court({ active: true, inactiveDate: undefined }))
      req.body = { active: 'false', inactiveDay: '29', inactiveMonth: '2', inactiveYear: '2024' }

      await controller.submitUpdateActive(req, res)

      expect(prisonRegisterService.updateCourtDetails).toHaveBeenCalledWith(
        {},
        'SHFCC',
        expect.objectContaining({ active: false, inactiveDate: '2024-02-29' }),
      )
    })

    it('trims the submitted values before validating and retains the trimmed form until success', async () => {
      req.body = { active: ' false ', inactiveDay: ' 05 ', inactiveMonth: ' 3 ', inactiveYear: ' 2026 ' }
      prisonRegisterService.updateCourtDetails.mockImplementation(async () => {
        expect(req.session.updateActiveForm).toEqual({
          active: 'false',
          inactiveDay: '05',
          inactiveMonth: '3',
          inactiveYear: '2026',
        })
        return { success: true }
      })

      await controller.submitUpdateActive(req, res)

      expect(prisonRegisterService.updateCourtDetails).toHaveBeenCalledWith(
        {},
        'SHFCC',
        expect.objectContaining({ active: false, inactiveDate: '2026-03-05' }),
      )
    })

    it('redirects to court details and clears the form only after a successful update', async () => {
      req.session.updateActiveForm = { active: 'true' }

      await controller.submitUpdateActive(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/court-register/details?id=SHFCC&action=UPDATED')
      expect(req.session.updateActiveForm).toBeUndefined()
      expect(req.flash).not.toHaveBeenCalled()
    })

    it.each([
      [{}, { href: '#active', text: 'Select active or inactive' }],
      [{ active: '  ' }, { href: '#active', text: 'Select active or inactive' }],
      [
        { active: 'false', inactiveDay: ' ', inactiveMonth: '10', inactiveYear: '2026' },
        { href: '#inactiveDate', text: 'Enter the date deactivated, including a day, month and year' },
      ],
      [
        { active: 'false', inactiveDay: '31', inactiveMonth: '4', inactiveYear: '2026' },
        { href: '#inactiveDate', text: 'Date deactivated must be a real date' },
      ],
      [
        { active: 'false', inactiveDay: '1', inactiveMonth: '1', inactiveYear: '26' },
        { href: '#inactiveDate', text: 'Date deactivated must be a real date' },
      ],
    ])('rejects invalid input before fetching or updating and retains the trimmed form: %j', async (body, error) => {
      req.body = body

      await controller.submitUpdateActive(req, res)

      expect(prisonRegisterService.getCourt).not.toHaveBeenCalled()
      expect(prisonRegisterService.updateCourtDetails).not.toHaveBeenCalled()
      expect(req.session.updateActiveForm).toEqual(
        Object.fromEntries(Object.entries(body).map(([key, value]) => [key, value.trim()])),
      )
      expect(req.flash).toHaveBeenCalledWith('errors', [error])
      expect(res.redirect).toHaveBeenCalledWith('/court-register/active/update?id=SHFCC')
    })

    it.each([{ active: 'true' }, { active: ' false ', inactiveDay: '15', inactiveMonth: '10', inactiveYear: '2026' }])(
      'retains the submitted form and flashes the API user message when rejected: %j',
      async body => {
        req.body = body
        prisonRegisterService.updateCourtDetails.mockResolvedValue({
          success: false,
          userMessage: 'Court could not be updated',
        })

        await controller.submitUpdateActive(req, res)

        expect(req.session.updateActiveForm).toEqual({ ...body, active: body.active.trim() })
        expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#active', text: 'Court could not be updated' }])
        expect(res.redirect).toHaveBeenCalledWith('/court-register/active/update?id=SHFCC')
      },
    )

    it.each(['getCourt', 'updateCourtDetails'] as const)(
      'retains the trimmed form and propagates unexpected %s errors',
      async method => {
        const error = new Error('Server error')
        req.body = { active: ' true ' }
        prisonRegisterService[method].mockRejectedValue(error)

        await expect(controller.submitUpdateActive(req, res)).rejects.toBe(error)

        expect(req.session.updateActiveForm).toEqual({ active: 'true' })
        expect(res.redirect).not.toHaveBeenCalled()
        expect(req.flash).not.toHaveBeenCalled()
        if (method === 'getCourt') {
          expect(prisonRegisterService.updateCourtDetails).not.toHaveBeenCalled()
        }
      },
    )
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

  describe('updateArea', () => {
    beforeEach(() => {
      prisonRegisterService.getCourt.mockResolvedValue(data.court({}))
      req.query.id = 'SHFCC'
      ;(req.flash as jest.Mock).mockReturnValue([])
    })

    it('loads the court with the username and prefills the current area', async () => {
      res.locals.user = { username: 'tom' }

      await controller.updateArea(req, res)

      expect(prisonRegisterService.getCourt).toHaveBeenCalledWith({ username: 'tom' }, 'SHFCC')
      expect(req.flash).toHaveBeenCalledWith('errors')
      expect(res.render).toHaveBeenCalledWith('pages/components/edit/updateAgencyArea', {
        name: 'Sheffield Crown Court',
        navigation: { cancelButton: '/court-register/details?id=SHFCC' },
        errors: [],
        form: { areaCode: 'YH', areaDescription: 'Yorkshire and the Humber' },
      })
      expect(prisonRegisterService.getAreas).not.toHaveBeenCalled()
    })

    it('prefills blank fields when the court has no area', async () => {
      prisonRegisterService.getCourt.mockResolvedValue(data.court({ area: null }))

      await controller.updateArea(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'pages/components/edit/updateAgencyArea',
        expect.objectContaining({ form: { areaCode: '', areaDescription: '' } }),
      )
    })

    it.each([
      { areaCode: 'INVALID', areaDescription: 'Invalid area' },
      { areaCode: '', areaDescription: '' },
    ])('retains the submitted form after an error: %j', async form => {
      const errors = [{ href: '#area', text: 'Area cannot be changed' }]
      ;(req.flash as jest.Mock).mockReturnValue(errors)
      req.session.updateAreaForm = form

      await controller.updateArea(req, res)

      expect(req.session.updateAreaForm).toEqual(form)
      expect(res.render).toHaveBeenCalledWith(
        'pages/components/edit/updateAgencyArea',
        expect.objectContaining({ form, errors }),
      )
    })

    it.each([{ errors: [] }, { errors: undefined }])(
      'clears stale form data when there are no errors: %j',
      async ({ errors }) => {
        ;(req.flash as jest.Mock).mockReturnValue(errors)
        req.session.updateAreaForm = { areaCode: 'NW', areaDescription: 'North West' }

        await controller.updateArea(req, res)

        expect(req.session.updateAreaForm).toBeUndefined()
        expect(res.render).toHaveBeenCalledWith(
          'pages/components/edit/updateAgencyArea',
          expect.objectContaining({
            errors: [],
            form: { areaCode: 'YH', areaDescription: 'Yorkshire and the Humber' },
          }),
        )
      },
    )

    it('uses the current area when there are errors but no saved form', async () => {
      ;(req.flash as jest.Mock).mockReturnValue([{ href: '#area', text: 'Area cannot be changed' }])

      await controller.updateArea(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'pages/components/edit/updateAgencyArea',
        expect.objectContaining({ form: { areaCode: 'YH', areaDescription: 'Yorkshire and the Humber' } }),
      )
    })

    it('propagates court loading errors without rendering or discarding the form', async () => {
      const form = { areaCode: 'NW', areaDescription: 'North West' }
      req.session.updateAreaForm = form
      prisonRegisterService.getCourt.mockRejectedValue(new Error('Court unavailable'))

      await expect(controller.updateArea(req, res)).rejects.toThrow('Court unavailable')

      expect(req.session.updateAreaForm).toEqual(form)
      expect(res.render).not.toHaveBeenCalled()
    })
  })

  describe('submitUpdateArea', () => {
    const latestCourt = data.court({
      courtName: 'Updated court name',
      description: 'Latest court description',
      active: false,
      inactiveDate: '2026-10-01',
      cjitCode: 'LATEST',
      accessibleAccess: 'ACCESSIBLE',
      area: { code: 'YH', description: 'Yorkshire and the Humber' },
      region: { code: 'REGION', description: 'Region' },
      geographicalArea: { code: 'GEO', description: 'Geographical area' },
      localAuthority: { code: 'LOCAL', description: 'Local authority' },
      payrollRegion: { code: 'PAYROLL', description: 'Payroll region' },
      courtType: { code: 'MC', description: 'Magistrates Court' },
    })
    const preservedFields = {
      courtName: 'Updated court name',
      description: 'Latest court description',
      active: false,
      inactiveDate: '2026-10-01',
      cjitCode: 'LATEST',
      accessibleAccess: 'ACCESSIBLE',
      regionCode: 'REGION',
      geographicalAreaCode: 'GEO',
      localAuthorityCode: 'LOCAL',
      payrollRegionCode: 'PAYROLL',
      courtTypeCode: 'MC',
    }

    beforeEach(() => {
      req.query.id = 'SHFCC'
      req.body = { areaCode: ' NW ', areaDescription: ' North West ' }
      res.locals.user = { username: 'tom' }
      prisonRegisterService.getAreas.mockResolvedValue([{ code: 'NW', description: 'North West' }])
      prisonRegisterService.getCourt.mockResolvedValue(latestCourt)
      prisonRegisterService.updateCourtDetails.mockResolvedValue({ success: true })
    })

    it('trims the form, validates the code, then fetches the latest court and preserves all other fields', async () => {
      prisonRegisterService.getAreas.mockImplementation(async () => {
        expect(req.session.updateAreaForm).toEqual({ areaCode: 'NW', areaDescription: 'North West' })
        expect(prisonRegisterService.getCourt).not.toHaveBeenCalled()
        return [{ code: 'NW', description: 'North West' }]
      })
      prisonRegisterService.getCourt.mockImplementation(async () => {
        expect(prisonRegisterService.getAreas).toHaveBeenCalledTimes(1)
        expect(prisonRegisterService.updateCourtDetails).not.toHaveBeenCalled()
        return latestCourt
      })
      prisonRegisterService.updateCourtDetails.mockImplementation(async () => {
        expect(req.session.updateAreaForm).toEqual({ areaCode: 'NW', areaDescription: 'North West' })
        return { success: true }
      })

      await controller.submitUpdateArea(req, res)

      expect(prisonRegisterService.getAreas).toHaveBeenCalledWith({ username: 'tom' })
      expect(prisonRegisterService.getCourt).toHaveBeenCalledWith({ username: 'tom' }, 'SHFCC')
      expect(prisonRegisterService.updateCourtDetails).toHaveBeenCalledWith({ username: 'tom' }, 'SHFCC', {
        ...preservedFields,
        areaCode: 'NW',
      })
      expect(req.session.updateAreaForm).toBeUndefined()
      expect(res.redirect).toHaveBeenCalledWith('/court-register/details?id=SHFCC&action=UPDATED')
      expect(req.flash).not.toHaveBeenCalled()
    })

    it.each([{}, { areaCode: '   ', areaDescription: '   ' }])(
      'clears the area by omitting the areaCode property entirely: %j',
      async body => {
        req.body = body

        await controller.submitUpdateArea(req, res)

        expect(prisonRegisterService.getAreas).not.toHaveBeenCalled()
        expect(prisonRegisterService.updateCourtDetails).toHaveBeenCalledWith(
          { username: 'tom' },
          'SHFCC',
          preservedFields,
        )
        expect(prisonRegisterService.updateCourtDetails.mock.calls[0][2]).not.toHaveProperty('areaCode')
        expect(req.session.updateAreaForm).toBeUndefined()
        expect(res.redirect).toHaveBeenCalledWith('/court-register/details?id=SHFCC&action=UPDATED')
      },
    )

    it('does not use the displayed description as the area code', async () => {
      req.body = { areaCode: 'North West', areaDescription: 'North West' }

      await controller.submitUpdateArea(req, res)

      expect(prisonRegisterService.getCourt).not.toHaveBeenCalled()
      expect(prisonRegisterService.updateCourtDetails).not.toHaveBeenCalled()
      expect(req.session.updateAreaForm).toEqual(req.body)
      expect(req.flash).toHaveBeenCalledWith('errors', [
        { href: '#area', text: 'Select a valid area from the suggestions' },
      ])
      expect(res.redirect).toHaveBeenCalledWith('/court-register/area/update?id=SHFCC')
    })

    it('retains the trimmed invalid form without loading or updating the court', async () => {
      req.body = { areaCode: ' INVALID ', areaDescription: ' Unknown area ' }

      await controller.submitUpdateArea(req, res)

      expect(req.session.updateAreaForm).toEqual({ areaCode: 'INVALID', areaDescription: 'Unknown area' })
      expect(prisonRegisterService.getCourt).not.toHaveBeenCalled()
      expect(prisonRegisterService.updateCourtDetails).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/court-register/area/update?id=SHFCC')
    })

    it.each([
      { areaCode: ' NW ', areaDescription: ' North West ' },
      { areaCode: '', areaDescription: '' },
    ])('retains the form and flashes the API user message on rejection: %j', async body => {
      req.body = body
      prisonRegisterService.updateCourtDetails.mockResolvedValue({ success: false, userMessage: 'Area not allowed' })

      await controller.submitUpdateArea(req, res)

      expect(req.session.updateAreaForm).toEqual({
        areaCode: body.areaCode.trim(),
        areaDescription: body.areaDescription.trim(),
      })
      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#area', text: 'Area not allowed' }])
      expect(res.redirect).toHaveBeenCalledWith('/court-register/area/update?id=SHFCC')
    })

    it.each(['getAreas', 'getCourt', 'updateCourtDetails'] as const)(
      'retains the trimmed form and propagates unexpected %s failures',
      async method => {
        const error = new Error(`${method} unavailable`)
        prisonRegisterService[method].mockRejectedValue(error)

        await expect(controller.submitUpdateArea(req, res)).rejects.toBe(error)

        expect(req.session.updateAreaForm).toEqual({ areaCode: 'NW', areaDescription: 'North West' })
        expect(res.redirect).not.toHaveBeenCalled()
        expect(req.flash).not.toHaveBeenCalled()
        if (method === 'getAreas') expect(prisonRegisterService.getCourt).not.toHaveBeenCalled()
        if (method !== 'updateCourtDetails') {
          expect(prisonRegisterService.updateCourtDetails).not.toHaveBeenCalled()
        }
      },
    )
  })

  describe('updateCourtType', () => {
    beforeEach(() => {
      prisonRegisterService.getCourt.mockResolvedValue(
        data.court({
          courtId: 'SHFCC',
          courtName: 'Sheffield Crown Court',
          courtType: { code: 'CC', description: 'Crown Court' },
        }),
      )
      req.query.id = 'SHFCC'
    })

    const checkedTypes = () =>
      (res.render as jest.Mock).mock.calls[0][1].courtTypes
        .filter((type: { checked: boolean }) => type.checked)
        .map((type: { value: string }) => type.value)

    it('will get the court using the court Id and username', async () => {
      res.locals.user = { username: 'tom' }

      await controller.updateCourtType(req, res)

      expect(prisonRegisterService.getCourt).toHaveBeenCalledWith({ username: 'tom' }, 'SHFCC')
    })

    it('will render the update court type page with all types and the current type checked', async () => {
      ;(req.flash as jest.Mock).mockReturnValue([])

      await controller.updateCourtType(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'pages/court-register/updateCourtType',
        expect.objectContaining({
          name: 'Sheffield Crown Court',
          navigation: { cancelButton: '/court-register/details?id=SHFCC' },
          errors: [],
        }),
      )
      expect((res.render as jest.Mock).mock.calls[0][1].courtTypes).toHaveLength(11)
      expect(checkedTypes()).toEqual(['CC'])
    })

    it('will check nothing when the court has no type', async () => {
      ;(req.flash as jest.Mock).mockReturnValue([])
      prisonRegisterService.getCourt.mockResolvedValue(data.court({ courtType: null }))

      await controller.updateCourtType(req, res)

      expect(checkedTypes()).toEqual([])
    })

    it('will redisplay the submitted type when there are errors', async () => {
      const errors = [{ href: '#courtType', text: 'Court type not allowed' }]
      ;(req.flash as jest.Mock).mockReturnValue(errors)
      req.session.updateCourtTypeForm = { courtType: 'MC' }

      await controller.updateCourtType(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'pages/court-register/updateCourtType',
        expect.objectContaining({ errors }),
      )
      expect(checkedTypes()).toEqual(['MC'])
    })

    it('will check nothing when the submitted form had no type selected', async () => {
      ;(req.flash as jest.Mock).mockReturnValue([{ href: '#courtType', text: 'Select a court type' }])
      req.session.updateCourtTypeForm = { courtType: '' }

      await controller.updateCourtType(req, res)

      expect(checkedTypes()).toEqual([])
    })

    it('will clear any previous form when there are no errors', async () => {
      ;(req.flash as jest.Mock).mockReturnValue([])
      req.session.updateCourtTypeForm = { courtType: 'MC' }

      await controller.updateCourtType(req, res)

      expect(req.session.updateCourtTypeForm).toBeUndefined()
      expect(checkedTypes()).toEqual(['CC'])
    })
  })

  describe('submitUpdateCourtType', () => {
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
      req.body = { courtType: 'MC' }
    })

    it('will update the court with all existing fields and the new court type', async () => {
      res.locals.user = { username: 'tom' }

      await controller.submitUpdateCourtType(req, res)

      expect(prisonRegisterService.updateCourtDetails).toHaveBeenCalledWith({ username: 'tom' }, 'SHFCC', {
        courtName: 'Sheffield Crown Court',
        description: 'Sheffield Main Crown Court',
        active: true,
        inactiveDate: undefined,
        cjitCode: 'C00SH00',
        accessibleAccess: 'NONE',
        areaCode: 'YH',
        regionCode: 'YH',
        geographicalAreaCode: 'YH',
        localAuthorityCode: 'YH',
        payrollRegionCode: 'YH',
        courtTypeCode: 'MC',
      })
    })

    it('will redirect to the court details page and clear the form', async () => {
      await controller.submitUpdateCourtType(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/court-register/details?id=SHFCC&action=UPDATED')
      expect(req.session.updateCourtTypeForm).toBeUndefined()
    })

    it('will retain the form and show the API user message when the update is rejected', async () => {
      prisonRegisterService.updateCourtDetails.mockResolvedValue({ success: false, userMessage: 'Not allowed' })

      await controller.submitUpdateCourtType(req, res)

      expect(req.session.updateCourtTypeForm).toEqual({ courtType: 'MC' })
      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#courtType', text: 'Not allowed' }])
      expect(res.redirect).toHaveBeenCalledWith('/court-register/court-type/update?id=SHFCC')
    })

    it('will keep the form in the session when updating fails unexpectedly', async () => {
      prisonRegisterService.updateCourtDetails.mockRejectedValue(new Error('Server error'))

      await expect(controller.submitUpdateCourtType(req, res)).rejects.toThrow('Server error')

      expect(req.session.updateCourtTypeForm).toEqual({ courtType: 'MC' })
      expect(res.redirect).not.toHaveBeenCalled()
    })

    it.each([{}, { courtType: 'XX' }])('will not update the court when the type is invalid: %j', async body => {
      req.body = body

      await controller.submitUpdateCourtType(req, res)

      expect(prisonRegisterService.getCourt).not.toHaveBeenCalled()
      expect(prisonRegisterService.updateCourtDetails).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/court-register/court-type/update?id=SHFCC')
    })
  })

  describe('updateAccessibleAccess', () => {
    beforeEach(() => {
      prisonRegisterService.getCourt.mockResolvedValue(
        data.court({
          courtId: 'SHFCC',
          courtName: 'Sheffield Crown Court',
          accessibleAccess: 'ACCESSIBLE',
        }),
      )
      req.query.id = 'SHFCC'
    })

    const checkedOptions = () =>
      (res.render as jest.Mock).mock.calls[0][1].accessibleAccessOptions
        .filter((option: { checked: boolean }) => option.checked)
        .map((option: { value: string }) => option.value)

    it('will get the court using its id and the current username', async () => {
      res.locals.user = { username: 'tom' }

      await controller.updateAccessibleAccess(req, res)

      expect(prisonRegisterService.getCourt).toHaveBeenCalledWith({ username: 'tom' }, 'SHFCC')
    })

    it('will render the page with the current accessible access option checked', async () => {
      ;(req.flash as jest.Mock).mockReturnValue([])

      await controller.updateAccessibleAccess(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'pages/components/edit/updateAgencyAccessibleAccess',
        expect.objectContaining({
          name: 'Sheffield Crown Court',
          navigation: { cancelButton: '/court-register/details?id=SHFCC' },
          errors: [],
        }),
      )
      expect(checkedOptions()).toEqual(['ACCESSIBLE'])
    })

    it('will retain and check the submitted option when there are flashed errors', async () => {
      const errors = [{ href: '#accessibleAccess', text: 'Select an accessible access option' }]
      ;(req.flash as jest.Mock).mockReturnValue(errors)
      req.session.updateAccessibleAccessForm = { accessibleAccess: 'BY_ARRANGEMENT_ONLY' }

      await controller.updateAccessibleAccess(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'pages/components/edit/updateAgencyAccessibleAccess',
        expect.objectContaining({ errors }),
      )
      expect(checkedOptions()).toEqual(['BY_ARRANGEMENT_ONLY'])
      expect(req.session.updateAccessibleAccessForm).toEqual({ accessibleAccess: 'BY_ARRANGEMENT_ONLY' })
    })

    it('will check UNKNOWN when the court accessible access value is null', async () => {
      ;(req.flash as jest.Mock).mockReturnValue([])
      prisonRegisterService.getCourt.mockResolvedValue(data.court({ accessibleAccess: null }))

      await controller.updateAccessibleAccess(req, res)

      expect(checkedOptions()).toEqual(['UNKNOWN'])
    })

    it('will check UNKNOWN when the court has no accessible access property', async () => {
      ;(req.flash as jest.Mock).mockReturnValue([])
      const court = data.court({})
      delete court.accessibleAccess
      prisonRegisterService.getCourt.mockResolvedValue(court)

      await controller.updateAccessibleAccess(req, res)

      expect(checkedOptions()).toEqual(['UNKNOWN'])
    })

    it('will clear a previous form and show the current value when there are no errors', async () => {
      ;(req.flash as jest.Mock).mockReturnValue([])
      req.session.updateAccessibleAccessForm = { accessibleAccess: 'NONE' }

      await controller.updateAccessibleAccess(req, res)

      expect(req.session.updateAccessibleAccessForm).toBeUndefined()
      expect(checkedOptions()).toEqual(['ACCESSIBLE'])
    })
  })

  describe('submitUpdateAccessibleAccess', () => {
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
      req.body = { accessibleAccess: 'BY_ARRANGEMENT_ONLY' }
    })

    it('updates the court preserving its existing fields and forwarding the user context', async () => {
      res.locals.user = { username: 'tom' }

      await controller.submitUpdateAccessibleAccess(req, res)

      expect(prisonRegisterService.getCourt).toHaveBeenCalledWith({ username: 'tom' }, 'SHFCC')
      expect(prisonRegisterService.updateCourtDetails).toHaveBeenCalledWith({ username: 'tom' }, 'SHFCC', {
        courtName: 'Sheffield Crown Court',
        description: 'Sheffield Main Crown Court',
        active: true,
        inactiveDate: undefined,
        cjitCode: 'C00SH00',
        accessibleAccess: 'BY_ARRANGEMENT_ONLY',
        areaCode: 'YH',
        regionCode: 'YH',
        geographicalAreaCode: 'YH',
        localAuthorityCode: 'YH',
        payrollRegionCode: 'YH',
        courtTypeCode: 'CC',
      })
    })

    it('trims the submitted value before updating the court', async () => {
      req.body.accessibleAccess = '  BY_ARRANGEMENT_ONLY  '

      await controller.submitUpdateAccessibleAccess(req, res)

      expect(prisonRegisterService.updateCourtDetails).toHaveBeenCalledWith(
        {},
        'SHFCC',
        expect.objectContaining({ accessibleAccess: 'BY_ARRANGEMENT_ONLY' }),
      )
      expect(req.session.updateAccessibleAccessForm).toBeUndefined()
    })

    it('omits accessibleAccess from the update when UNKNOWN is selected', async () => {
      req.body.accessibleAccess = 'UNKNOWN'

      await controller.submitUpdateAccessibleAccess(req, res)

      const update = prisonRegisterService.updateCourtDetails.mock.calls[0][2]
      expect(update).not.toHaveProperty('accessibleAccess')
      expect(req.session.updateAccessibleAccessForm).toBeUndefined()
    })

    it('redirects to court details and clears the form after a successful update', async () => {
      req.session.updateAccessibleAccessForm = { accessibleAccess: 'NONE' }

      await controller.submitUpdateAccessibleAccess(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/court-register/details?id=SHFCC&action=UPDATED')
      expect(req.session.updateAccessibleAccessForm).toBeUndefined()
    })

    it('retains the form and flashes the API user message when the update is rejected', async () => {
      prisonRegisterService.updateCourtDetails.mockResolvedValue({
        success: false,
        userMessage: 'Accessible access not allowed',
      })

      await controller.submitUpdateAccessibleAccess(req, res)

      expect(req.session.updateAccessibleAccessForm).toEqual({ accessibleAccess: 'BY_ARRANGEMENT_ONLY' })
      expect(req.flash).toHaveBeenCalledWith('errors', [
        { href: '#accessibleAccess', text: 'Accessible access not allowed' },
      ])
      expect(res.redirect).toHaveBeenCalledWith('/court-register/accessible-access/update?id=SHFCC')
    })

    it('retains the form and propagates unexpected errors', async () => {
      prisonRegisterService.updateCourtDetails.mockRejectedValue(new Error('Server error'))

      await expect(controller.submitUpdateAccessibleAccess(req, res)).rejects.toThrow('Server error')

      expect(req.session.updateAccessibleAccessForm).toEqual({ accessibleAccess: 'BY_ARRANGEMENT_ONLY' })
      expect(res.redirect).not.toHaveBeenCalled()
    })

    it.each([{}, { accessibleAccess: 'XX' }])(
      'validates the selection before fetching or updating the court: %j',
      async body => {
        req.body = body

        await controller.submitUpdateAccessibleAccess(req, res)

        expect(prisonRegisterService.getCourt).not.toHaveBeenCalled()
        expect(prisonRegisterService.updateCourtDetails).not.toHaveBeenCalled()
        expect(req.flash).toHaveBeenCalledWith('errors', expect.any(Array))
        expect(res.redirect).toHaveBeenCalledWith('/court-register/accessible-access/update?id=SHFCC')
      },
    )
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
