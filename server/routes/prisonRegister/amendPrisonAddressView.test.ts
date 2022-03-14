import type { AmendPrisonAddressForm } from 'prisonForms'
import AmendPrisonAddressView from './amendPrisonAddressView'

describe('AmendPrisonAddressView', () => {
  const form: AmendPrisonAddressForm = {
    id: '21',
    prisonId: 'MDI',
    addressline1: 'Bawtry Road',
    addressline2: 'Hatfield Woodhouse',
    addresstown: 'Doncaster',
    addresscounty: 'South Yorkshire',
    addresspostcode: 'DN7 6BW',
    addresscountry: 'England',
  }

  it('will pass through the form', () => {
    const view = new AmendPrisonAddressView(form, [])
    expect(view.renderArgs.form).toEqual({
      id: '21',
      prisonId: 'MDI',
      addressline1: 'Bawtry Road',
      addressline2: 'Hatfield Woodhouse',
      addresstown: 'Doncaster',
      addresscounty: 'South Yorkshire',
      addresspostcode: 'DN7 6BW',
      addresscountry: 'England',
    })
  })
})
