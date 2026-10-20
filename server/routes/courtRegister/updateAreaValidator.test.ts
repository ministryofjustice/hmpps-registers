import type { UpdateAreaForm } from 'agencyForms'
import { Request } from 'express'
import validate from './updateAreaValidator'
import type { AgencyMutationResponse } from '../../services/hmppsAgencyRegisterApi'
import type { CodeDescription } from '../../@types/prisonRegister'

describe('updateAreaValidator', () => {
  const req = {
    query: { id: 'SHFCC' },
    flash: jest.fn(),
  } as unknown as Request
  const getAreas = jest.fn<Promise<CodeDescription[]>, []>()
  const updateArea = jest.fn<Promise<AgencyMutationResponse>, [string?]>()

  beforeEach(() => {
    jest.resetAllMocks()
    req.session = {} as Request['session']
    getAreas.mockResolvedValue([
      { code: 'YH', description: 'Yorkshire and the Humber' },
      { code: 'NW', description: 'North West' },
    ])
    updateArea.mockResolvedValue({ success: true })
  })

  it('rejects description-only input instead of silently clearing the reference', async () => {
    await validate({ areaCode: '', areaDescription: 'Unselected text' }, req, getAreas, updateArea)
    expect(req.flash).toHaveBeenCalledWith('errors', [
      { href: '#area', text: 'Select a valid area from the suggestions' },
    ])
    expect(updateArea).not.toHaveBeenCalled()
    expect(getAreas).not.toHaveBeenCalled()
  })

  it.each(['YH', 'NW'])('accepts the known area code %s', async areaCode => {
    const nextPage = await validate(
      { areaCode, areaDescription: 'Not the area description' },
      req,
      getAreas,
      updateArea,
    )

    expect(nextPage).toEqual('/court-register/details?id=SHFCC&action=UPDATED')
    expect(getAreas).toHaveBeenCalledTimes(1)
    expect(updateArea).toHaveBeenCalledTimes(1)
    expect(updateArea).toHaveBeenCalledWith(areaCode)
    expect(req.flash).not.toHaveBeenCalled()
  })

  it.each([{}, { areaCode: '' }])('clears the area without loading reference data for %j', async form => {
    const nextPage = await validate(form as UpdateAreaForm, req, getAreas, updateArea)

    expect(nextPage).toEqual('/court-register/details?id=SHFCC&action=UPDATED')
    expect(getAreas).not.toHaveBeenCalled()
    expect(updateArea).toHaveBeenCalledTimes(1)
    expect(updateArea).toHaveBeenCalledWith(undefined)
    expect(req.flash).not.toHaveBeenCalled()
  })

  it.each(['XX', 'yh', 'YH ', 'Yorkshire and the Humber'])('rejects an unknown code %p', async areaCode => {
    const nextPage = await validate(
      { areaCode, areaDescription: 'Yorkshire and the Humber' },
      req,
      getAreas,
      updateArea,
    )

    expect(nextPage).toEqual('/court-register/area/update?id=SHFCC')
    expect(req.flash).toHaveBeenCalledWith('errors', [
      { href: '#area', text: 'Select a valid area from the suggestions' },
    ])
    expect(updateArea).not.toHaveBeenCalled()
  })

  it('rejects a selected code when no areas are available', async () => {
    getAreas.mockResolvedValue([])

    expect(await validate({ areaCode: 'YH', areaDescription: '' }, req, getAreas, updateArea)).toEqual(
      '/court-register/area/update?id=SHFCC',
    )
    expect(req.flash).toHaveBeenCalledWith('errors', [
      { href: '#area', text: 'Select a valid area from the suggestions' },
    ])
    expect(updateArea).not.toHaveBeenCalled()
  })

  it.each(['YH', ''])('shows API user messages when updating area %p is rejected', async areaCode => {
    updateArea.mockResolvedValue({ success: false, userMessage: 'Area cannot be changed' })

    expect(await validate({ areaCode, areaDescription: '' }, req, getAreas, updateArea)).toEqual(
      '/court-register/area/update?id=SHFCC',
    )
    expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#area', text: 'Area cannot be changed' }])
  })

  it('propagates reference data failures without updating or flashing a validation error', async () => {
    const error = new Error('Reference data unavailable')
    getAreas.mockRejectedValue(error)

    await expect(validate({ areaCode: 'YH', areaDescription: '' }, req, getAreas, updateArea)).rejects.toBe(error)

    expect(updateArea).not.toHaveBeenCalled()
    expect(req.flash).not.toHaveBeenCalled()
  })

  it('propagates unexpected update errors', async () => {
    const error = new Error('Update unavailable')
    updateArea.mockRejectedValue(error)

    await expect(validate({ areaCode: 'YH', areaDescription: '' }, req, getAreas, updateArea)).rejects.toBe(error)

    expect(req.flash).not.toHaveBeenCalled()
  })
})
