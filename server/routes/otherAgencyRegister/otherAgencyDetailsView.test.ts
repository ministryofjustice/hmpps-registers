import data from '../testutils/mockOtherAgencyData'
import OtherAgencyDetailsView from './otherAgencyDetailsView'

describe('OtherAgencyDetailsView', () => {
  it('will pass the other agency to the page', () => {
    const otherAgency = data.otherAgency({ agencyId: 'SHFPECS' })
    const view = new OtherAgencyDetailsView(otherAgency)

    expect(view.renderArgs).toEqual({ otherAgency })
  })
})
