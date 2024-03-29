import PrisonDetailsView from './prisonDetailsView'
import data from '../testutils/mockPrisonData'

describe('PrisonDetailsView', () => {
  it('will map prison to details', () => {
    const view = new PrisonDetailsView(data.prison({ addresses: [data.prisonAddress({})] }), 'NONE')

    expect(view.renderArgs.prisonDetails.id).toEqual('ALI')
    expect(view.renderArgs.prisonDetails.name).toEqual('Albany (HMP)')
    expect(view.renderArgs.prisonDetails.active).toEqual(true)
    expect(view.renderArgs.prisonDetails.male).toEqual(true)
    expect(view.renderArgs.prisonDetails.female).toEqual(true)
    expect(view.renderArgs.prisonDetails.addresses[0].line1).toEqual('Bawtry Road')
  })

  it('will map prison with multiple addresses to details', () => {
    const view = new PrisonDetailsView(
      data.prison({
        addresses: [
          {
            id: 22,
            addressLine1: 'Alternative Address',
            addressLine2: 'Hatfield Woodhouse',
            town: 'Doncaster',
            postcode: 'DN7 6BX',
            county: 'South Yorkshire',
            country: 'England',
          },
          data.prisonAddress({}),
        ],
      }),
      'NONE',
    )

    expect(view.renderArgs.prisonDetails.id).toEqual('ALI')
    expect(view.renderArgs.prisonDetails.name).toEqual('Albany (HMP)')
    expect(view.renderArgs.prisonDetails.active).toEqual(true)
    expect(view.renderArgs.prisonDetails.male).toEqual(true)
    expect(view.renderArgs.prisonDetails.female).toEqual(true)
    expect(view.renderArgs.prisonDetails.addresses[0].line1).toEqual('Alternative Address')
    expect(view.renderArgs.prisonDetails.addresses[1].line1).toEqual('Bawtry Road')
  })
  it('will pass through action', () => {
    const view = new PrisonDetailsView(data.prison({}), 'ACTIVATE-PRISON')
    expect(view.renderArgs.action).toEqual('ACTIVATE-PRISON')
  })
})
