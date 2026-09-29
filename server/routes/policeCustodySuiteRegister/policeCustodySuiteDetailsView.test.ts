import data from '../testutils/mockPoliceCustodySuiteData'
import PoliceCustodySuiteDetailsView from './policeCustodySuiteDetailsView'

describe('PoliceCustodySuiteDetailsView', () => {
  it('will pass the police custody suite to the page', () => {
    const policeCustodySuite = data.policeCustodySuite({ policeCustodySuiteId: 'SHFPCS' })
    const view = new PoliceCustodySuiteDetailsView(policeCustodySuite)

    expect(view.renderArgs).toEqual({ policeCustodySuite })
  })
})
