import type { WelshPrisonAddressForm } from 'prisonForms'
import AmendWelshPrisonAddressView from './amendWelshPrisonAddressView'

describe('AmendWelshPrisonAddressView', () => {
  const form: WelshPrisonAddressForm = {
    addressId: '21',
    prisonId: 'CFI',
    addressline1inwelsh: 'First line in welsh',
    addressline2inwelsh: 'second line in welsh',
    towninwelsh: 'Town in welsh',
    countyinwelsh: 'Glamorgan',
    countryinwelsh: 'Cymru',
  }

  it('will pass through the form', () => {
    const view = new AmendWelshPrisonAddressView(form, [])
    expect(view.renderArgs.form).toEqual({
      addressId: '21',
      prisonId: 'CFI',
      addressline1inwelsh: 'First line in welsh',
      addressline2inwelsh: 'second line in welsh',
      towninwelsh: 'Town in welsh',
      countyinwelsh: 'Glamorgan',
      countryinwelsh: 'Cymru',
    })
  })
})
