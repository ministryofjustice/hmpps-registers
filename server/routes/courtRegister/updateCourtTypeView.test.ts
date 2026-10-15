import UpdateCourtTypeView from './updateCourtTypeView'
import { allCourtTypes } from './courtData'

describe('UpdateCourtTypeView', () => {
  const navigation = { cancelButton: '/court-register/details?id=SHFCC' }

  it('will list every court type as a radio item with the description as its label', () => {
    const { courtTypes } = new UpdateCourtTypeView('Sheffield Crown Court', navigation, allCourtTypes).renderArgs

    expect(courtTypes).toEqual([
      { value: 'CACD', text: 'Court of Appeal - Criminal Division', checked: false },
      { value: 'CB', text: 'Combined Court', checked: false },
      { value: 'CC', text: 'Crown Court', checked: false },
      { value: 'CO', text: 'County Court', checked: false },
      { value: 'DCM', text: 'District Court Marshal', checked: false },
      { value: 'GCM', text: 'General Court Marshal', checked: false },
      { value: 'IMM', text: 'Immigration Court', checked: false },
      { value: 'MC', text: 'Magistrates Court', checked: false },
      { value: 'OTHER', text: 'Courts Outside England and Wales', checked: false },
      { value: 'YC', text: 'Youth Court', checked: false },
      { value: 'UNK', text: 'Unknown', checked: false },
    ])
  })

  it('will check only the selected court type', () => {
    const { courtTypes } = new UpdateCourtTypeView('Sheffield Crown Court', navigation, allCourtTypes, [], 'MC')
      .renderArgs

    expect(courtTypes.filter(type => type.checked).map(type => type.value)).toEqual(['MC'])
  })

  it('will render name, navigation and default errors', () => {
    const view = new UpdateCourtTypeView('Sheffield Crown Court', navigation, allCourtTypes)

    expect(view.renderArgs).toEqual(expect.objectContaining({ name: 'Sheffield Crown Court', navigation, errors: [] }))
  })
})
