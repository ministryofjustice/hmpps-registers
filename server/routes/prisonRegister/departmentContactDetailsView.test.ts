import DepartmentContactDetailsView from './departmentContactDetailsView'

describe('DepartmentContactDetailsView', () => {
  it('builds radio items for available types, checking the selected one', () => {
    const view = new DepartmentContactDetailsView(
      'create',
      'HMP Moorland',
      { cancelButton: '/x' },
      { departmentType: 'PRISON' },
      undefined,
      ['PRISON', 'OFFICIAL_VISIT'],
    )
    expect(view.renderArgs.errors).toEqual([])
    expect(view.renderArgs.departmentTypeItems).toEqual([
      { value: 'PRISON', text: 'Prison', checked: true },
      { value: 'OFFICIAL_VISIT', text: 'Official visits', checked: false },
    ])
  })

  it('exposes a readable department name', () => {
    const view = new DepartmentContactDetailsView(
      'update',
      'HMP Moorland',
      { cancelButton: '/x' },
      {
        departmentType: 'SOCIAL_VISIT',
      },
    )
    expect(view.renderArgs.departmentName).toEqual('Social visits')
    expect(view.renderArgs.name).toEqual('HMP Moorland')
  })
})
