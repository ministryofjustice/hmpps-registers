import type { PrisonAddressForm } from 'prisonForms'
import { Request } from 'express'
import validate from './prisonAddressValidator'

describe('prisonAddressValidator', () => {
  const req = {
    flash: jest.fn() as (type: string, message: Array<Record<string, string>>) => number,
  } as Request

  const validForm: PrisonAddressForm = {
    id: '21',
    prisonId: 'MDI',
    addressline1: 'Bawtry Road',
    addressline2: 'Hatfield Woodhouse',
    addresstown: 'Doncaster',
    addresscounty: 'South Yorkshire',
    addresspostcode: 'DN7 6BW',
    addresscountry: 'England',
  }

  describe('validate', () => {
    let updateService: jest.Mocked<(form: PrisonAddressForm) => Promise<void>>
    beforeEach(() => {
      updateService = jest.fn().mockResolvedValue(null)
      jest.resetAllMocks()
    })
    it('returns to prison details when valid', async () => {
      const form = { ...validForm }
      const nextPage = await validate(form, req, updateService)
      expect(nextPage).toEqual('/prison-register/details?id=MDI&action=UPDATED')
      expect(req.flash).toHaveBeenCalledTimes(0)
    })
    it('calls update service when valid', async () => {
      const form = { ...validForm, description: 'Sheffield Prison' }
      const nextPage = await validate(form, req, updateService)
      expect(nextPage).toEqual('/prison-register/details?id=MDI&action=UPDATED')
      expect(updateService).toHaveBeenCalledWith(form)
    })
    it('addressline1 must not be greater than 80 characters', async () => {
      const form = { ...validForm, addressline1: 'A'.repeat(81) }
      const nextPage = await validate(form, req, updateService)
      expect(nextPage).toEqual('/prison-register/amend-prison-address')
      expect(req.flash).toBeCalledWith('errors', [
        { href: '#addressline1', text: 'Enter the first line of the address not greater than 80 characters' },
      ])
    })
    it('addressline2 must not be greater than 80 characters', async () => {
      const form = { ...validForm, addressline2: 'A'.repeat(81) }
      const nextPage = await validate(form, req, updateService)
      expect(nextPage).toEqual('/prison-register/amend-prison-address')
      expect(req.flash).toBeCalledWith('errors', [
        { href: '#addressline2', text: 'Enter the second line of the address not greater than 80 characters' },
      ])
    })
    it('addresstown must not be a blank', async () => {
      const form = { ...validForm, addresstown: '  ' }
      const nextPage = await validate(form, req, updateService)
      expect(nextPage).toEqual('/prison-register/amend-prison-address')
      expect(req.flash).toBeCalledWith('errors', [{ href: '#addresstown', text: 'Enter the town or city' }])
    })
    it('addresstown must not be greater than 80 characters', async () => {
      const form = { ...validForm, addresstown: 'A'.repeat(81) }
      const nextPage = await validate(form, req, updateService)
      expect(nextPage).toEqual('/prison-register/amend-prison-address')
      expect(req.flash).toBeCalledWith('errors', [
        { href: '#addresstown', text: 'Enter the town or city not greater than 80 characters' },
      ])
    })
    it('addresscounty must not be greater than 80 characters', async () => {
      const form = { ...validForm, addresscounty: 'A'.repeat(81) }
      const nextPage = await validate(form, req, updateService)
      expect(nextPage).toEqual('/prison-register/amend-prison-address')
      expect(req.flash).toBeCalledWith('errors', [
        { href: '#addresscounty', text: 'Enter the county not greater than 80 characters' },
      ])
    })
    it('addresspostcode must not be a blank', async () => {
      const form = { ...validForm, addresspostcode: '  ' }
      const nextPage = await validate(form, req, updateService)
      expect(nextPage).toEqual('/prison-register/amend-prison-address')
      expect(req.flash).toBeCalledWith('errors', [
        {
          href: '#addresspostcode',
          text: 'Enter the postcode, like AA11AA',
        },
      ])
    })
    it('addresspostcode must not be greater than 8 characters', async () => {
      const form = { ...validForm, addresspostcode: 'S1----2BJ' }
      const nextPage = await validate(form, req, updateService)
      expect(nextPage).toEqual('/prison-register/amend-prison-address')
      expect(req.flash).toBeCalledWith('errors', [
        {
          href: '#addresspostcode',
          text: 'Enter the postcode, like AA11AA',
        },
      ])
    })
    it('addresspostcode must valid', async () => {
      const form = { ...validForm, addresspostcode: 'BANANAS' }
      const nextPage = await validate(form, req, updateService)
      expect(nextPage).toEqual('/prison-register/amend-prison-address')
      expect(req.flash).toBeCalledWith('errors', [
        {
          href: '#addresspostcode',
          text: 'Enter a real postcode, like AA11AA',
        },
      ])
    })
    it('addresspostcode with spaces anywhere is ok', async () => {
      const form = { ...validForm, addresspostcode: 'S1 2B J' }
      const nextPage = await validate(form, req, updateService)
      expect(nextPage).toEqual('/prison-register/details?id=MDI&action=UPDATED')
      expect(req.flash).toHaveBeenCalledTimes(0)
    })
    it('addresspostcode with common punctuation anywhere is ok', async () => {
      const form = { ...validForm, addresspostcode: 'S1-(2BJ)' }
      const nextPage = await validate(form, req, updateService)
      expect(nextPage).toEqual('/prison-register/details?id=MDI&action=UPDATED')
      expect(req.flash).toHaveBeenCalledTimes(0)
    })
    it('addresscountry must not be a blank', async () => {
      const form = { ...validForm, addresscountry: '  ' }
      const nextPage = await validate(form, req, updateService)
      expect(nextPage).toEqual('/prison-register/amend-prison-address')
      expect(req.flash).toBeCalledWith('errors', [
        {
          href: '#addresscountry',
          text: 'Select the country',
        },
      ])
    })
  })
})
