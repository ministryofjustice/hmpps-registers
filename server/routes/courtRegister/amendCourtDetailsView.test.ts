import AmendCourtDetailsView from './amendCourtDetailsView'
import data from '../testutils/mockData'

describe('AmendCourtDetailsView', () => {
  it('will map court types  alphabetically', () => {
    const view = new AmendCourtDetailsView(data.court({}), [
      {
        courtType: 'YOU',
        courtName: 'Youth Court',
      },
      {
        courtType: 'COU',
        courtName: 'County Court/County Divorce Ct',
      },
    ])
    expect(view.renderArgs.courtTypes).toEqual([
      {
        value: 'COU',
        text: 'County Court/County Divorce Ct',
        selected: false,
      },
      {
        value: 'YOU',
        text: 'Youth Court',
        selected: false,
      },
    ])
  })
  it('will select current court type and not bother having blank item', () => {
    const view = new AmendCourtDetailsView(data.court({ type: { courtType: 'CRN', courtName: 'Crown Court' } }), [
      {
        courtType: 'CRN',
        courtName: 'Crown Court',
      },
      {
        courtType: 'YOU',
        courtName: 'Youth Court',
      },
    ])
    expect(view.renderArgs.courtTypes).toEqual([
      {
        value: 'CRN',
        text: 'Crown Court',
        selected: true,
      },
      {
        value: 'YOU',
        text: 'Youth Court',
        selected: false,
      },
    ])
  })
  it('will create current form from court', () => {
    const view = new AmendCourtDetailsView(
      data.court({
        courtId: 'SHFCC',
        type: { courtType: 'CRN', courtName: 'Crown Court' },
        courtDescription: 'Main Sheffield Court',
      }),
      []
    )
    expect(view.renderArgs.form).toEqual({
      id: 'SHFCC',
      name: 'Sheffield Crown Court',
      type: 'CRN',
      description: 'Main Sheffield Court',
    })
  })
})
