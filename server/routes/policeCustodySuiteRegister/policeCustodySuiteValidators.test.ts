import { Request } from 'express'
import {
  validateAddAddress,
  validateAddEmailAddress,
  validateAddPhoneNumber,
  validateUpdateActive,
  validateUpdateAddress,
  validateUpdateArea,
  validateUpdateCjitCode,
  validateUpdateEmailAddress,
  validateUpdateNameDescription,
  validateUpdatePhoneNumber,
} from './policeCustodySuiteValidators'

describe('policeCustodySuiteValidators', () => {
  const req = { query: { id: 'SHFPCS' }, flash: jest.fn() } as unknown as Request
  const save = jest.fn()
  const details = '/police-custody-suite-register/details?id=SHFPCS&action=UPDATED'
  const page = (path: string) => `/police-custody-suite-register/${path}?id=SHFPCS`

  beforeEach(() => {
    jest.resetAllMocks()
    req.session = {} as Request['session']
    save.mockResolvedValue({ success: true })
  })

  describe('name and description', () => {
    it('saves a valid name and description', async () => {
      const next = await validateUpdateNameDescription({ name: 'Sheffield', description: 'Desc' }, req, save)

      expect(next).toEqual(details)
      expect(save).toHaveBeenCalledWith({ name: 'Sheffield', description: 'Desc' })
    })

    it('rejects a missing name', async () => {
      const next = await validateUpdateNameDescription({ name: '', description: '' }, req, save)

      expect(next).toEqual(page('name-description/update'))
      expect(req.flash).toHaveBeenCalledWith('errors', [expect.objectContaining({ href: '#name' })])
      expect(save).not.toHaveBeenCalled()
    })

    it('returns API errors to the form', async () => {
      save.mockResolvedValue({ success: false, userMessage: 'Name in use' })
      const next = await validateUpdateNameDescription({ name: 'Sheffield', description: '' }, req, save)

      expect(next).toEqual(page('name-description/update'))
      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#name', text: 'Name in use' }])
    })
  })

  describe('active', () => {
    it('saves active without a date', async () => {
      const next = await validateUpdateActive({ active: 'true' }, req, save)

      expect(next).toEqual(details)
      expect(save).toHaveBeenCalledWith({ active: true })
    })

    it('requires a selection', async () => {
      const next = await validateUpdateActive({}, req, save)

      expect(next).toEqual(page('active/update'))
      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#active', text: 'Select active or inactive' }])
    })

    it('saves inactive with a real date', async () => {
      const next = await validateUpdateActive(
        { active: 'false', inactiveDay: '2', inactiveMonth: '3', inactiveYear: '2024' },
        req,
        save,
      )

      expect(next).toEqual(details)
      expect(save).toHaveBeenCalledWith({ active: false, inactiveDate: '2024-03-02' })
    })

    it('rejects an impossible date', async () => {
      const next = await validateUpdateActive(
        { active: 'false', inactiveDay: '31', inactiveMonth: '2', inactiveYear: '2024' },
        req,
        save,
      )

      expect(next).toEqual(page('active/update'))
      expect(save).not.toHaveBeenCalled()
    })
  })

  describe('CJIT code', () => {
    it('rejects codes longer than 7 characters', async () => {
      const next = await validateUpdateCjitCode({ cjitCode: 'TOOLONG99' }, req, save)

      expect(next).toEqual(page('cjit-code/update'))
      expect(save).not.toHaveBeenCalled()
    })

    it('allows clearing the code', async () => {
      await validateUpdateCjitCode({ cjitCode: '' }, req, save)

      expect(save).toHaveBeenCalledWith('')
    })
  })

  describe('area', () => {
    it('rejects an unknown area', async () => {
      const next = await validateUpdateArea(
        { areaCode: 'XX', areaDescription: 'Nowhere' },
        req,
        async () => [{ code: 'SY', description: 'South Yorkshire' }],
        save,
      )

      expect(next).toEqual(page('area/update'))
      expect(save).not.toHaveBeenCalled()
    })

    it('saves a known area', async () => {
      const next = await validateUpdateArea(
        { areaCode: 'SY', areaDescription: 'South Yorkshire' },
        req,
        async () => [{ code: 'SY', description: 'South Yorkshire' }],
        save,
      )

      expect(next).toEqual(details)
      expect(save).toHaveBeenCalledWith('SY')
    })
  })

  describe('addresses', () => {
    const form = {
      addressline1: '1 High Street',
      addresstown: 'Sheffield',
      addresspostcode: 'S1 2BJ',
      addresscountry: 'England',
    }

    it('adds a valid address', async () => {
      const next = await validateAddAddress(form, req, save)

      expect(next).toEqual(details)
      expect(save).toHaveBeenCalledWith(expect.objectContaining({ addressLine1: '1 High Street', town: 'Sheffield' }))
    })

    it('keeps the address ID when an update is invalid', async () => {
      const next = await validateUpdateAddress({ ...form, addresstown: '', addressId: 4 }, req, save)

      expect(next).toEqual(`${page('address/update')}&addressId=4`)
      expect(save).not.toHaveBeenCalled()
    })
  })

  describe('phone numbers', () => {
    it('adds a valid phone number', async () => {
      const next = await validateAddPhoneNumber({ phoneNumber: '0114 111 1111' }, req, save)

      expect(next).toEqual(details)
      expect(save).toHaveBeenCalledWith({ number: '0114 111 1111' })
    })

    it('rejects an invalid phone number on update', async () => {
      const next = await validateUpdatePhoneNumber({ phoneNumber: 'abc', phoneId: 7 }, req, save)

      expect(next).toEqual(`${page('phone/update')}&phoneId=7`)
      expect(save).not.toHaveBeenCalled()
    })
  })

  describe('email addresses', () => {
    it('adds a valid email address', async () => {
      const next = await validateAddEmailAddress({ emailAddress: 'a@b.com' }, req, save)

      expect(next).toEqual(details)
      expect(save).toHaveBeenCalledWith({ address: 'a@b.com' })
    })

    it('requires an email address', async () => {
      const next = await validateAddEmailAddress({ emailAddress: '' }, req, save)

      expect(next).toEqual(page('email/create'))
      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#emailAddress', text: 'Enter an email address' }])
    })

    it('rejects an invalid email address on update', async () => {
      const next = await validateUpdateEmailAddress({ emailAddress: 'nope', emailId: 3 }, req, save)

      expect(next).toEqual(`${page('email/update')}&emailId=3`)
      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#emailAddress', text: 'Enter a valid email address' }])
      expect(save).not.toHaveBeenCalled()
    })

    it('returns API errors to the form', async () => {
      save.mockResolvedValue({ success: false, userMessage: 'Already exists' })
      const next = await validateUpdateEmailAddress({ emailAddress: 'a@b.com', emailId: 3 }, req, save)

      expect(next).toEqual(`${page('email/update')}&emailId=3`)
      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#emailAddress', text: 'Already exists' }])
    })
  })
})
