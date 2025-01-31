import type { AmendPrisonDetailsForm } from 'prisonForms'
import { Request } from 'express'
import validate from './amendPrisonDetailsValidator'

jest.mock('../../services/prisonRegisterService')

describe('amendPrisonDetailsValidator', () => {
  const req = {
    flash: jest.fn() as (type: string, message: Array<Record<string, string>>) => number,
  } as unknown as Request

  const validForm: AmendPrisonDetailsForm = {
    id: 'MDI',
    name: 'Moorland Prison',
    prisonNameInWelsh: '',
    gender: ['male'],
    prisonTypes: ['HMP'],
    contracted: 'yes',
    lthse: 'no',
  }

  describe('validate', () => {
    let updateService: jest.Mocked<(id: string) => Promise<void>>
    beforeEach(() => {
      jest.resetAllMocks()
      updateService = jest.fn().mockResolvedValue(null)
    })

    it('returns page to details page when valid', async () => {
      const form = { ...validForm }
      const nextPage = await validate(form, req, updateService)
      expect(nextPage).toEqual('/prison-register/details?id=MDI&action=UPDATED')
      expect(req.flash).toHaveBeenCalledTimes(0)
    })
    it('calls update service when valid', async () => {
      const form = { ...validForm, name: 'Moorland Prison', gender: ['male'] }
      const nextPage = await validate(form, req, updateService)
      expect(nextPage).toEqual('/prison-register/details?id=MDI&action=UPDATED')
      expect(updateService).toHaveBeenCalledWith(
        form.id,
        form.name,
        form.prisonNameInWelsh,
        form.contracted,
        form.lthse,
        form.gender,
        form.prisonTypes,
      )
    })
    it('name must not be a blank', async () => {
      const form = { ...validForm, name: '  ' }
      const nextPage = await validate(form, req, updateService)
      expect(nextPage).toEqual('/prison-register/amend-prison-details')
      expect(req.flash).toBeCalledWith('errors', [{ href: '#name', text: 'Enter a prison name' }])
    })
    it('name must be greater than 3 characters', async () => {
      const form = { ...validForm, name: 'AA' }
      const nextPage = await validate(form, req, updateService)
      expect(nextPage).toEqual('/prison-register/amend-prison-details')
      expect(req.flash).toBeCalledWith('errors', [
        { href: '#name', text: 'Enter a prison name between 3 and 80 characters' },
      ])
    })
    it('name must be less or equal to 80 characters', async () => {
      const form = { ...validForm, name: 'A'.repeat(81) }
      const nextPage = await validate(form, req, updateService)
      expect(nextPage).toEqual('/prison-register/amend-prison-details')
      expect(req.flash).toBeCalledWith('errors', [
        { href: '#name', text: 'Enter a prison name between 3 and 80 characters' },
      ])
    })

    it('welsh name must be geater than 3 chars if present', async () => {
      const form = { ...validForm, prisonNameInWelsh: 'A'.repeat(2) }
      const nextPage = await validate(form, req, updateService)
      expect(nextPage).toEqual('/prison-register/amend-prison-details')
      expect(req.flash).toBeCalledWith('errors', [
        { href: '#prisonNameInWelsh', text: 'Enter a prison name in Welsh between 3 and 80 characters' },
      ])
    })

    it('welsh name must be less than 80 chars if present', async () => {
      const form = { ...validForm, prisonNameInWelsh: 'A'.repeat(81) }
      const nextPage = await validate(form, req, updateService)
      expect(nextPage).toEqual('/prison-register/amend-prison-details')
      expect(req.flash).toBeCalledWith('errors', [
        { href: '#prisonNameInWelsh', text: 'Enter a prison name in Welsh between 3 and 80 characters' },
      ])
    })
  })
})
