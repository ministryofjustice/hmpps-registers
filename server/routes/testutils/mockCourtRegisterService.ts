import CourtRegisterService from '../../services/courtRegisterService'
import data from './mockData'
import HmppsAuthClient from '../../data/hmppsAuthClient'

jest.mock('../../services/courtRegisterService')

const courtRegisterService = new CourtRegisterService({} as HmppsAuthClient) as jest.Mocked<CourtRegisterService>
courtRegisterService.getPageOfCourts.mockResolvedValue({
  content: [
    data.court({
      courtId: 'SHFCC',
      courtName: 'Sheffield Crown Court',
      courtDescription: 'Sheffield Crown Court - Yorkshire',
      type: { courtType: 'CROWN', courtName: 'Crown' },
      active: true,
    }),
  ],
  first: true,
  last: true,
  empty: false,
  totalPages: 1,
  totalElements: 1,
  number: 0,
  size: 20,
  numberOfElements: 1,
})
courtRegisterService.getCourtTypes.mockResolvedValue([
  { courtType: 'COU', courtName: 'County' },
  { courtType: 'CRN', courtName: 'Crown' },
])

export default courtRegisterService
