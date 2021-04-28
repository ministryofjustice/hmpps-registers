import { AmendCourtBuildingContactsForm } from 'forms'
import { Request } from 'express'
import validate from './amendCourtBuildingContactsValidator'

describe('amendCourtBuildingContactsValidator', () => {
  const req = {
    flash: jest.fn() as (type: string, message: Array<Record<string, string>>) => number,
  } as Request

  describe('validate', () => {
    let updateService: jest.Mocked<(form: AmendCourtBuildingContactsForm) => Promise<void>>
    beforeEach(() => {
      updateService = jest.fn().mockResolvedValue(null)
    })
    it('returns back to details page when valid', async () => {
      const form: AmendCourtBuildingContactsForm = {
        courtId: 'SHFCC',
        buildingId: '1',
        buildingname: 'Crown Square',
        contacts: [
          {
            type: 'FAX',
            number: '0114 555 1234',
          },
        ],
      }
      const nextPage = await validate(form, req, updateService)
      expect(nextPage).toEqual('/court-register/details?id=SHFCC&action=UPDATED')
      expect(req.flash).toHaveBeenCalledTimes(0)
    })
    it('will call update service when valid', async () => {
      const form: AmendCourtBuildingContactsForm = {
        courtId: 'SHFCC',
        buildingId: '1',
        buildingname: 'Crown Square',
        contacts: [
          {
            type: 'FAX',
            number: '0114 555 1234',
          },
        ],
      }
      await validate(form, req, updateService)
      expect(updateService).toHaveBeenCalledWith(form)
    })
    it('none of the numbers can be be a blank', async () => {
      const form: AmendCourtBuildingContactsForm = {
        courtId: 'SHFCC',
        buildingId: '1',
        buildingname: 'Crown Square',
        contacts: [
          {
            type: 'TEL',
            number: ' ',
            id: '1',
          },
          {
            type: 'FAX',
            number: ' ',
          },
        ],
      }
      const nextPage = await validate(form, req, updateService)
      expect(nextPage).toEqual('/court-register/amend-court-building-contacts')
      expect(req.flash).toBeCalledWith('errors', [
        { href: '#contacts[0][number]', text: 'Enter the number' },
        { href: '#contacts[1][number]', text: 'Enter the number' },
      ])
    })
  })
})
