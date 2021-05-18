import { AddNewCourtForm } from 'forms'
import { Request } from 'express'
import validate from './addNewCourtSummaryValidator'
import { AddCourt, AddUpdateResponse } from '../../services/courtRegisterService'

describe('addNewCourtSummaryValidator', () => {
  const req = {
    flash: jest.fn() as (type: string, message: Array<Record<string, string>>) => number,
  } as Request

  const form: AddNewCourtForm = {
    id: 'SHFCC',
    name: 'Sheffield Crown Court',
    type: 'CRN',
    description: '',
    buildingname: 'Crown Square',
    addressline1: '1 High Street',
    addressline2: 'Town Centre',
    addresstown: 'Sheffield',
    addresscounty: 'South Yorkshire',
    addresspostcode: 'S1 2BJ',
    addresscountry: 'England',
    telephonenumber: '0114 123 4567',
    faxnumber: '0114 555 4567',
  }
  describe('validate', () => {
    let addCourtService: jest.Mocked<(addCourt: AddCourt) => Promise<AddUpdateResponse>>
    beforeEach(() => {
      addCourtService = jest.fn().mockResolvedValue({ success: true })
    })

    it('sends all data captured to service', async () => {
      await validate(form, req, addCourtService)
      const expectedCourt: AddCourt = {
        court: {
          courtId: 'SHFCC',
          courtName: 'Sheffield Crown Court',
          courtType: 'CRN',
          active: true,
        },
        building: {
          buildingName: 'Crown Square',
          street: '1 High Street',
          locality: 'Town Centre',
          town: 'Sheffield',
          county: 'South Yorkshire',
          postcode: 'S1 2BJ',
          country: 'England',
          active: true,
        },
        contacts: [
          {
            type: 'TEL',
            detail: '0114 123 4567',
          },
          {
            type: 'FAX',
            detail: '0114 555 4567',
          },
        ],
      }
      expect(addCourtService).toBeCalledWith(expectedCourt)
    })
    it('returns next page when add court succeeds', async () => {
      const nextPage = await validate(form, req, addCourtService)
      expect(nextPage).toEqual('/court-register/add-new-court-finished')
      expect(req.flash).toHaveBeenCalledTimes(0)
    })
    it('returns back to summary page when add court fails', async () => {
      addCourtService = jest.fn().mockResolvedValue({ success: false, errorMessage: 'service not available' })
      const nextPage = await validate(form, req, addCourtService)
      expect(nextPage).toEqual('/court-register/add-new-court-summary')
      expect(req.flash).toBeCalledWith('errors', [{ text: 'service not available' }])
    })
  })
})
