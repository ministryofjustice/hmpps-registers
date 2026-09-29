import data from '../testutils/mockProbationOfficeData'
import ProbationOfficeDetailsView from './probationOfficeDetailsView'

describe('ProbationOfficeDetailsView', () => {
  it('will pass the probation office to the page', () => {
    const probationOffice = data.probationOffice({ probationOfficeId: 'SHFPO' })
    const view = new ProbationOfficeDetailsView(probationOffice)

    expect(view.renderArgs).toEqual({ probationOffice })
  })
})
