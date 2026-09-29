import data from '../testutils/mockApprovedPremisesData'
import AllApprovedPremisesView from './allApprovedPremisesView'

describe('AllApprovedPremisesView', () => {
  let view: AllApprovedPremisesView

  describe('with no approved premises', () => {
    beforeEach(() => {
      view = new AllApprovedPremisesView([], {})
    })

    it('can handle when there are no approved premises', () => {
      expect(view.approvedPremisesPageView.approvedPremisesList).toHaveLength(0)
    })
  })

  describe('with many approved premises', () => {
    beforeEach(() => {
      view = new AllApprovedPremisesView([data.approvedPremises({}), data.approvedPremises({})], {})
    })

    it('will map each approved premises', () => {
      expect(view.approvedPremisesPageView.approvedPremisesList).toHaveLength(2)
    })
  })

  describe('render args', () => {
    beforeEach(() => {
      view = new AllApprovedPremisesView([data.approvedPremises({ approvedPremisesId: 'SHFAP' })], {
        active: true,
      })
    })

    it('will pass the approved premises and filter to the page', () => {
      expect(view.renderArgs).toEqual({
        approvedPremisesList: [expect.objectContaining({ id: 'SHFAP' })],
        filter: { active: true },
      })
    })
  })
})
