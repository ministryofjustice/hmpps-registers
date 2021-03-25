import { AddNewCourtForm } from 'forms'
import { Request } from 'express'
import validate from './addNewCourtDetailsValidator'

describe('addNewCourtDetailsValidator', () => {
  const req = {
    flash: jest.fn() as (type: string, message: Array<Record<string, string>>) => number,
  } as Request

  describe('validate', () => {
    it('returns next page when valid', () => {
      const form: AddNewCourtForm = {
        id: 'SHFCC',
        name: 'Sheffield Crown Court',
        type: 'CRN',
      }
      const nextPage = validate(form, req)
      expect(nextPage).toEqual('/court-register/add-new-court-building')
      expect(req.flash).toHaveBeenCalledTimes(0)
    })
    it('id must not be a blank', () => {
      const form: AddNewCourtForm = {
        id: '   ',
        name: 'Sheffield Crown Court',
        type: 'CRN',
      }
      const nextPage = validate(form, req)
      expect(nextPage).toEqual('/court-register/add?mode=review')
      expect(req.flash).toBeCalledWith('errors', [{ href: '#id', text: 'Enter a court code' }])
    })
    it('name must not be a blank', () => {
      const form: AddNewCourtForm = {
        id: 'SHFCC',
        name: '   ',
        type: 'CRN',
      }
      const nextPage = validate(form, req)
      expect(nextPage).toEqual('/court-register/add?mode=review')
      expect(req.flash).toBeCalledWith('errors', [{ href: '#name', text: 'Enter a court name' }])
    })
    it('type must not be selected', () => {
      const form: AddNewCourtForm = {
        id: 'SHFCC',
        name: 'Sheffield Crown Court',
        type: '',
      }
      const nextPage = validate(form, req)
      expect(nextPage).toEqual('/court-register/add?mode=review')
      expect(req.flash).toBeCalledWith('errors', [{ href: '#type', text: 'Select a court type' }])
    })
  })
})
