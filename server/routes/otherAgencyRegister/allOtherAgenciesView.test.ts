import data from '../testutils/mockOtherAgencyData'
import AllOtherAgenciesView from './allOtherAgenciesView'

describe('AllOtherAgenciesView', () => {
  let view: AllOtherAgenciesView

  describe('with no other agencies', () => {
    beforeEach(() => {
      view = new AllOtherAgenciesView([], {})
    })

    it('can handle when there are no other agencies', () => {
      expect(view.otherAgencyPageView.otherAgencies).toHaveLength(0)
    })
  })

  describe('with many other agencies', () => {
    beforeEach(() => {
      view = new AllOtherAgenciesView([data.otherAgency({}), data.otherAgency({})], {})
    })

    it('will map each other agency', () => {
      expect(view.otherAgencyPageView.otherAgencies).toHaveLength(2)
    })
  })

  describe('render args', () => {
    beforeEach(() => {
      view = new AllOtherAgenciesView([data.otherAgency({ agencyId: 'SHFPECS' })], { active: true })
    })

    it('will pass the agencies and filter to the page', () => {
      expect(view.renderArgs).toEqual({
        otherAgencies: [expect.objectContaining({ id: 'SHFPECS' })],
        filter: { active: true },
      })
    })
  })
})
