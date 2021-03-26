import AddNewCourtBuildingView from './addNewCourtBuildingView'

describe('AddNewCourtBuildingView', () => {
  it('will pass through the current form', () => {
    const view = new AddNewCourtBuildingView({ type: 'COU', name: 'Sheffield County Court' }, [])
    expect(view.renderArgs.form).toEqual({ type: 'COU', name: 'Sheffield County Court' })
  })
})
