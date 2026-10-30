import data from '../testutils/mockHospitalData'
import HospitalDetailsView from './hospitalDetailsView'

describe('HospitalDetailsView', () => {
  it('will pass the hospital to the page', () => {
    const hospital = data.hospital({ hospitalId: 'SHEFH' })
    const view = new HospitalDetailsView(hospital)

    expect(view.renderArgs).toEqual({ hospital, action: 'NONE', agencyRegistersDeleteEnabled: expect.any(Boolean) })
  })

  it('will pass the action to the page', () => {
    const hospital = data.hospital({ hospitalId: 'SHEFH' })

    expect(new HospitalDetailsView(hospital, 'UPDATED').renderArgs.action).toEqual('UPDATED')
  })
})
