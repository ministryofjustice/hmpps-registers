import data from '../testutils/mockPoliceCustodySuiteData'
import AllPoliceCustodySuitesView from './allPoliceCustodySuitesView'

describe('AllPoliceCustodySuitesView', () => {
  let view: AllPoliceCustodySuitesView

  describe('with no police custody suites', () => {
    beforeEach(() => {
      view = new AllPoliceCustodySuitesView([], {})
    })

    it('can handle when there are no police custody suites', () => {
      expect(view.policeCustodySuitePageView.policeCustodySuites).toHaveLength(0)
    })
  })

  describe('with many police custody suites', () => {
    beforeEach(() => {
      view = new AllPoliceCustodySuitesView([data.policeCustodySuite({}), data.policeCustodySuite({})], {})
    })

    it('will map each police custody suite', () => {
      expect(view.policeCustodySuitePageView.policeCustodySuites).toHaveLength(2)
    })
  })

  describe('render args', () => {
    beforeEach(() => {
      view = new AllPoliceCustodySuitesView([data.policeCustodySuite({ policeCustodySuiteId: 'SHFPCS' })], {
        active: true,
      })
    })

    it('will pass the police custody suites and filter to the page', () => {
      expect(view.renderArgs).toEqual({
        policeCustodySuites: [expect.objectContaining({ id: 'SHFPCS' })],
        filter: { active: true },
      })
    })
  })
})
