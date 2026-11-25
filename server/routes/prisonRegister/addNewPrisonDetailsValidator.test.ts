import { Request } from 'express'
import type { AddNewPrisonForm } from 'prisonForms'
import { Prison } from '../../@types/prisonRegister'
import validate, { prisonOperatorFor } from './addNewPrisonDetailsValidator'
import data from '../testutils/mockPrisonData'

jest.mock('../../services/hmppsAgencyRegisterApi')

describe('addNewPrisonDetailsValidator', () => {
  const req = {
    flash: jest.fn() as (type: string, message: Array<Record<string, string>>) => number,
  } as Request

  const validForm: AddNewPrisonForm = {
    id: 'MDI',
    name: 'Moorland Prison',
    prisonNameInWelsh: '',
    gender: ['male'],
    contracted: 'yes',
    operator: '2',
    lthse: 'no',
    prisonTypes: ['HMP'],
    addresstown: 'Doncaster',
    addresspostcode: 'DA1 1QA',
    addresscountry: 'England',
  }

  const operators = [
    { id: 1, name: 'PSP' },
    { id: 2, name: 'Serco' },
  ]

  describe('validate', () => {
    let lookup: jest.Mocked<(id: string) => Promise<Prison>>
    beforeEach(() => {
      jest.resetAllMocks()
      lookup = jest.fn().mockResolvedValue(null)
    })

    it('returns next page when valid', async () => {
      const form = { ...validForm }
      const nextPage = await validate(form, req, lookup, operators)
      expect(nextPage).toEqual('/prison-register/add-new-prison-address')
      expect(req.flash).toHaveBeenCalledTimes(0)
    })
    it('returns to summary page when valid and already complete', async () => {
      const form = { ...validForm, completed: true }
      const nextPage = await validate(form, req, lookup, operators)
      expect(nextPage).toEqual('/prison-register/add-new-prison-summary')
    })
    it('id must not be a blank', async () => {
      const form = { ...validForm, id: '  ' }
      const nextPage = await validate(form, req, lookup, operators)
      expect(nextPage).toEqual('/prison-register/add-new-prison-details')
      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#id', text: 'Enter a prison code' }])
    })
    it('id must be at least 3 characters', async () => {
      const form = { ...validForm, id: 'AB' }
      const nextPage = await validate(form, req, lookup, operators)
      expect(nextPage).toEqual('/prison-register/add-new-prison-details')
      expect(req.flash).toHaveBeenCalledWith('errors', [
        { href: '#id', text: 'Enter a prison code between 3 and 6 characters' },
      ])
    })
    it('id must be less or equal to 6 characters', async () => {
      const form = { ...validForm, id: 'A'.repeat(7) }
      const nextPage = await validate(form, req, lookup, operators)
      expect(nextPage).toEqual('/prison-register/add-new-prison-details')
      expect(req.flash).toHaveBeenCalledWith('errors', [
        { href: '#id', text: 'Enter a prison code between 3 and 6 characters' },
      ])
    })
    it('id must not match an existing prison', async () => {
      const prison: Prison = data.prison({})
      lookup = jest.fn().mockResolvedValue(prison)

      const form = { ...validForm, id: 'AAA' }
      const nextPage = await validate(form, req, lookup, operators)
      expect(nextPage).toEqual('/prison-register/add-new-prison-details')
      expect(req.flash).toHaveBeenCalledWith('errors', [
        { href: '#id', text: 'Albany (HMP) already has that code. Choose another code' },
      ])
    })
    it('name must not be a blank', async () => {
      const form = { ...validForm, name: '  ' }
      const nextPage = await validate(form, req, lookup, operators)
      expect(nextPage).toEqual('/prison-register/add-new-prison-details')
      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#name', text: 'Enter a prison name' }])
    })
    it('name must be at least 3 characters', async () => {
      const form = { ...validForm, name: 'AB' }
      const nextPage = await validate(form, req, lookup, operators)
      expect(nextPage).toEqual('/prison-register/add-new-prison-details')
      expect(req.flash).toHaveBeenCalledWith('errors', [
        { href: '#name', text: 'Enter a prison name between 3 and 40 characters' },
      ])
    })
    it('name must be 40 characters or fewer, as the API requires', async () => {
      const form = { ...validForm, name: 'A'.repeat(41) }
      const nextPage = await validate(form, req, lookup, operators)
      expect(nextPage).toEqual('/prison-register/add-new-prison-details')
      expect(req.flash).toHaveBeenCalledWith('errors', [
        { href: '#name', text: 'Enter a prison name between 3 and 40 characters' },
      ])
    })
    it('Welsh name may be left blank', async () => {
      const form = { ...validForm, prisonNameInWelsh: '' }
      const nextPage = await validate(form, req, lookup, operators)
      expect(nextPage).toEqual('/prison-register/add-new-prison-address')
    })
    it('Welsh name must be at least 3 characters when given', async () => {
      const form = { ...validForm, prisonNameInWelsh: 'AB' }
      const nextPage = await validate(form, req, lookup, operators)
      expect(nextPage).toEqual('/prison-register/add-new-prison-details')
      expect(req.flash).toHaveBeenCalledWith('errors', [
        { href: '#prisonNameInWelsh', text: 'Enter a prison name in Welsh between 3 and 80 characters' },
      ])
    })
    it('a contracted prison must have an operator', async () => {
      const form: AddNewPrisonForm = { ...validForm, contracted: 'yes', operator: undefined }
      const nextPage = await validate(form, req, lookup, operators)
      expect(nextPage).toEqual('/prison-register/add-new-prison-details')
      expect(req.flash).toHaveBeenCalledWith('errors', [
        { href: '#operator', text: 'Select the operator of the prison' },
      ])
    })
    it('the operator must be one of the operators', async () => {
      const form = { ...validForm, contracted: 'yes', operator: '99' }
      const nextPage = await validate(form, req, lookup, operators)
      expect(nextPage).toEqual('/prison-register/add-new-prison-details')
      expect(req.flash).toHaveBeenCalledWith('errors', [
        { href: '#operator', text: 'Select the operator of the prison' },
      ])
    })
    it('a prison that is not contracted needs no operator', async () => {
      const form: AddNewPrisonForm = { ...validForm, contracted: 'no', operator: undefined }
      const nextPage = await validate(form, req, lookup, operators)
      expect(nextPage).toEqual('/prison-register/add-new-prison-address')
    })
    it('contracted must not be a blank', async () => {
      const form = { ...validForm, contracted: '' }
      const nextPage = await validate(form, req, lookup, operators)
      expect(nextPage).toEqual('/prison-register/add-new-prison-details')
      expect(req.flash).toHaveBeenCalledWith('errors', [
        { href: '#contracted', text: 'State whether prison is contracted' },
      ])
    })
  })
})

describe('prisonOperatorFor', () => {
  const operators = [
    { id: 1, name: 'PSP' },
    { id: 2, name: 'Serco' },
  ]
  const form: Omit<AddNewPrisonForm, 'contracted'> = {
    name: 'Moorland Prison',
    gender: [],
    lthse: 'no',
    addresstown: '',
    addresspostcode: '',
    addresscountry: '',
  }

  it('is the operator chosen for a contracted prison', () => {
    expect(prisonOperatorFor({ ...form, contracted: 'yes', operator: '2' }, operators)).toEqual({
      id: 2,
      name: 'Serco',
    })
  })

  it('is PSP for a prison that is not contracted, whatever was chosen before', () => {
    expect(prisonOperatorFor({ ...form, contracted: 'no', operator: '2' }, operators)).toEqual({ id: 1, name: 'PSP' })
  })

  it('is nothing when a contracted prison has no operator chosen yet', () => {
    expect(prisonOperatorFor({ ...form, contracted: 'yes' }, operators)).toBeUndefined()
  })
})
