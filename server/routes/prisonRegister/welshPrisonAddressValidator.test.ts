import type { WelshPrisonAddressForm } from 'prisonForms'
import { Request } from 'express'
import validate from './welshPrisonAddressValidator'

describe('welshPrisonAddressValidator', () => {
  const req = {
    flash: jest.fn() as (type: string, message: Array<Record<string, string>>) => number,
  } as unknown as Request

  const errorUrl = '/prison-register/add-welsh-prison-address'

  const validForm: WelshPrisonAddressForm = {
    addressId: '21',
    prisonId: 'CFI',
    addressline1inwelsh: 'line 1 in welsh',
    addressline2inwelsh: 'line 21 in welsh',
    towninwelsh: 'Cardiff',
    countyinwelsh: 'Glamorgan',
  }

  describe('validate', () => {
    let updateService: jest.Mocked<(form: WelshPrisonAddressForm) => Promise<void>>
    beforeEach(() => {
      updateService = jest.fn().mockResolvedValue(null)
      jest.resetAllMocks()
    })
    it('returns to prison details when valid', async () => {
      const form = { ...validForm }
      const nextPage = await validate(form, req, errorUrl, updateService)
      expect(nextPage).toEqual('/prison-register/details?id=CFI&action=UPDATED')
      expect(req.flash).toHaveBeenCalledTimes(0)
    })
    it('calls update service when valid', async () => {
      const form = { ...validForm, description: 'Sheffield Prison' }
      const nextPage = await validate(form, req, errorUrl, updateService)
      expect(nextPage).toEqual('/prison-register/details?id=CFI&action=UPDATED')
      expect(updateService).toHaveBeenCalledWith(form)
    })
    it('addressline1 must not be greater than 80 characters', async () => {
      const form = { ...validForm, addressline1inwelsh: 'A'.repeat(81) }
      const nextPage = await validate(form, req, errorUrl, updateService)
      expect(nextPage).toEqual('/prison-register/add-welsh-prison-address')
      expect(req.flash).toBeCalledWith('errors', [
        { href: '#addressline1inwelsh', text: 'Enter the first line of the address not greater than 80 characters' },
      ])
    })
    it('addressline2 must not be greater than 80 characters', async () => {
      const form = { ...validForm, addressline2inwelsh: 'A'.repeat(81) }
      const nextPage = await validate(form, req, errorUrl, updateService)
      expect(nextPage).toEqual('/prison-register/add-welsh-prison-address')
      expect(req.flash).toBeCalledWith('errors', [
        { href: '#addressline2inwelsh', text: 'Enter the second line of the address not greater than 80 characters' },
      ])
    })
    it('town must not be a blank', async () => {
      const form = { ...validForm, towninwelsh: '  ' }
      const nextPage = await validate(form, req, errorUrl, updateService)
      expect(nextPage).toEqual('/prison-register/add-welsh-prison-address')
      expect(req.flash).toBeCalledWith('errors', [{ href: '#towninwelsh', text: 'Enter the town or city' }])
    })
    it('town must not be greater than 80 characters', async () => {
      const form = { ...validForm, towninwelsh: 'A'.repeat(81) }
      const nextPage = await validate(form, req, errorUrl, updateService)
      expect(nextPage).toEqual('/prison-register/add-welsh-prison-address')
      expect(req.flash).toBeCalledWith('errors', [
        { href: '#towninwelsh', text: 'Enter the town or city not greater than 80 characters' },
      ])
    })
    it('county must not be greater than 80 characters', async () => {
      const form = { ...validForm, countyinwelsh: 'A'.repeat(81) }
      const nextPage = await validate(form, req, errorUrl, updateService)
      expect(nextPage).toEqual('/prison-register/add-welsh-prison-address')
      expect(req.flash).toBeCalledWith('errors', [
        { href: '#countyinwelsh', text: 'Enter the county not greater than 80 characters' },
      ])
    })
  })
})
