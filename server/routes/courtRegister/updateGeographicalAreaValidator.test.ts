import { Request } from 'express'
import type { UpdateGeographicalAreaForm } from 'agencyForms'
import validate from './updateGeographicalAreaValidator'
import type { CourtMutationResponse } from '../../services/hmppsAgencyRegisterApi'
import type { CodeDescription } from '../../@types/prisonRegister'

describe('updateGeographicalAreaValidator', () => {
  const req = {
    query: { id: 'SHFCC' },
    flash: jest.fn(),
  } as unknown as Request
  const getGeographicalAreas = jest.fn<Promise<CodeDescription[]>, []>()
  const updateGeographicalArea = jest.fn<Promise<CourtMutationResponse>, [string?]>()

  beforeEach(() => {
    jest.resetAllMocks()
    getGeographicalAreas.mockResolvedValue([
      { code: 'YH', description: 'Yorkshire and the Humber' },
      { code: 'NE', description: 'North East' },
    ])
    updateGeographicalArea.mockResolvedValue({ success: true })
  })

  it.each(['YH', 'NE'])('accepts the known geographical area code %s', async geographicalAreaCode => {
    const nextPage = await validate(
      { geographicalAreaCode, geographicalAreaDescription: 'Not the geographical area description' },
      req,
      getGeographicalAreas,
      updateGeographicalArea,
    )

    expect(nextPage).toBe('/court-register/details?id=SHFCC&action=UPDATED')
    expect(getGeographicalAreas).toHaveBeenCalledTimes(1)
    expect(updateGeographicalArea).toHaveBeenCalledWith(geographicalAreaCode)
    expect(req.flash).not.toHaveBeenCalled()
  })

  it.each([{}, { geographicalAreaCode: '' }, { geographicalAreaDescription: 'Yorkshire and the Humber' }])(
    'clears the geographical area without loading reference data for %j',
    async form => {
      const nextPage = await validate(
        form as UpdateGeographicalAreaForm,
        req,
        getGeographicalAreas,
        updateGeographicalArea,
      )

      expect(nextPage).toBe('/court-register/details?id=SHFCC&action=UPDATED')
      expect(getGeographicalAreas).not.toHaveBeenCalled()
      expect(updateGeographicalArea).toHaveBeenCalledWith(undefined)
      expect(req.flash).not.toHaveBeenCalled()
    },
  )

  it('rejects an unknown geographical area code', async () => {
    const nextPage = await validate(
      { geographicalAreaCode: 'North East', geographicalAreaDescription: 'North East' },
      req,
      getGeographicalAreas,
      updateGeographicalArea,
    )

    expect(nextPage).toBe('/court-register/geographical-area/update?id=SHFCC')
    expect(req.flash).toHaveBeenCalledWith('errors', [
      { href: '#geographicalArea', text: 'Select a valid geographical area from the suggestions' },
    ])
    expect(updateGeographicalArea).not.toHaveBeenCalled()
  })

  it('shows API user messages when the geographical area update is rejected', async () => {
    updateGeographicalArea.mockResolvedValue({ success: false, userMessage: 'Geographical area cannot be changed' })

    expect(await validate({ geographicalAreaCode: 'YH' }, req, getGeographicalAreas, updateGeographicalArea)).toBe(
      '/court-register/geographical-area/update?id=SHFCC',
    )
    expect(req.flash).toHaveBeenCalledWith('errors', [
      { href: '#geographicalArea', text: 'Geographical area cannot be changed' },
    ])
  })

  it('propagates reference data failures', async () => {
    const error = new Error('Reference data unavailable')
    getGeographicalAreas.mockRejectedValue(error)

    await expect(
      validate({ geographicalAreaCode: 'YH' }, req, getGeographicalAreas, updateGeographicalArea),
    ).rejects.toBe(error)
    expect(updateGeographicalArea).not.toHaveBeenCalled()
  })
})
