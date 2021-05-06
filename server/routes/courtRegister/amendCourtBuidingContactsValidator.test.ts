import { AmendCourtBuildingContactsForm } from 'forms'
import { Request } from 'express'
import validate, { amendCourtBuildingContactsFormCloneCleaner } from './amendCourtBuildingContactsValidator'

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
    it('none of the numbers can exceed 80 characters', async () => {
      const form: AmendCourtBuildingContactsForm = {
        courtId: 'SHFCC',
        buildingId: '1',
        buildingname: 'Crown Square',
        contacts: [
          {
            type: 'TEL',
            number: '1'.repeat(81),
            id: '1',
          },
          {
            type: 'FAX',
            number: '1'.repeat(81),
          },
        ],
      }
      const nextPage = await validate(form, req, updateService)
      expect(nextPage).toEqual('/court-register/amend-court-building-contacts')
      expect(req.flash).toBeCalledWith('errors', [
        { href: '#contacts[0][number]', text: 'Enter the number not greater than 80 characters' },
        { href: '#contacts[1][number]', text: 'Enter the number not greater than 80 characters' },
      ])
    })
    it('none of the phone types can be be a blank', async () => {
      const form: AmendCourtBuildingContactsForm = {
        courtId: 'SHFCC',
        buildingId: '1',
        buildingname: 'Crown Square',
        contacts: [
          {
            number: '0114 123 5432',
          },
        ],
      }
      const nextPage = await validate(form, req, updateService)
      expect(nextPage).toEqual('/court-register/amend-court-building-contacts')
      expect(req.flash).toBeCalledWith('errors', [{ href: '#contacts[0][type]', text: 'Select the type of number' }])
    })
  })
})

describe('amendCourtBuildingContactsFormCloneCleaner', () => {
  it('will clone the form unchanged when no duplicates', () => {
    const originalForm: AmendCourtBuildingContactsForm = {
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

    const cleanedForm = amendCourtBuildingContactsFormCloneCleaner(originalForm)

    expect(cleanedForm).toEqual({
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
    })
  })
  it('will remove orphaned contacts from form', () => {
    const originalForm: AmendCourtBuildingContactsForm = {
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
        {
          id: '99',
        },
      ],
    }

    const cleanedForm = amendCourtBuildingContactsFormCloneCleaner(originalForm)

    expect(cleanedForm).toEqual({
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
    })
  })
})
