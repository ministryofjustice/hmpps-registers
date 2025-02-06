import type { AddNewPrisonForm } from 'prisonForms'
import { Request } from 'express'
import validate from './addNewPrisonAddressValidator'

describe('addNewPrisonAddressValidator', () => {
  const req = {
    flash: jest.fn() as (type: string, message: Array<Record<string, string>>) => number,
  } as unknown as Request

  const validForm: AddNewPrisonForm = {
    gender: [],
    name: '',
    prisonNameInWelsh: '',
    contracted: 'yes',
    lthse: 'no',
    addressline1: '1 High Street',
    addresstown: 'Sheffield',
    addresscounty: 'South Yorkshire',
    addresspostcode: 'S1 2BJ',
    addresscountry: 'England',
  }

  describe('validate', () => {
    beforeEach(() => {
      jest.resetAllMocks()
    })
    it('returns to summary page when valid and already complete', () => {
      const form = { ...validForm, completed: true }
      const nextPage = validate(form, req)
      expect(nextPage).toEqual('/prison-register/add-new-prison-summary')
    })
    it('addresstown must not be a blank', () => {
      const form = { ...validForm, addresstown: '  ' }
      const nextPage = validate(form, req)
      expect(nextPage).toEqual('/prison-register/add-new-prison-address')
      expect(req.flash).toBeCalledWith('errors', [{ href: '#addresstown', text: 'Enter the town or city' }])
    })
    it('addresstown must not be greater than 80 characters', async () => {
      const form = { ...validForm, addresstown: 'A'.repeat(81) }
      const nextPage = await validate(form, req)
      expect(nextPage).toEqual('/prison-register/add-new-prison-address')
      expect(req.flash).toBeCalledWith('errors', [
        { href: '#addresstown', text: 'Enter the town or city not greater than 80 characters' },
      ])
    })
    it('addresspostcode must not be a blank', () => {
      const form = { ...validForm, addresspostcode: '  ' }
      const nextPage = validate(form, req)
      expect(nextPage).toEqual('/prison-register/add-new-prison-address')
      expect(req.flash).toBeCalledWith('errors', [
        {
          href: '#addresspostcode',
          text: 'Enter the postcode, like AA11AA',
        },
      ])
    })
    it('addresspostcode must not be greater than 8 characters', async () => {
      const form = { ...validForm, addresspostcode: 'S1----2BJ' }
      const nextPage = await validate(form, req)
      expect(nextPage).toEqual('/prison-register/add-new-prison-address')
      expect(req.flash).toBeCalledWith('errors', [
        {
          href: '#addresspostcode',
          text: 'Enter the postcode, like AA11AA',
        },
      ])
    })
    it('addresspostcode must valid', () => {
      const form = { ...validForm, addresspostcode: 'BANANAS' }
      const nextPage = validate(form, req)
      expect(nextPage).toEqual('/prison-register/add-new-prison-address')
      expect(req.flash).toBeCalledWith('errors', [
        {
          href: '#addresspostcode',
          text: 'Enter a real postcode, like AA11AA',
        },
      ])
    })
    it('addresspostcode with spaces anywhere is ok', () => {
      const form = { ...validForm, addresspostcode: 'S1 2B J' }
      const nextPage = validate(form, req)
      expect(nextPage).toEqual('/prison-register/add-new-prison-summary')
      expect(req.flash).toHaveBeenCalledTimes(0)
    })
    it('addresspostcode with mixed case is ok', () => {
      const form = { ...validForm, addresspostcode: 's1 2B j' }
      const nextPage = validate(form, req)
      expect(nextPage).toEqual('/prison-register/add-new-prison-summary')
      expect(req.flash).toHaveBeenCalledTimes(0)
    })
    it('addresspostcode with common punctuation anywhere is ok', () => {
      const form = { ...validForm, addresspostcode: 'S1-(2BJ)' }
      const nextPage = validate(form, req)
      expect(nextPage).toEqual('/prison-register/add-new-prison-summary')
      expect(req.flash).toHaveBeenCalledTimes(0)
    })
    it('addresscountry must not be a blank', () => {
      const form = { ...validForm, addresscountry: '  ' }
      const nextPage = validate(form, req)
      expect(nextPage).toEqual('/prison-register/add-new-prison-address')
      expect(req.flash).toBeCalledWith('errors', [
        {
          href: '#addresscountry',
          text: 'Select the country',
        },
      ])
    })
  })
})
