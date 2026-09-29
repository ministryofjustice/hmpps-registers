import data from '../testutils/mockHospitalData'
import HospitalDetailsView from './hospitalDetailsView'

describe('HospitalDetailsView', () => {
  it('will pass the hospital to the page', () => {
    const hospital = data.hospital({ hospitalId: 'SHEFH' })
    const view = new HospitalDetailsView(hospital)

    expect(view.renderArgs).toEqual({ hospital })
  })
})
