import type { UpdateCourtTypeForm } from 'agencyForms'
import { Request } from 'express'
import validate from './updateCourtTypeValidator'
import type { AgencyMutationResponse } from '../../services/hmppsAgencyRegisterApi'

describe('updateCourtTypeValidator', () => {
  const req = {
    query: { id: 'SHFCC' },
    flash: jest.fn() as (type: string, message: Array<Record<string, string>>) => number,
  } as unknown as Request

  const updateCourtType = jest.fn<Promise<AgencyMutationResponse>, [string]>()

  beforeEach(() => {
    jest.resetAllMocks()
    updateCourtType.mockResolvedValue({ success: true })
  })

  it.each(['CACD', 'CB', 'CC', 'CO', 'DCM', 'GCM', 'IMM', 'MC', 'OTHER', 'YC', 'UNK'])(
    'accepts court type %s and updates the court',
    async courtType => {
      const nextPage = await validate({ courtType }, req, updateCourtType)

      expect(nextPage).toEqual('/court-register/details?id=SHFCC&action=UPDATED')
      expect(updateCourtType).toHaveBeenCalledWith(courtType)
      expect(req.flash).not.toHaveBeenCalled()
    },
  )

  it.each([undefined, ''])('court type must be present: %p', async courtType => {
    const nextPage = await validate({ courtType } as unknown as UpdateCourtTypeForm, req, updateCourtType)

    expect(nextPage).toEqual('/court-register/court-type/update?id=SHFCC')
    expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#courtType', text: 'Select a court type' }])
    expect(updateCourtType).not.toHaveBeenCalled()
  })

  it.each(['XX', 'cc', 'Crown Court', 'CC '])('court type must be a known code: %p', async courtType => {
    const nextPage = await validate({ courtType }, req, updateCourtType)

    expect(nextPage).toEqual('/court-register/court-type/update?id=SHFCC')
    expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#courtType', text: 'Select a valid court type' }])
    expect(updateCourtType).not.toHaveBeenCalled()
  })

  it('flashes the API user message and returns to the form when updating fails', async () => {
    updateCourtType.mockResolvedValue({ success: false, userMessage: 'Court type not allowed' })

    expect(await validate({ courtType: 'CC' }, req, updateCourtType)).toEqual(
      '/court-register/court-type/update?id=SHFCC',
    )
    expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#courtType', text: 'Court type not allowed' }])
  })

  it('propagates unexpected API errors', async () => {
    updateCourtType.mockRejectedValue(new Error('Server error'))

    await expect(validate({ courtType: 'CC' }, req, updateCourtType)).rejects.toThrow('Server error')
    expect(req.flash).not.toHaveBeenCalled()
  })
})
