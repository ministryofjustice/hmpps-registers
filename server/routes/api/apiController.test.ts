import type { Request, Response } from 'express'
import ApiController from './apiController'
import PrisonRegisterService from '../../services/prisonRegisterService'
import HmppsAuthClient from '../../data/hmppsAuthClient'
import { CodeDescription } from '../../@types/prisonRegister'

jest.mock('../../services/prisonRegisterService')

describe('API controller', () => {
  let prisonRegisterService: jest.Mocked<PrisonRegisterService>
  let controller: ApiController
  let req: Request
  let res: Response

  beforeEach(() => {
    prisonRegisterService = new PrisonRegisterService({} as HmppsAuthClient) as jest.Mocked<PrisonRegisterService>
    controller = new ApiController(prisonRegisterService)
    req = { query: {} } as Request
    res = {
      locals: { user: { username: 'tom' } },
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response
  })

  afterEach(jest.resetAllMocks)

  describe.each([
    {
      method: 'searchArea' as const,
      serviceMethod: 'getAreas' as const,
      suggestions: [
        { code: 'YH', description: 'Yorkshire and the Humber' },
        { code: 'NW', description: 'North West' },
        { code: 'NE', description: 'North East' },
      ],
      query: 'oRtH',
      matchingIndexes: [1, 2],
    },
    {
      method: 'searchRegion' as const,
      serviceMethod: 'getRegions' as const,
      suggestions: [
        { code: 'YH', description: 'Yorkshire and the Humber' },
        { code: 'NW', description: 'North West' },
        { code: 'NE', description: 'North East' },
      ],
      query: 'oRtH',
      matchingIndexes: [1, 2],
    },
    {
      method: 'searchTown' as const,
      serviceMethod: 'getTownSuggestions' as const,
      suggestions: [
        { code: 'SHEF', description: 'Sheffield' },
        { code: 'LEED', description: 'Leeds' },
        { code: 'CHEST', description: 'Chesterfield' },
      ],
      query: 'FiElD',
      matchingIndexes: [0, 2],
    },
    {
      method: 'searchCounty' as const,
      serviceMethod: 'getCountySuggestions' as const,
      suggestions: [
        { code: 'SY', description: 'South Yorkshire' },
        { code: 'DERB', description: 'Derbyshire' },
        { code: 'WY', description: 'West Yorkshire' },
      ],
      query: 'YoRk',
      matchingIndexes: [0, 2],
    },
  ])('$method', ({ method, serviceMethod, suggestions, query, matchingIndexes }) => {
    beforeEach(() => {
      prisonRegisterService[serviceMethod].mockResolvedValue(suggestions)
      req.query.searchString = query
    })

    it('will get suggestions using the username', async () => {
      await controller[method](req, res)

      expect(prisonRegisterService[serviceMethod]).toHaveBeenCalledWith({ username: 'tom' })
    })

    it('will return case-insensitive substring matches with status 200', async () => {
      await controller[method](req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith(matchingIndexes.map(index => suggestions[index]))
    })

    it('will return an empty array when there are no matches', async () => {
      req.query.searchString = 'no matching description'

      await controller[method](req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith([])
    })

    it('will return all suggestions for an empty search string', async () => {
      req.query.searchString = ''

      await controller[method](req, res)

      expect(res.send).toHaveBeenCalledWith(suggestions)
    })

    it('will return an empty array when the service has no suggestions', async () => {
      prisonRegisterService[serviceMethod].mockResolvedValue([])

      await controller[method](req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith([])
    })

    it('will reuse cached suggestions and filter them for each search', async () => {
      await controller[method](req, res)
      req.query.searchString = suggestions[1].description

      await controller[method](req, res)

      expect(prisonRegisterService[serviceMethod]).toHaveBeenCalledTimes(1)
      expect(res.send).toHaveBeenLastCalledWith([suggestions[1]])
    })

    it('will propagate service errors without sending a successful response', async () => {
      prisonRegisterService[serviceMethod].mockRejectedValue(new Error('Server error'))

      await expect(controller[method](req, res)).rejects.toThrow('Server error')

      expect(res.status).not.toHaveBeenCalled()
      expect(res.send).not.toHaveBeenCalled()
    })
  })

  describe('searchArea', () => {
    const areas = [{ code: 'YH', description: 'Yorkshire and the Humber' }]

    it.each([undefined, ['Yorkshire'], { text: 'Yorkshire' }])(
      'will return all areas when the search string is missing or not a string: %j',
      async searchString => {
        req.query.searchString = searchString
        prisonRegisterService.getAreas.mockResolvedValue(areas)

        await controller.searchArea(req, res)

        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.send).toHaveBeenCalledWith(areas)
      },
    )

    it('will match descriptions rather than area codes', async () => {
      prisonRegisterService.getAreas.mockResolvedValue(areas)
      req.query.searchString = 'YH'

      await controller.searchArea(req, res)

      expect(res.send).toHaveBeenCalledWith([])
    })

    it('will fetch again after an empty response and cache the first nonempty list', async () => {
      prisonRegisterService.getAreas.mockResolvedValueOnce([]).mockResolvedValue(areas)

      await controller.searchArea(req, res)
      expect(res.send).toHaveBeenLastCalledWith([])
      await controller.searchArea(req, res)
      await controller.searchArea(req, res)

      expect(prisonRegisterService.getAreas).toHaveBeenCalledTimes(2)
      expect(res.send).toHaveBeenLastCalledWith(areas)
    })

    it('will retry loading areas after a service error', async () => {
      prisonRegisterService.getAreas.mockRejectedValueOnce(new Error('Unavailable')).mockResolvedValue(areas)

      await expect(controller.searchArea(req, res)).rejects.toThrow('Unavailable')
      await controller.searchArea(req, res)

      expect(prisonRegisterService.getAreas).toHaveBeenCalledTimes(2)
      expect(res.send).toHaveBeenCalledWith(areas)
    })
  })

  describe('searchRegion', () => {
    const regions = [{ code: 'YH', description: 'Yorkshire and the Humber' }]

    it.each([undefined, ['Yorkshire'], { text: 'Yorkshire' }])(
      'will return all regions when the search string is missing or not a string: %j',
      async searchString => {
        req.query.searchString = searchString
        prisonRegisterService.getRegions.mockResolvedValue(regions)

        await controller.searchRegion(req, res)

        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.send).toHaveBeenCalledWith(regions)
      },
    )

    it('will fetch again after an empty response and cache the first nonempty list', async () => {
      prisonRegisterService.getRegions.mockResolvedValueOnce([]).mockResolvedValue(regions)

      await controller.searchRegion(req, res)
      await controller.searchRegion(req, res)
      await controller.searchRegion(req, res)

      expect(prisonRegisterService.getRegions).toHaveBeenCalledTimes(2)
      expect(res.send).toHaveBeenLastCalledWith(regions)
    })
  })

  it('will cache area, region, town and county suggestions independently', async () => {
    const areas: CodeDescription[] = [{ code: 'YH', description: 'Yorkshire and the Humber' }]
    const regions: CodeDescription[] = [{ code: 'NE', description: 'North East' }]
    const towns: CodeDescription[] = [{ code: 'SHEF', description: 'Sheffield' }]
    const counties: CodeDescription[] = [{ code: 'SY', description: 'South Yorkshire' }]
    prisonRegisterService.getTownSuggestions.mockResolvedValue(towns)
    prisonRegisterService.getCountySuggestions.mockResolvedValue(counties)
    prisonRegisterService.getAreas.mockResolvedValue(areas)
    prisonRegisterService.getRegions.mockResolvedValue(regions)
    req.query.searchString = 's'

    await controller.searchTown(req, res)
    expect(res.send).toHaveBeenLastCalledWith(towns)
    await controller.searchCounty(req, res)
    expect(res.send).toHaveBeenLastCalledWith(counties)
    await controller.searchArea(req, res)
    expect(res.send).toHaveBeenLastCalledWith(areas)
    await controller.searchRegion(req, res)
    expect(res.send).toHaveBeenLastCalledWith(regions)
    await controller.searchTown(req, res)
    expect(res.send).toHaveBeenLastCalledWith(towns)
    await controller.searchCounty(req, res)
    expect(res.send).toHaveBeenLastCalledWith(counties)
    await controller.searchArea(req, res)
    expect(res.send).toHaveBeenLastCalledWith(areas)
    await controller.searchRegion(req, res)
    expect(res.send).toHaveBeenLastCalledWith(regions)

    expect(prisonRegisterService.getAreas).toHaveBeenCalledTimes(1)
    expect(prisonRegisterService.getRegions).toHaveBeenCalledTimes(1)
    expect(prisonRegisterService.getTownSuggestions).toHaveBeenCalledTimes(1)
    expect(prisonRegisterService.getCountySuggestions).toHaveBeenCalledTimes(1)
  })
})
