import HmppsAuthClient from '../../data/hmppsAuthClient'
import PrisonRegisterService from '../../services/prisonRegisterService'

jest.mock('../../services/prisonRegisterService')

const prisonRegisterService = new PrisonRegisterService({} as HmppsAuthClient) as jest.Mocked<PrisonRegisterService>
prisonRegisterService.getPrisonsWithFilter.mockResolvedValue([
  {
    prisonId: 'ALI',
    prisonName: 'Albany (HMP)',
    active: true,
    male: true,
    female: true,
    addresses: [],
    types: [{ code: 'HMP', description: 'Her Majesty’s Prison' }],
  },
])
prisonRegisterService.getPrison.mockResolvedValue({
  prisonId: 'ALI',
  prisonName: 'Albany (HMP)',
  active: true,
  male: true,
  female: true,
  addresses: [
    {
      id: 22,
      addressLine1: 'Bawtry Road',
      addressLine2: 'Hatfield Woodhouse',
      town: 'Doncaster',
      county: 'South Yorkshire',
      postcode: 'DN7 6BW',
      country: 'England',
    },
  ],
  types: [{ code: 'HMP', description: 'Her Majesty’s Prison' }],
})
export default prisonRegisterService
