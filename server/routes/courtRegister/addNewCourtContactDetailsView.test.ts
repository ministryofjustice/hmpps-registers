import AddNewCourtContactDetailsView from './addNewCourtContactDetailsView'

describe('AddNewCourtContactDetailsView', () => {
  it('will pass through the current form', () => {
    const view = new AddNewCourtContactDetailsView({ type: 'COU', name: 'Sheffield County Court' }, '', [])
    expect(view.renderArgs.form).toEqual({ type: 'COU', name: 'Sheffield County Court' })
  })
  it('will pass through the back link', () => {
    const view = new AddNewCourtContactDetailsView({}, 'http://get-back', [])
    expect(view.renderArgs.backLink).toEqual('http://get-back')
  })
})
