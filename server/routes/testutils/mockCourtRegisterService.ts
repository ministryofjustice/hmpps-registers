import CourtRegisterService from '../../services/courtRegisterService'
import data from './mockData'

jest.mock('../../services/courtRegisterService')

const courtRegisterService = new CourtRegisterService(null) as jest.Mocked<CourtRegisterService>
courtRegisterService.getAllCourts.mockResolvedValue({
  courts: [data.court({})],
})

export default courtRegisterService
