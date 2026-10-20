import { Request } from 'express'
import type { UpdateRegionForm } from 'agencyForms'
import validate from './updateRegionValidator'
import type { CourtMutationResponse } from '../../services/hmppsAgencyRegisterApi'
import type { CodeDescription } from '../../@types/prisonRegister'

describe('updateRegionValidator', () => {
  const req = {
    query: { id: 'SHFCC' },
    flash: jest.fn(),
  } as unknown as Request
  const getRegions = jest.fn<Promise<CodeDescription[]>, []>()
  const updateRegion = jest.fn<Promise<CourtMutationResponse>, [string?]>()

  beforeEach(() => {
    jest.resetAllMocks()
    getRegions.mockResolvedValue([
      { code: 'YH', description: 'Yorkshire and the Humber' },
      { code: 'NE', description: 'North East' },
    ])
    updateRegion.mockResolvedValue({ success: true })
  })

  it.each(['YH', 'NE'])('accepts the known region code %s', async regionCode => {
    const nextPage = await validate(
      { regionCode, regionDescription: 'Not the region description' },
      req,
      getRegions,
      updateRegion,
    )

    expect(nextPage).toBe('/court-register/details?id=SHFCC&action=UPDATED')
    expect(getRegions).toHaveBeenCalledTimes(1)
    expect(updateRegion).toHaveBeenCalledWith(regionCode)
    expect(req.flash).not.toHaveBeenCalled()
  })

  it.each([{}, { regionCode: '' }, { regionDescription: 'Yorkshire and the Humber' }])(
    'clears the region without loading reference data for %j',
    async form => {
      const nextPage = await validate(form as UpdateRegionForm, req, getRegions, updateRegion)

      expect(nextPage).toBe('/court-register/details?id=SHFCC&action=UPDATED')
      expect(getRegions).not.toHaveBeenCalled()
      expect(updateRegion).toHaveBeenCalledWith(undefined)
      expect(req.flash).not.toHaveBeenCalled()
    },
  )

  it('rejects an unknown region code', async () => {
    const nextPage = await validate(
      { regionCode: 'North East', regionDescription: 'North East' },
      req,
      getRegions,
      updateRegion,
    )

    expect(nextPage).toBe('/court-register/region/update?id=SHFCC')
    expect(req.flash).toHaveBeenCalledWith('errors', [
      { href: '#region', text: 'Select a valid region from the suggestions' },
    ])
    expect(updateRegion).not.toHaveBeenCalled()
  })

  it('shows API user messages when the region update is rejected', async () => {
    updateRegion.mockResolvedValue({ success: false, userMessage: 'Region cannot be changed' })

    expect(await validate({ regionCode: 'YH' }, req, getRegions, updateRegion)).toBe(
      '/court-register/region/update?id=SHFCC',
    )
    expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#region', text: 'Region cannot be changed' }])
  })

  it('propagates reference data failures', async () => {
    const error = new Error('Reference data unavailable')
    getRegions.mockRejectedValue(error)

    await expect(validate({ regionCode: 'YH' }, req, getRegions, updateRegion)).rejects.toBe(error)
    expect(updateRegion).not.toHaveBeenCalled()
  })
})
