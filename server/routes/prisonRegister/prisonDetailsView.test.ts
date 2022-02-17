import PrisonDetailsView from './prisonDetailsView'
import data from '../testutils/mockData'

describe('PrisonDetailsView', () => {
  it('will map prison to details', () => {
    const view = new PrisonDetailsView(data.prison({}))
    expect(view.renderArgs.prisonDetails.id).toEqual('ALI')
    expect(view.renderArgs.prisonDetails.name).toEqual('Albany (HMP)')
    expect(view.renderArgs.prisonDetails.active).toEqual(true)
  })
})
