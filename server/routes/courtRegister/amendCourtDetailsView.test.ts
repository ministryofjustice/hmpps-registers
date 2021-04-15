import { AmendCourtDetailsForm } from 'forms'
import AmendCourtDetailsView from './amendCourtDetailsView'

describe('AmendCourtDetailsView', () => {
  const form: AmendCourtDetailsForm = {
    id: 'SHFCC',
    name: 'Sheffield Crown Court',
    type: 'CRN',
    description: 'Main Sheffield Court',
  }
  it('will map court types alphabetically', () => {
    const view = new AmendCourtDetailsView(form, [
      {
        courtType: 'YOU',
        courtName: 'Youth Court',
      },
      {
        courtType: 'COU',
        courtName: 'County Court/County Divorce Ct',
      },
    ])
    expect(view.renderArgs.courtTypes).toEqual([
      {
        value: 'COU',
        text: 'County Court/County Divorce Ct',
        selected: false,
      },
      {
        value: 'YOU',
        text: 'Youth Court',
        selected: false,
      },
    ])
  })
  it('will select current court type and not bother having blank item', () => {
    const view = new AmendCourtDetailsView(form, [
      {
        courtType: 'CRN',
        courtName: 'Crown Court',
      },
      {
        courtType: 'YOU',
        courtName: 'Youth Court',
      },
    ])
    expect(view.renderArgs.courtTypes).toEqual([
      {
        value: 'CRN',
        text: 'Crown Court',
        selected: true,
      },
      {
        value: 'YOU',
        text: 'Youth Court',
        selected: false,
      },
    ])
  })
  it('will pass through the form', () => {
    const view = new AmendCourtDetailsView(
      {
        id: 'SHFCC',
        name: 'Sheffield Crown Court',
        type: 'CRN',
        description: 'Main Sheffield Court',
      },
      []
    )
    expect(view.renderArgs.form).toEqual({
      id: 'SHFCC',
      name: 'Sheffield Crown Court',
      type: 'CRN',
      description: 'Main Sheffield Court',
    })
  })
})
