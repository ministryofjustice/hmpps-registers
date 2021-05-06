import { AddNewCourtForm } from 'forms'
import { Request } from 'express'
import { Court } from '../../@types/courtRegister'
import validate from './addNewCourtDetailsValidator'
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
    let lookup: jest.Mocked<(id: string) => Promise<Court>>
    beforeEach(() => {
      jest.resetAllMocks()
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
      expect(req.flash).toBeCalledWith('errors', [
        { href: '#id', text: 'Enter a court code between 2 and 12 characters' },
      ])
    })
    it('id must be less or equal to 12 characters', async () => {
      const form = { ...validForm, id: 'A'.repeat(13) }
      const nextPage = await validate(form, req, lookup)
      expect(nextPage).toEqual('/court-register/add-new-court-details')
      expect(req.flash).toBeCalledWith('errors', [
        { href: '#id', text: 'Enter a court code between 2 and 12 characters' },
      ])
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
      expect(req.flash).toBeCalledWith('errors', [
        { href: '#name', text: 'Enter a court name between 2 and 80 characters' },
      ])
    })
    it('name must be less or equal to 80 characters', async () => {
      const form = { ...validForm, name: 'A'.repeat(81) }
      const nextPage = await validate(form, req, lookup)
      expect(nextPage).toEqual('/court-register/add-new-court-details')
      expect(req.flash).toBeCalledWith('errors', [
        { href: '#name', text: 'Enter a court name between 2 and 80 characters' },
      ])
    })
    it('description must be less or equal to 200 characters when entered', async () => {
      const form = { ...validForm, description: 'A'.repeat(201) }
      const nextPage = await validate(form, req, lookup)
      expect(nextPage).toEqual('/court-register/add-new-court-details')
      expect(req.flash).toBeCalledWith('errors', [
        { href: '#description', text: 'Enter a court description between 2 and 200 characters' },
      ])
    })
    it('description must be more or equal to 2 characters when entered', async () => {
      const form = { ...validForm, description: 'A' }
      const nextPage = await validate(form, req, lookup)
      expect(nextPage).toEqual('/court-register/add-new-court-details')
      expect(req.flash).toBeCalledWith('errors', [
        { href: '#description', text: 'Enter a court description between 2 and 200 characters' },
      ])
    })
    it('description is optional', async () => {
      const form = { ...validForm, description: '' }
      const nextPage = await validate(form, req, lookup)
      expect(nextPage).toEqual('/court-register/add-new-court-building')
      expect(req.flash).toHaveBeenCalledTimes(0)
    })
    it('type must not be selected', async () => {
      const form = { ...validForm, type: '  ' }
      const nextPage = await validate(form, req, lookup)
      expect(nextPage).toEqual('/court-register/add-new-court-details')
      expect(req.flash).toBeCalledWith('errors', [{ href: '#type', text: 'Select a court type' }])
    })
  })
})
