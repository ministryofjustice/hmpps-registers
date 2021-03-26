import { AddNewCourtForm } from 'forms'
import { Request } from 'express'
import validate from './addNewCourtDetailsValidator'

describe('addNewCourtDetailsValidator', () => {
  const req = {
    flash: jest.fn() as (type: string, message: Array<Record<string, string>>) => number,
  } as Request

  const validForm: AddNewCourtForm = {
    id: 'SHFCC',
    name: 'Sheffield Crown Court',
    type: 'CRN',
  }

  describe('validate', () => {
    it('returns next page when valid', () => {
      const form = { ...validForm }
      const nextPage = validate(form, req)
      expect(nextPage).toEqual('/court-register/add-new-court-building')
      expect(req.flash).toHaveBeenCalledTimes(0)
    })
    it('returns to summary page when valid and already complete', () => {
      const form = { ...validForm, completed: true }
      const nextPage = validate(form, req)
      expect(nextPage).toEqual('/court-register/add-new-court-summary')
    })
    it('id must not be a blank', () => {
      const form = { ...validForm, id: '  ' }
      const nextPage = validate(form, req)
      expect(nextPage).toEqual('/court-register/add-new-court-details')
      expect(req.flash).toBeCalledWith('errors', [{ href: '#id', text: 'Enter a court code' }])
    })
    it('id must be greater than 2 characters', () => {
      const form = { ...validForm, id: 'A' }
      const nextPage = validate(form, req)
      expect(nextPage).toEqual('/court-register/add-new-court-details')
      expect(req.flash).toBeCalledWith('errors', [{ href: '#id', text: 'Court code must be at least 2 characters' }])
    })
    it('id must be less or equal to 12 characters', () => {
      const form = { ...validForm, id: 'A'.repeat(13) }
      const nextPage = validate(form, req)
      expect(nextPage).toEqual('/court-register/add-new-court-details')
      expect(req.flash).toBeCalledWith('errors', [{ href: '#id', text: 'Court code must be 12 characters or fewer' }])
    })
    it('name must not be a blank', () => {
      const form = { ...validForm, name: '  ' }
      const nextPage = validate(form, req)
      expect(nextPage).toEqual('/court-register/add-new-court-details')
      expect(req.flash).toBeCalledWith('errors', [{ href: '#name', text: 'Enter a court name' }])
    })
    it('name must be greater than 2 characters', () => {
      const form = { ...validForm, name: 'A' }
      const nextPage = validate(form, req)
      expect(nextPage).toEqual('/court-register/add-new-court-details')
      expect(req.flash).toBeCalledWith('errors', [{ href: '#name', text: 'Court name must be at least 2 characters' }])
    })
    it('name must be less or equal to 200 characters', () => {
      const form = { ...validForm, name: 'A'.repeat(201) }
      const nextPage = validate(form, req)
      expect(nextPage).toEqual('/court-register/add-new-court-details')
      expect(req.flash).toBeCalledWith('errors', [
        { href: '#name', text: 'Court name must be 200 characters or fewer' },
      ])
    })
    it('type must not be selected', () => {
      const form = { ...validForm, type: '  ' }
      const nextPage = validate(form, req)
      expect(nextPage).toEqual('/court-register/add-new-court-details')
      expect(req.flash).toBeCalledWith('errors', [{ href: '#type', text: 'Select a court type' }])
    })
  })
})
