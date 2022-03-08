import type { AmendPrisonDetailsForm } from 'prisonForms'
import AmendPrisonDetailsView from './amendPrisonDetailsView'

describe('AmendPrisonDetailsView', () => {
  const form: AmendPrisonDetailsForm = {
    id: 'MDI',
    name: 'Moorland Prison',
  }
  it('will pass through the form', () => {
    const view = new AmendPrisonDetailsView(form, [])
    expect(view.renderArgs.form).toEqual({
      id: 'MDI',
      name: 'Moorland Prison',
    })
  })
})
