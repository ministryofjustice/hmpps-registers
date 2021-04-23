import AddNewCourtDetailsView from './addNewCourtDetailsView'

describe('AddNewCourtDetailsView', () => {
  it('will map court types with blank item alphabetically', () => {
    const view = new AddNewCourtDetailsView(
      {},
      [
        {
          courtType: 'YOU',
          courtName: 'Youth Court',
        },
        {
          courtType: 'COU',
          courtName: 'County Court/County Divorce Ct',
        },
      ],
      ''
    )
    expect(view.renderArgs.courtTypes).toEqual([
      {
        value: '',
        text: '',
        selected: true,
      },
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
    const view = new AddNewCourtDetailsView(
      { type: 'YOU' },
      [
        {
          courtType: 'COU',
          courtName: 'County Court/County Divorce Ct',
        },
        {
          courtType: 'YOU',
          courtName: 'Youth Court',
        },
      ],
      ''
    )
    expect(view.renderArgs.courtTypes).toEqual([
      {
        value: 'COU',
        text: 'County Court/County Divorce Ct',
        selected: false,
      },
      {
        value: 'YOU',
        text: 'Youth Court',
        selected: true,
      },
    ])
  })
  it('will pass through the current form', () => {
    const view = new AddNewCourtDetailsView({ id: 'SHFCC', description: 'Sheffield Crown Court' }, [], '')
    expect(view.renderArgs.form).toEqual({ id: 'SHFCC', description: 'Sheffield Crown Court' })
  })
  it('will pass through the back link', () => {
    const view = new AddNewCourtDetailsView({}, [], 'http://get-back')
    expect(view.renderArgs.backLink).toEqual('http://get-back')
  })
})
