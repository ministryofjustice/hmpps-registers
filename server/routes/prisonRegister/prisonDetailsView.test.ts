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

  it('will return isWelsh to be  false', () => {
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

    expect(view.renderArgs.isWelshPrison).toEqual(false)
  })

  it('Will send both English and Welsh prison addresses to view', () => {
    const view = new PrisonDetailsView(
      data.prison({
        prisonId: 'CFI',
        prisonName: 'Cardiff',
        prisonNameInWelsh: 'Carchar Caerdydd',
        addresses: [
          data.prisonAddress({
            id: 22,
            addressLine1: '2 Knox Road',
            addressLine2: undefined,
            town: 'Cardiff',
            postcode: 'CF24 0UG',
            county: 'Glamorgan',
            country: 'Wales',
            addressLine1InWelsh: 'Heol Knox',
            addressLine2InWelsh: undefined,
            townInWelsh: 'Caerdydd',
            countyInWelsh: undefined,
            countryInWelsh: 'Cymru',
          }),
        ],
      }),
      'NONE',
    )
    expect(view.renderArgs).toEqual({
      action: 'NONE',
      isWelshPrison: true,
      prisonDetails: {
        prisonNameInWelsh: 'Carchar Caerdydd',
        active: true,
        addresses: [
          {
            country: 'Wales',
            countryinwelsh: 'Cymru',
            county: 'Glamorgan',
            hasWelshAddress: true,
            id: 22,
            line1: '2 Knox Road',
            line1inwelsh: 'Heol Knox',
            line2: 'Hatfield Woodhouse',
            line2inwelsh: undefined,
            postcode: 'CF24 0UG',
            town: 'Cardiff',
            towninwelsh: 'Caerdydd',
          },
        ],
        contracted: false,
        female: true,
        id: 'CFI',
        lthse: false,
        male: true,
        name: 'Cardiff',
        operators: [
          {
            name: 'PSP',
          },
        ],
        types: [
          {
            code: 'HMP',
            description: 'His Majesty’s Prison',
          },
        ],
      },
    })
  })
})
