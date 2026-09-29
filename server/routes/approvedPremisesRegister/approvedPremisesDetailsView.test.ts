import data from '../testutils/mockApprovedPremisesData'
import ApprovedPremisesDetailsView from './approvedPremisesDetailsView'

describe('ApprovedPremisesDetailsView', () => {
  it('will pass the approved premises to the page', () => {
    const approvedPremises = data.approvedPremises({ approvedPremisesId: 'SHFAP' })
    const view = new ApprovedPremisesDetailsView(approvedPremises)

    expect(view.renderArgs).toEqual({ approvedPremises })
  })
})
