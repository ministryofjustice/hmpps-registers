import { AddNewCourtForm } from 'forms'
import { Request } from 'express'
import { Court } from 'courtRegister'
import validate from './addNewCourtDetailsValidator'
import { CourtDetail } from './courtMapper'
import data from '../testutils/mockData'

jest.mock('../../services/courtRegisterService')

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
    let lookup: jest.Mocked<(id: string) => Promise<CourtDetail>>
    beforeEach(() => {
      lookup = jest.fn().mockResolvedValue(null)
    })

    it('returns next page when valid', async () => {
      const form = { ...validForm }
      const nextPage = await validate(form, req, lookup)
      expect(nextPage).toEqual('/court-register/add-new-court-building')
      expect(req.flash).toHaveBeenCalledTimes(0)
    })
    it('returns to summary page when valid and already complete', async () => {
      const form = { ...validForm, completed: true }
      const nextPage = await validate(form, req, lookup)
      expect(nextPage).toEqual('/court-register/add-new-court-summary')
    })
    it('id must not be a blank', async () => {
      const form = { ...validForm, id: '  ' }
      const nextPage = await validate(form, req, lookup)
      expect(nextPage).toEqual('/court-register/add-new-court-details')
      expect(req.flash).toBeCalledWith('errors', [{ href: '#id', text: 'Enter a court code' }])
    })
    it('id must be greater than 2 characters', async () => {
      const form = { ...validForm, id: 'A' }
      const nextPage = await validate(form, req, lookup)
      expect(nextPage).toEqual('/court-register/add-new-court-details')
      expect(req.flash).toBeCalledWith('errors', [{ href: '#id', text: 'Court code must be at least 2 characters' }])
    })
    it('id must be less or equal to 12 characters', async () => {
      const form = { ...validForm, id: 'A'.repeat(13) }
      const nextPage = await validate(form, req, lookup)
      expect(nextPage).toEqual('/court-register/add-new-court-details')
      expect(req.flash).toBeCalledWith('errors', [{ href: '#id', text: 'Court code must be 12 characters or fewer' }])
    })
    it('id must not match an existing court', async () => {
      const court: Court = data.court({
        courtName: 'Sheffield Crown Court',
      })
      lookup = jest.fn().mockResolvedValue(court)

      const form = { ...validForm, id: 'AA' }
      const nextPage = await validate(form, req, lookup)
      expect(nextPage).toEqual('/court-register/add-new-court-details')
      expect(req.flash).toBeCalledWith('errors', [
        { href: '#id', text: 'Sheffield Crown Court already has that code. Choose another code' },
      ])
    })
    it('name must not be a blank', async () => {
      const form = { ...validForm, name: '  ' }
      const nextPage = await validate(form, req, lookup)
      expect(nextPage).toEqual('/court-register/add-new-court-details')
      expect(req.flash).toBeCalledWith('errors', [{ href: '#name', text: 'Enter a court name' }])
    })
    it('name must be greater than 2 characters', async () => {
      const form = { ...validForm, name: 'A' }
      const nextPage = await validate(form, req, lookup)
      expect(nextPage).toEqual('/court-register/add-new-court-details')
      expect(req.flash).toBeCalledWith('errors', [{ href: '#name', text: 'Court name must be at least 2 characters' }])
    })
    it('name must be less or equal to 200 characters', async () => {
      const form = { ...validForm, name: 'A'.repeat(201) }
      const nextPage = await validate(form, req, lookup)
      expect(nextPage).toEqual('/court-register/add-new-court-details')
      expect(req.flash).toBeCalledWith('errors', [
        { href: '#name', text: 'Court name must be 200 characters or fewer' },
      ])
    })
    it('type must not be selected', async () => {
      const form = { ...validForm, type: '  ' }
      const nextPage = await validate(form, req, lookup)
      expect(nextPage).toEqual('/court-register/add-new-court-details')
      expect(req.flash).toBeCalledWith('errors', [{ href: '#type', text: 'Select a court type' }])
    })
  })
})
