import AddNewCourtSummaryView from './addNewCourtSummaryView'

describe('AddNewCourtSummaryView', () => {
  it('will set court type description', () => {
    const view = new AddNewCourtSummaryView({ type: 'COU' }, [
      {
        courtType: 'YOU',
        courtName: 'Youth Court',
      },
      {
        courtType: 'COU',
        courtName: 'County Court/County Divorce Ct',
      },
    ])
    expect(view.renderArgs.typeDescription).toEqual('County Court/County Divorce Ct')
  })

  it('will pass through the current form', () => {
    const view = new AddNewCourtSummaryView({ type: 'COU', name: 'Sheffield County Court' }, [])
    expect(view.renderArgs.form).toEqual({ type: 'COU', name: 'Sheffield County Court' })
  })
})
