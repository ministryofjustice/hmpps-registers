import { Request } from 'express'
import {
  validateAddAddress,
  validateAddPhoneNumber,
  validateUpdateActive,
  validateUpdateAddress,
  validateUpdateArea,
  validateUpdateCjitCode,
  validateUpdateHighSecurity,
  validateUpdateNameDescription,
  validateUpdatePhoneNumber,
} from './hospitalValidators'

describe('hospitalValidators', () => {
  const req = { query: { id: 'RAMPTON' }, flash: jest.fn() } as unknown as Request
  const save = jest.fn()
  const details = '/hospital-register/details?id=RAMPTON&action=UPDATED'

  beforeEach(() => {
    jest.resetAllMocks()
    req.session = {} as Request['session']
    save.mockResolvedValue({ success: true })
  })

  describe('name and description', () => {
    it('saves a valid name and description', async () => {
      const next = await validateUpdateNameDescription({ name: 'Rampton', description: 'Desc' }, req, save)

      expect(next).toEqual(details)
      expect(save).toHaveBeenCalledWith({ name: 'Rampton', description: 'Desc' })
    })

    it('rejects a missing name', async () => {
      const next = await validateUpdateNameDescription({ name: '', description: '' }, req, save)

      expect(next).toEqual('/hospital-register/name-description/update?id=RAMPTON')
      expect(req.flash).toHaveBeenCalledWith('errors', [expect.objectContaining({ href: '#name' })])
      expect(save).not.toHaveBeenCalled()
    })

    it('returns API errors to the form', async () => {
      save.mockResolvedValue({ success: false, userMessage: 'Name in use' })
      const next = await validateUpdateNameDescription({ name: 'Rampton', description: '' }, req, save)

      expect(next).toEqual('/hospital-register/name-description/update?id=RAMPTON')
      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#name', text: 'Name in use' }])
    })
  })

  describe('active', () => {
    it('saves active without a date', async () => {
      expect(await validateUpdateActive({ active: 'true' }, req, save)).toEqual(details)
      expect(save).toHaveBeenCalledWith({ active: true })
    })

    it('saves inactive with a formatted date', async () => {
      await validateUpdateActive(
        { active: 'false', inactiveDay: '5', inactiveMonth: '3', inactiveYear: '2024' },
        req,
        save,
      )
      expect(save).toHaveBeenCalledWith({ active: false, inactiveDate: '2024-03-05' })
    })

    it.each([
      [{}, 'Select active or inactive'],
      [{ active: 'false' }, 'Enter the date deactivated, including a day, month and year'],
      [
        { active: 'false', inactiveDay: '31', inactiveMonth: '2', inactiveYear: '2024' },
        'Date deactivated must be a real date',
      ],
    ])('rejects %j', async (form, text) => {
      const next = await validateUpdateActive(form, req, save)

      expect(next).toEqual('/hospital-register/active/update?id=RAMPTON')
      expect(req.flash).toHaveBeenCalledWith('errors', [expect.objectContaining({ text })])
      expect(save).not.toHaveBeenCalled()
    })
  })

  describe('high security', () => {
    it.each([
      ['true', true],
      ['false', false],
    ])('saves %s', async (value, expected) => {
      expect(await validateUpdateHighSecurity({ highSecurity: value }, req, save)).toEqual(details)
      expect(save).toHaveBeenCalledWith(expected)
    })

    it.each([undefined, '', 'maybe'])('rejects %p', async value => {
      const next = await validateUpdateHighSecurity({ highSecurity: value }, req, save)

      expect(next).toEqual('/hospital-register/high-security/update?id=RAMPTON')
      expect(save).not.toHaveBeenCalled()
    })
  })

  describe('CJIT code', () => {
    it('saves a valid code and an empty code', async () => {
      await validateUpdateCjitCode({ cjitCode: 'C00RA00' }, req, save)
      await validateUpdateCjitCode({}, req, save)

      expect(save).toHaveBeenNthCalledWith(1, 'C00RA00')
      expect(save).toHaveBeenNthCalledWith(2, '')
    })

    it('rejects a code over 7 characters', async () => {
      const next = await validateUpdateCjitCode({ cjitCode: '12345678' }, req, save)

      expect(next).toEqual('/hospital-register/cjit-code/update?id=RAMPTON')
      expect(save).not.toHaveBeenCalled()
    })
  })

  describe('reference data', () => {
    const getAreas = jest.fn()

    beforeEach(() => {
      getAreas.mockResolvedValue([{ code: 'YH', description: 'Yorkshire' }])
    })

    it('saves a known code and clears when empty', async () => {
      expect(await validateUpdateArea({ areaCode: 'YH', areaDescription: 'Yorkshire' }, req, getAreas, save)).toEqual(
        details,
      )
      await validateUpdateArea({ areaCode: '', areaDescription: '' }, req, getAreas, save)

      expect(save).toHaveBeenNthCalledWith(1, 'YH')
      expect(save).toHaveBeenNthCalledWith(2, undefined)
    })

    it('rejects free text that was not selected', async () => {
      const next = await validateUpdateArea({ areaCode: '', areaDescription: 'Nowhere' }, req, getAreas, save)

      expect(next).toEqual('/hospital-register/area/update?id=RAMPTON')
      expect(req.flash).toHaveBeenCalledWith('errors', [
        { href: '#area', text: 'Select a valid area from the suggestions' },
      ])
      expect(save).not.toHaveBeenCalled()
    })

    it('keeps the selected description when the API rejects the change', async () => {
      save.mockResolvedValue({ success: false, userMessage: 'Nope' })
      const form = { areaCode: 'YH', areaDescription: 'Yorkshire' }
      const next = await validateUpdateArea(form, req, getAreas, save)

      expect(next).toEqual('/hospital-register/area/update?id=RAMPTON')
      expect(req.session.updateAreaForm).toEqual(form)
      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#area', text: 'Nope' }])
    })
  })

  describe('address', () => {
    const form = {
      addressline1: '1 Road',
      addresstown: 'Retford',
      addresspostcode: 'DN22 0PD',
      addresscountry: 'England',
    }

    it('adds a valid address', async () => {
      expect(await validateAddAddress(form, req, save)).toEqual(details)
      expect(save).toHaveBeenCalledWith(expect.objectContaining({ addressLine1: '1 Road', town: 'Retford' }))
    })

    it('rejects an address without a town', async () => {
      const next = await validateAddAddress({ ...form, addresstown: '' }, req, save)

      expect(next).toEqual('/hospital-register/address/create?id=RAMPTON')
      expect(save).not.toHaveBeenCalled()
    })

    it('returns to the update page with the address id on failure', async () => {
      const next = await validateUpdateAddress({ ...form, addresstown: '', addressId: 3 }, req, save)

      expect(next).toEqual('/hospital-register/address/update?id=RAMPTON&addressId=3')
    })
  })

  describe('phone number', () => {
    it('adds a valid number', async () => {
      expect(await validateAddPhoneNumber({ phoneNumber: '01777 248321' }, req, save)).toEqual(details)
      expect(save).toHaveBeenCalledWith({ number: '01777 248321' })
    })

    it('rejects an invalid number', async () => {
      const next = await validateAddPhoneNumber({ phoneNumber: 'abc' }, req, save)

      expect(next).toEqual('/hospital-register/phone/create?id=RAMPTON')
      expect(save).not.toHaveBeenCalled()
    })

    it('returns to the update page with the phone id on failure', async () => {
      const next = await validateUpdatePhoneNumber({ phoneNumber: '', phoneId: 7 }, req, save)

      expect(next).toEqual('/hospital-register/phone/update?id=RAMPTON&phoneId=7')
      expect(save).not.toHaveBeenCalled()
    })

    it('updates a valid number', async () => {
      expect(await validateUpdatePhoneNumber({ phoneNumber: '0114 111 1111', phoneId: 7 }, req, save)).toEqual(details)
    })
  })
})
