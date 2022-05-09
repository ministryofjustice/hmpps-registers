import type { AmendPrisonDetailsForm } from 'prisonForms'
import AmendPrisonDetailsView from './amendPrisonDetailsView'

describe('AmendPrisonDetailsView', () => {
  const form: AmendPrisonDetailsForm = {
    id: 'MDI',
    name: 'Moorland Prison',
    gender: ['female'],
    prisonTypes: ['HMP', 'YOI'],
    contracted: 'yes',
  }
  it('will pass through the form', () => {
    const view = new AmendPrisonDetailsView(form, [])
    expect(view.renderArgs.form).toEqual({
      id: 'MDI',
      name: 'Moorland Prison',
      contracted: 'yes',
      gender: ['female'],
      prisonTypes: ['HMP', 'YOI'],
    })
  })
  it('will pass through the gender value items', () => {
    const view = new AmendPrisonDetailsView(form, [])
    expect(view.renderArgs.genderValues).toEqual([
      { text: 'Male', value: 'male' },
      { text: 'Female', value: 'female' },
    ])
  })
  it('will pass through the prison type value items', () => {
    const view = new AmendPrisonDetailsView(form, [])
    expect(view.renderArgs.prisonTypesValues).toEqual([
      { text: "Her Majesty's Prison", value: 'HMP' },
      { text: "Her Majesty's Youth Offender Institution", value: 'YOI' },
      { text: 'Secure Training Centre', value: 'STC' },
      { text: 'Immigration Removal Centre', value: 'IRC' },
    ])
  })
})
