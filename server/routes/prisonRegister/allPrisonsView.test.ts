import AllPrisonsView from './allPrisonsView'
import data from '../testutils/mockData'

describe('AllPrisonsView', () => {
  let view: AllPrisonsView

  describe('with no prisons', () => {
    beforeEach(() => {
      view = new AllPrisonsView([], {})
    })

    it('can handle when there are no prisons', () => {
      expect(view.prisonPageView.prisons).toHaveLength(0)
    })
  })

  describe('with many prisons', () => {
    beforeEach(() => {
      view = new AllPrisonsView([data.prison({}), data.prison({})], {})
    })

    it('will map each prison', () => {
      expect(view.prisonPageView.prisons).toHaveLength(2)
    })
  })
})
