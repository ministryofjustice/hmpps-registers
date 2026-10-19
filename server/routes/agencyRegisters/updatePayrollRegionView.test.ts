import UpdateAgencyPayrollRegionView from './updatePayrollRegionView'

describe('UpdateAgencyPayrollRegionView', () => {
  const navigation = { cancelButton: '/court-register/details?id=SHFCC' }
  const form = { payrollRegionCode: 'NE', payrollRegionDescription: 'North East' }

  it('renders the court name, navigation, errors and submitted form unchanged', () => {
    const errors = [{ href: '#payrollRegion', text: 'Payroll region cannot be changed' }]
    const view = new UpdateAgencyPayrollRegionView('Sheffield Crown Court', navigation, errors, form)

    expect(view.renderArgs).toEqual({ name: 'Sheffield Crown Court', navigation, errors, form })
  })

  it('defaults absent errors to an empty array', () => {
    const view = new UpdateAgencyPayrollRegionView('Sheffield Crown Court', navigation, undefined, form)

    expect(view.renderArgs).toEqual({ name: 'Sheffield Crown Court', navigation, errors: [], form })
  })
})
