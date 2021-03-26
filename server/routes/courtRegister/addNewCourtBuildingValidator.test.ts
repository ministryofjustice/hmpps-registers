import { AddNewCourtForm } from 'forms'
import { Request } from 'express'
import validate from './addNewCourtBuildingValidator'

describe('addNewCourtBuildingValidator', () => {
  const req = {
    flash: jest.fn() as (type: string, message: Array<Record<string, string>>) => number,
  } as Request

  const validForm: AddNewCourtForm = {
    buildingname: 'Crown Square',
    addressline1: '1 High Street',
    addresstown: 'Sheffield',
    addresscounty: 'South Yorkshire',
    addresspostcode: 'S1 2BJ',
    addresscountry: 'England',
  }

  describe('validate', () => {
    it('returns next page when valid', () => {
      const form = { ...validForm }
      const nextPage = validate(form, req)
      expect(nextPage).toEqual('/court-register/add-new-court-contact-details')
      expect(req.flash).toHaveBeenCalledTimes(0)
    })
    it('returns to summary page when valid and already complete', () => {
      const form = { ...validForm, completed: true }
      const nextPage = validate(form, req)
      expect(nextPage).toEqual('/court-register/add-new-court-summary')
    })
    it('buildingname must not be a blank', () => {
      const form = { ...validForm, buildingname: '  ' }
      const nextPage = validate(form, req)
      expect(nextPage).toEqual('/court-register/add-new-court-building')
      expect(req.flash).toBeCalledWith('errors', [{ href: '#buildingname', text: 'Enter the building name' }])
    })
    it('addressline1 must not be a blank', () => {
      const form = { ...validForm, addressline1: '  ' }
      const nextPage = validate(form, req)
      expect(nextPage).toEqual('/court-register/add-new-court-building')
      expect(req.flash).toBeCalledWith('errors', [
        { href: '#addressline1', text: 'Enter the first line of the address' },
      ])
    })
    it('addresstown must not be a blank', () => {
      const form = { ...validForm, addresstown: '  ' }
      const nextPage = validate(form, req)
      expect(nextPage).toEqual('/court-register/add-new-court-building')
      expect(req.flash).toBeCalledWith('errors', [{ href: '#addresstown', text: 'Enter the town or city' }])
    })
    it('addresscounty must not be a blank', () => {
      const form = { ...validForm, addresscounty: '  ' }
      const nextPage = validate(form, req)
      expect(nextPage).toEqual('/court-register/add-new-court-building')
      expect(req.flash).toBeCalledWith('errors', [{ href: '#addresscounty', text: 'Enter the county' }])
    })
    it('addresspostcode must not be a blank', () => {
      const form = { ...validForm, addresspostcode: '  ' }
      const nextPage = validate(form, req)
      expect(nextPage).toEqual('/court-register/add-new-court-building')
      expect(req.flash).toBeCalledWith('errors', [
        {
          href: '#addresspostcode',
          text: 'Enter the postcode, like AA11AA',
        },
      ])
    })
    it('addresscountry must not be a blank', () => {
      const form = { ...validForm, addresscountry: '  ' }
      const nextPage = validate(form, req)
      expect(nextPage).toEqual('/court-register/add-new-court-building')
      expect(req.flash).toBeCalledWith('errors', [
        {
          href: '#addresscountry',
          text: 'Enter the country, like England',
        },
      ])
    })
  })
})
