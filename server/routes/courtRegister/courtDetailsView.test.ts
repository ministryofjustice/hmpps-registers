import CourtDetailsView from './courtDetailsView'
import data from '../testutils/mockData'

describe('CourtDetailsView', () => {
  it('will map court to details', () => {
    const view = new CourtDetailsView(
      data.court({
        courtId: 'SHFCC',
        courtName: 'Sheffield Crown Court',
        courtDescription: 'Sheffield Crown Court - Yorkshire',
        type: { courtType: 'CROWN', courtName: 'Crown' },
        active: true,
      }),
      'NONE',
      ''
    )
    expect(view.renderArgs.courtDetails.id).toEqual('SHFCC')
    expect(view.renderArgs.courtDetails.type).toEqual('Crown')
  })
  it('will pass through action', () => {
    const view = new CourtDetailsView(data.court({}), 'ACTIVATE', '')
    expect(view.renderArgs.action).toEqual('ACTIVATE')
  })
  it('will pass through back link', () => {
    const view = new CourtDetailsView(data.court({}), 'ACTIVATE', 'http://get-back')
    expect(view.renderArgs.backLink).toEqual('http://get-back')
  })
})
