import { AddNewCourtForm } from 'forms'
import { Request } from 'express'
import validate from './addNewCourtContactDetailsValidator'

describe('addNewCourtContactDetailsValidator', () => {
  const req = {
    flash: jest.fn() as (type: string, message: Array<Record<string, string>>) => number,
  } as Request

  describe('validate', () => {
    it('returns next page when valid', () => {
      const form: AddNewCourtForm = {
        telephonenumber: '0114 123 4567',
      }
      const nextPage = validate(form, req)
      expect(nextPage).toEqual('/court-register/add-new-court-summary')
      expect(req.flash).toHaveBeenCalledTimes(0)
    })
    it('telephonenumber must not be a blank', () => {
      const form: AddNewCourtForm = {
        telephonenumber: '   ',
      }
      const nextPage = validate(form, req)
      expect(nextPage).toEqual('/court-register/add-new-court-contact-details')
      expect(req.flash).toBeCalledWith('errors', [{ href: '#telephonenumber', text: 'Enter the telephone number' }])
    })
  })
})
