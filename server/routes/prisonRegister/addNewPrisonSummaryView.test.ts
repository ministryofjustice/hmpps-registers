import AddNewPrisonSummaryView from './addNewPrisonSummaryView'

describe('AddNewPrisonSummaryView', () => {
  const view = new AddNewPrisonSummaryView(
    {
      id: 'MDI',
      name: 'Moorland Prison',
      prisonNameInWelsh: '',
      gender: ['male'],
      contracted: 'yes',
      lthse: 'no',
      prisonTypes: ['HMP', 'STC'],
      addresstown: 'Doncaster',
      addresspostcode: 'DN12 3AB',
      addresscountry: 'England',
    },
    'http://get-back',
  )

  it('will pass through the current form', () => {
    expect(view.renderArgs.form).toEqual({
      id: 'MDI',
      name: 'Moorland Prison',
      prisonNameInWelsh: '',
      gender: ['male'],
      prisonTypes: ['HMP', 'STC'],
      contracted: 'yes',
      lthse: 'no',
      addresstown: 'Doncaster',
      addresspostcode: 'DN12 3AB',
      addresscountry: 'England',
    })
  })

  it('will pass through the back link', () => {
    expect(view.renderArgs.backLink).toEqual('http://get-back')
  })
})
