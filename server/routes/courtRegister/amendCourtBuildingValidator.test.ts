import { AmendCourtBuildingForm } from 'forms'
import { Request } from 'express'
import validate from './amendCourtBuildingValidator'

describe('amendCourtBuildingValidator', () => {
  const req = {
    flash: jest.fn() as (type: string, message: Array<Record<string, string>>) => number,
  } as Request

  const validForm: AmendCourtBuildingForm = {
    id: '1',
    courtId: 'SHFCC',
    buildingname: 'Crown Square',
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
    it('returns to court details when valid', () => {
      const form = { ...validForm }
      const nextPage = validate(form, req)
      expect(nextPage).toEqual('/court-register/details?id=SHFCC&action=UPDATED')
      expect(req.flash).toHaveBeenCalledTimes(0)
    })
    it('buildingname must not be a blank', () => {
      const form = { ...validForm, buildingname: '  ' }
      const nextPage = validate(form, req)
      expect(nextPage).toEqual('/court-register/amend-court-building')
      expect(req.flash).toBeCalledWith('errors', [{ href: '#buildingname', text: 'Enter the building name' }])
    })
    it('addressline1 must not be a blank', () => {
      const form = { ...validForm, addressline1: '  ' }
      const nextPage = validate(form, req)
      expect(nextPage).toEqual('/court-register/amend-court-building')
      expect(req.flash).toBeCalledWith('errors', [
        { href: '#addressline1', text: 'Enter the first line of the address' },
      ])
    })
    it('addresstown must not be a blank', () => {
      const form = { ...validForm, addresstown: '  ' }
      const nextPage = validate(form, req)
      expect(nextPage).toEqual('/court-register/amend-court-building')
      expect(req.flash).toBeCalledWith('errors', [{ href: '#addresstown', text: 'Enter the town or city' }])
    })
    it('addresscounty must not be a blank', () => {
      const form = { ...validForm, addresscounty: '  ' }
      const nextPage = validate(form, req)
      expect(nextPage).toEqual('/court-register/amend-court-building')
      expect(req.flash).toBeCalledWith('errors', [{ href: '#addresscounty', text: 'Enter the county' }])
    })
    it('addresspostcode must not be a blank', () => {
      const form = { ...validForm, addresspostcode: '  ' }
      const nextPage = validate(form, req)
      expect(nextPage).toEqual('/court-register/amend-court-building')
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
      expect(nextPage).toEqual('/court-register/amend-court-building')
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
      expect(nextPage).toEqual('/court-register/details?id=SHFCC&action=UPDATED')
      expect(req.flash).toHaveBeenCalledTimes(0)
    })
    it('addresspostcode with common punctuation anywhere is ok', () => {
      const form = { ...validForm, addresspostcode: 'S1-(2BJ)' }
      const nextPage = validate(form, req)
      expect(nextPage).toEqual('/court-register/details?id=SHFCC&action=UPDATED')
      expect(req.flash).toHaveBeenCalledTimes(0)
    })
    it('addresscountry must not be a blank', () => {
      const form = { ...validForm }
      delete form.addresscountry
      const nextPage = validate(form, req)
      expect(nextPage).toEqual('/court-register/amend-court-building')
      expect(req.flash).toBeCalledWith('errors', [
        {
          href: '#addresscountry',
          text: 'Select the country',
        },
      ])
    })
  })
})
