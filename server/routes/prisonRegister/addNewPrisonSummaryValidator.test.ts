import type { AddNewPrisonForm } from 'prisonForms'
import { Request } from 'express'
import validate from './addNewPrisonSummaryValidator'
import { AddUpdateResponse } from '../../services/prisonRegisterService'
import { InsertPrison } from '../../@types/prisonRegister'

describe('addNewPrisonSummaryValidator', () => {
  const req = {
    flash: jest.fn() as (type: string, message: Array<Record<string, string>>) => number,
  } as Request

  const form: AddNewPrisonForm = {
    id: 'MDI',
    name: 'Moorland Prison',
    gender: ['male'],
    prisonTypes: ['HMP'],
    addressline1: '',
    addressline2: '',
    addresstown: 'Doncaster',
    addresscounty: 'South Yorkshire',
    addresspostcode: 'DA1 1QA',
    addresscountry: 'England',
  }

  describe('validate', () => {
    let addPrisonService: jest.Mocked<(addPrison: InsertPrison) => Promise<AddUpdateResponse>>
    beforeEach(() => {
      addPrisonService = jest.fn().mockResolvedValue({ success: true })
    })

    it('sends all data captured to service', async () => {
      await validate(form, req, addPrisonService)
      const expectedPrison: InsertPrison = {
        prisonId: 'MDI',
        prisonName: 'Moorland Prison',
        prisonTypes: ['HMP'],
        male: true,
        female: false,
        active: true,
        addresses: [
          {
            addressLine1: '',
            addressLine2: '',
            town: 'Doncaster',
            county: 'South Yorkshire',
            postcode: 'DA1 1QA',
            country: 'England',
          },
        ],
      }

      expect(addPrisonService).toBeCalledWith(expectedPrison)
    })

    it('returns next page when add prison succeeds', async () => {
      const nextPage = await validate(form, req, addPrisonService)
      expect(nextPage).toEqual('/prison-register/add-new-prison-finished')
      expect(req.flash).toHaveBeenCalledTimes(0)
    })
    it('returns back to summary page when add prison fails', async () => {
      addPrisonService = jest.fn().mockResolvedValue({ success: false, errorMessage: 'service not available' })
      const nextPage = await validate(form, req, addPrisonService)
      expect(nextPage).toEqual('/prison-register/add-new-prison-summary')
      expect(req.flash).toBeCalledWith('errors', [{ text: 'service not available' }])
    })
  })
})
