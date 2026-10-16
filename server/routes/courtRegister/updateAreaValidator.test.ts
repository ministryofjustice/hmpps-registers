import type { UpdateAreaForm } from 'agencyForms'
import { Request } from 'express'
import validate from './updateAreaValidator'
import type { CourtMutationResponse } from '../../services/prisonRegisterService'
import type { CodeDescription } from '../../@types/prisonRegister'

describe('updateAreaValidator', () => {
  const req = {
    query: { id: 'SHFCC' },
    flash: jest.fn(),
  } as unknown as Request
  const getAreas = jest.fn<Promise<CodeDescription[]>, []>()
  const updateArea = jest.fn<Promise<CourtMutationResponse>, [string?]>()

  beforeEach(() => {
    jest.resetAllMocks()
    getAreas.mockResolvedValue([
      { code: 'YH', description: 'Yorkshire and the Humber' },
      { code: 'NW', description: 'North West' },
    ])
    updateArea.mockResolvedValue({ success: true })
  })

  it.each(['YH - Yorkshire and the Humber', 'NW - North West'])('accepts the known area code %s', async areaName => {
    const nextPage = await validate({ areaName }, req, getAreas, updateArea)

    expect(nextPage).toEqual('/court-register/details?id=SHFCC&action=UPDATED')
    expect(getAreas).toHaveBeenCalledTimes(1)
    expect(updateArea).toHaveBeenCalledTimes(1)
    expect(updateArea).toHaveBeenCalledWith(areaName.split(' - ')[0])
    expect(req.flash).not.toHaveBeenCalled()
  })

  it.each([{}, { areaName: '' }])('clears the area without loading reference data for %j', async form => {
    const nextPage = await validate(form as UpdateAreaForm, req, getAreas, updateArea)

    expect(nextPage).toEqual('/court-register/details?id=SHFCC&action=UPDATED')
    expect(getAreas).not.toHaveBeenCalled()
    expect(updateArea).toHaveBeenCalledTimes(1)
    expect(updateArea).toHaveBeenCalledWith(undefined)
    expect(req.flash).not.toHaveBeenCalled()
  })

  it.each(['XX', 'yh', 'YH ', 'Yorkshire and the Humber'])('rejects an unknown code %p', async areaName => {
    const nextPage = await validate({ areaName }, req, getAreas, updateArea)

    expect(nextPage).toEqual('/court-register/area/update?id=SHFCC')
    expect(req.flash).toHaveBeenCalledWith('errors', [
      { href: '#area-name', text: 'Select a valid area from the suggestions' },
    ])
    expect(updateArea).not.toHaveBeenCalled()
  })

  it('rejects a selected code when no areas are available', async () => {
    getAreas.mockResolvedValue([])

    expect(await validate({ areaName: 'YH - Yorkshire and the Humber' }, req, getAreas, updateArea)).toEqual(
      '/court-register/area/update?id=SHFCC',
    )
    expect(req.flash).toHaveBeenCalledWith('errors', [
      { href: '#area-name', text: 'Select a valid area from the suggestions' },
    ])
    expect(updateArea).not.toHaveBeenCalled()
  })

  it.each(['YH - Yorkshire and the Humber', ''])(
    'shows API user messages when updating area %p is rejected',
    async areaName => {
      updateArea.mockResolvedValue({ success: false, userMessage: 'Area cannot be changed' })

      expect(await validate({ areaName }, req, getAreas, updateArea)).toEqual('/court-register/area/update?id=SHFCC')
      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#area-name', text: 'Area cannot be changed' }])
    },
  )

  it('propagates reference data failures without updating or flashing a validation error', async () => {
    const error = new Error('Reference data unavailable')
    getAreas.mockRejectedValue(error)

    await expect(validate({ areaName: 'YH - Yorkshire and the Humber' }, req, getAreas, updateArea)).rejects.toBe(error)

    expect(updateArea).not.toHaveBeenCalled()
    expect(req.flash).not.toHaveBeenCalled()
  })

  it('propagates unexpected update errors', async () => {
    const error = new Error('Update unavailable')
    updateArea.mockRejectedValue(error)

    await expect(validate({ areaName: 'YH - Yorkshire and the Humber' }, req, getAreas, updateArea)).rejects.toBe(error)

    expect(req.flash).not.toHaveBeenCalled()
  })
})
