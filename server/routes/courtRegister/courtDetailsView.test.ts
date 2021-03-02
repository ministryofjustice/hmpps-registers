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
      })
    )
    expect(view.courtDetails.id).toEqual('SHFCC')
    expect(view.courtDetails.type).toEqual('Crown')
  })
})
