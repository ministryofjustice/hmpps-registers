import HmppsAuthClient from '../../data/hmppsAuthClient'
import PrisonRegisterService from '../../services/prisonRegisterService'

jest.mock('../../services/prisonRegisterService')

const prisonRegisterService = new PrisonRegisterService({} as HmppsAuthClient) as jest.Mocked<PrisonRegisterService>
prisonRegisterService.getPrisons.mockResolvedValue([
  {
    prisonId: 'ALI',
    prisonName: 'Albany (HMP)',
    active: true,
  },
])

export default prisonRegisterService
