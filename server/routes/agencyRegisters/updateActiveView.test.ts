import type { UpdateActiveForm } from 'agencyForms'
import UpdateAgencyActiveView from './updateActiveView'

describe('UpdateAgencyActiveView', () => {
  const navigation = { cancelButton: '/court-register/details?id=SHFCC' }

  beforeEach(() => {
    jest.useFakeTimers({ now: new Date(2026, 0, 2, 23, 30), doNotFake: ['nextTick', 'setImmediate', 'queueMicrotask'] })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders the name, navigation, default errors and prefills the current status with today when no date exists', () => {
    expect(new UpdateAgencyActiveView('Sheffield Crown Court', navigation, true).renderArgs).toEqual({
      name: 'Sheffield Crown Court',
      navigation,
      errors: [],
      form: { active: 'true', inactiveDay: '2', inactiveMonth: '1', inactiveYear: '2026' },
    })
  })

  it.each([null, undefined, ''])('defaults the date to today when the existing date is %j', inactiveDate => {
    expect(
      new UpdateAgencyActiveView('Sheffield Crown Court', navigation, false, inactiveDate).renderArgs.form,
    ).toEqual({ active: 'false', inactiveDay: '2', inactiveMonth: '1', inactiveYear: '2026' })
  })

  it.each([
    [true, '2025-03-09', { active: 'true', inactiveDay: '9', inactiveMonth: '3', inactiveYear: '2025' }],
    [false, '2024-12-31', { active: 'false', inactiveDay: '31', inactiveMonth: '12', inactiveYear: '2024' }],
    [false, '2024-02-29', { active: 'false', inactiveDay: '29', inactiveMonth: '2', inactiveYear: '2024' }],
  ])('prefills status %j and the existing ISO date %s', (active, inactiveDate, form) => {
    expect(
      new UpdateAgencyActiveView('Sheffield Crown Court', navigation, active, inactiveDate).renderArgs.form,
    ).toEqual(form)
  })

  it.each<UpdateActiveForm>([
    { active: 'false', inactiveDay: '31', inactiveMonth: '2', inactiveYear: '2026' },
    { active: 'false', inactiveDay: '', inactiveMonth: '', inactiveYear: '' },
    {},
  ])('uses the retained form instead of the defaults, even when empty: %j', form => {
    const errors = [{ href: '#inactiveDate', text: 'Date deactivated must be a real date' }]

    expect(
      new UpdateAgencyActiveView('Sheffield Crown Court', navigation, true, '2025-03-09', errors, form).renderArgs,
    ).toEqual({
      name: 'Sheffield Crown Court',
      navigation,
      errors,
      form,
    })
  })

  it('uses a stable clock for the default date', () => {
    jest.setSystemTime(new Date(2028, 1, 29, 0, 0))

    expect(new UpdateAgencyActiveView('Sheffield Crown Court', navigation, true).renderArgs.form).toEqual({
      active: 'true',
      inactiveDay: '29',
      inactiveMonth: '2',
      inactiveYear: '2028',
    })
  })
})
