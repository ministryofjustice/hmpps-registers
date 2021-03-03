import CourtDetailsView from './courtDetailsView'
import data from '../testutils/mockData'

describe('CourtDetailsView', () => {
  it('will map court to details', () => {
    const view = new CourtDetailsView(
      data.court({
        courtId: 'SHFCC',
        courtName: 'Sheffield Crown Court',
        courtDescription: 'Sheffield Crown Court - Yorkshire',
        courtType: 'CROWN',
        active: true,
      }),
      'NONE'
    )
    expect(view.renderArgs.courtDetails.id).toEqual('SHFCC')
    expect(view.renderArgs.courtDetails.type).toEqual('Crown')
  })
  it('will pass through action', () => {
    const view = new CourtDetailsView(data.court({}), 'ACTIVATE')
    expect(view.renderArgs.action).toEqual('ACTIVATE')
  })
})
