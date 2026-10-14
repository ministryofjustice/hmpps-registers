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

  it('will cache town and county suggestions independently', async () => {
    const towns: CodeDescription[] = [{ code: 'SHEF', description: 'Sheffield' }]
    const counties: CodeDescription[] = [{ code: 'SY', description: 'South Yorkshire' }]
    prisonRegisterService.getTownSuggestions.mockResolvedValue(towns)
    prisonRegisterService.getCountySuggestions.mockResolvedValue(counties)
    req.query.searchString = 's'

    await controller.searchTown(req, res)
    expect(res.send).toHaveBeenLastCalledWith(towns)
    await controller.searchCounty(req, res)
    expect(res.send).toHaveBeenLastCalledWith(counties)
    await controller.searchTown(req, res)
    expect(res.send).toHaveBeenLastCalledWith(towns)
    await controller.searchCounty(req, res)
    expect(res.send).toHaveBeenLastCalledWith(counties)

    expect(prisonRegisterService.getTownSuggestions).toHaveBeenCalledTimes(1)
    expect(prisonRegisterService.getCountySuggestions).toHaveBeenCalledTimes(1)
  })
})
