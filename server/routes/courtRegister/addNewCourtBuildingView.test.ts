import AddNewCourtBuildingView from './addNewCourtBuildingView'

describe('AddNewCourtBuildingView', () => {
  it('will pass through the current form', () => {
    const view = new AddNewCourtBuildingView({ type: 'COU', name: 'Sheffield County Court' }, '', [])
    expect(view.renderArgs.form).toEqual({ type: 'COU', name: 'Sheffield County Court' })
  })
  it('will pass through the current form', () => {
    const view = new AddNewCourtBuildingView({}, 'http://go-back', [])
    expect(view.renderArgs.backLink).toEqual('http://go-back')
  })
})
