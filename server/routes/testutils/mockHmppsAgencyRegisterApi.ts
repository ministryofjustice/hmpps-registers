import HmppsAuthClient from '../../data/hmppsAuthClient'
import HMPPSAgencyRegisterApi from '../../services/hmppsAgencyRegisterApi'

jest.mock('../../services/hmppsAgencyRegisterApi')

const hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(
  {} as HmppsAuthClient,
) as jest.Mocked<HMPPSAgencyRegisterApi>
hmppsAgencyRegisterApiService.getPrisonsWithFilter.mockResolvedValue([
  {
    prisonId: 'ALI',
    prisonName: 'Albany (HMP)',
    active: true,
    male: true,
    female: true,
    contracted: false,
    lthse: false,
    addresses: [],
    types: [{ code: 'HMP', description: 'His Majesty’s Prison' }],
    operators: [{ name: 'PSP' }],
    categories: [],
  },
])
hmppsAgencyRegisterApiService.getPrison.mockResolvedValue({
  prisonId: 'ALI',
  prisonName: 'Albany (HMP)',
  active: true,
  male: true,
  contracted: false,
  lthse: false,
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
  types: [{ code: 'HMP', description: 'His Majesty’s Prison' }],
  operators: [{ name: 'PSP' }],
  categories: [],
})
export default hmppsAgencyRegisterApiService
