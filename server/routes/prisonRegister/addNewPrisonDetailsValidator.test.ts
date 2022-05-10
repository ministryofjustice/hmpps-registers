import { Request } from 'express'
import type { AddNewPrisonForm } from 'prisonForms'
import { Prison } from '../../@types/prisonRegister'
import validate from './addNewPrisonDetailsValidator'
import data from '../testutils/mockPrisonData'

jest.mock('../../services/prisonRegisterService')

describe('addNewPrisonDetailsValidator', () => {
  const req = {
    flash: jest.fn() as (type: string, message: Array<Record<string, string>>) => number,
  } as Request

  const validForm: AddNewPrisonForm = {
    id: 'MDI',
    name: 'Moorland Prison',
    gender: ['male'],
    contracted: 'yes',
    prisonTypes: ['HMP'],
    addresstown: 'Doncaster',
    addresspostcode: 'DA1 1QA',
    addresscountry: 'England',
  }

  describe('validate', () => {
    let lookup: jest.Mocked<(id: string) => Promise<Prison>>
    beforeEach(() => {
      jest.resetAllMocks()
      lookup = jest.fn().mockResolvedValue(null)
    })

    it('returns next page when valid', async () => {
      const form = { ...validForm }
      const nextPage = await validate(form, req, lookup)
      expect(nextPage).toEqual('/prison-register/add-new-prison-address')
      expect(req.flash).toHaveBeenCalledTimes(0)
    })
    it('returns to summary page when valid and already complete', async () => {
      const form = { ...validForm, completed: true }
      const nextPage = await validate(form, req, lookup)
      expect(nextPage).toEqual('/prison-register/add-new-prison-summary')
    })
    it('id must not be a blank', async () => {
      const form = { ...validForm, id: '  ' }
      const nextPage = await validate(form, req, lookup)
      expect(nextPage).toEqual('/prison-register/add-new-prison-details')
      expect(req.flash).toBeCalledWith('errors', [{ href: '#id', text: 'Enter a prison code' }])
    })
    it('id must be greater than 2 characters', async () => {
      const form = { ...validForm, id: 'A' }
      const nextPage = await validate(form, req, lookup)
      expect(nextPage).toEqual('/prison-register/add-new-prison-details')
      expect(req.flash).toBeCalledWith('errors', [
        { href: '#id', text: 'Enter a prison code between 2 and 6 characters' },
      ])
    })
    it('id must be less or equal to 6 characters', async () => {
      const form = { ...validForm, id: 'A'.repeat(7) }
      const nextPage = await validate(form, req, lookup)
      expect(nextPage).toEqual('/prison-register/add-new-prison-details')
      expect(req.flash).toBeCalledWith('errors', [
        { href: '#id', text: 'Enter a prison code between 2 and 6 characters' },
      ])
    })
    it('id must not match an existing prison', async () => {
      const prison: Prison = data.prison({})
      lookup = jest.fn().mockResolvedValue(prison)

      const form = { ...validForm, id: 'AA' }
      const nextPage = await validate(form, req, lookup)
      expect(nextPage).toEqual('/prison-register/add-new-prison-details')
      expect(req.flash).toBeCalledWith('errors', [
        { href: '#id', text: 'Albany (HMP) already has that code. Choose another code' },
      ])
    })
    it('name must not be a blank', async () => {
      const form = { ...validForm, name: '  ' }
      const nextPage = await validate(form, req, lookup)
      expect(nextPage).toEqual('/prison-register/add-new-prison-details')
      expect(req.flash).toBeCalledWith('errors', [{ href: '#name', text: 'Enter a prison name' }])
    })
    it('name must be greater than 2 characters', async () => {
      const form = { ...validForm, name: 'A' }
      const nextPage = await validate(form, req, lookup)
      expect(nextPage).toEqual('/prison-register/add-new-prison-details')
      expect(req.flash).toBeCalledWith('errors', [
        { href: '#name', text: 'Enter a prison name between 2 and 80 characters' },
      ])
    })
    it('name must be less or equal to 80 characters', async () => {
      const form = { ...validForm, name: 'A'.repeat(81) }
      const nextPage = await validate(form, req, lookup)
      expect(nextPage).toEqual('/prison-register/add-new-prison-details')
      expect(req.flash).toBeCalledWith('errors', [
        { href: '#name', text: 'Enter a prison name between 2 and 80 characters' },
      ])
    })
    it('contracted must not be a blank', async () => {
      const form = { ...validForm, contracted: '' }
      const nextPage = await validate(form, req, lookup)
      expect(nextPage).toEqual('/prison-register/add-new-prison-details')
      expect(req.flash).toBeCalledWith('errors', [{ href: '#contracted', text: 'State whether prison is contracted' }])
    })
  })
})
