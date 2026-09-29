import data from '../testutils/mockProbationOfficeData'
import AllProbationOfficesView from './allProbationOfficesView'

describe('AllProbationOfficesView', () => {
  let view: AllProbationOfficesView

  describe('with no probation offices', () => {
    beforeEach(() => {
      view = new AllProbationOfficesView([], {})
    })

    it('can handle when there are no probation offices', () => {
      expect(view.probationOfficePageView.probationOffices).toHaveLength(0)
    })
  })

  describe('with many probation offices', () => {
    beforeEach(() => {
      view = new AllProbationOfficesView([data.probationOffice({}), data.probationOffice({})], {})
    })

    it('will map each probation office', () => {
      expect(view.probationOfficePageView.probationOffices).toHaveLength(2)
    })
  })

  describe('render args', () => {
    beforeEach(() => {
      view = new AllProbationOfficesView([data.probationOffice({ probationOfficeId: 'SHFPO' })], {
        active: true,
      })
    })

    it('will pass the probation offices and filter to the page', () => {
      expect(view.renderArgs).toEqual({
        probationOffices: [expect.objectContaining({ id: 'SHFPO' })],
        filter: { active: true },
      })
    })
  })
})
