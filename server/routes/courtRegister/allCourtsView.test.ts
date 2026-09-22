import data from '../testutils/mockCourtData'
import AllCourtsView from './allCourtsView'

describe('AllCourtsView', () => {
  let view: AllCourtsView

  describe('with no courts', () => {
    beforeEach(() => {
      view = new AllCourtsView([])
    })

    it('can handle when there are no courts', () => {
      expect(view.courtPageView.courts).toHaveLength(0)
    })
  })

  describe('with many courts', () => {
    beforeEach(() => {
      view = new AllCourtsView([data.court({}), data.court({})])
    })

    it('will map each prison', () => {
      expect(view.courtPageView.courts).toHaveLength(2)
    })
  })
})
