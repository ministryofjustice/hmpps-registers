import type { UpdateActiveForm } from 'agencyForms'
import type { Request } from 'express'
import validate, { ActiveUpdate } from './updateActiveValidator'
import type { CourtMutationResponse } from '../../services/prisonRegisterService'

describe('updateActiveValidator', () => {
  const req = {
    query: { id: 'SHFCC' },
    flash: jest.fn(),
  } as unknown as Request
  const updateActive = jest.fn<Promise<CourtMutationResponse>, [ActiveUpdate]>()
  const formUrl = '/court-register/active/update?id=SHFCC'
  const successUrl = '/court-register/details?id=SHFCC&action=UPDATED'
  const missingDate = [{ href: '#inactiveDate', text: 'Enter the date deactivated, including a day, month and year' }]
  const invalidDate = [{ href: '#inactiveDate', text: 'Date deactivated must be a real date' }]
  const inactive = (inactiveDay?: string, inactiveMonth?: string, inactiveYear?: string): UpdateActiveForm => ({
    active: 'false',
    inactiveDay,
    inactiveMonth,
    inactiveYear,
  })

  beforeEach(() => {
    jest.resetAllMocks()
    updateActive.mockResolvedValue({ success: true })
  })

  it.each<UpdateActiveForm>([
    {},
    { active: '' },
    { active: 'TRUE' },
    { active: 'yes' },
    { active: '1' },
    { inactiveDay: '1', inactiveMonth: '2', inactiveYear: '2026' },
    { active: 'maybe', inactiveDay: 'x', inactiveMonth: '', inactiveYear: '' },
  ])('requires a status of true or false: %j', async form => {
    expect(await validate(form, req, updateActive)).toEqual(formUrl)
    expect(req.flash).toHaveBeenCalledTimes(1)
    expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#active', text: 'Select active or inactive' }])
    expect(updateActive).not.toHaveBeenCalled()
  })

  describe('active', () => {
    it.each<UpdateActiveForm>([
      { active: 'true' },
      { active: 'true', inactiveDay: '', inactiveMonth: '', inactiveYear: '' },
      { active: 'true', inactiveDay: '31', inactiveMonth: '2', inactiveYear: '2026' },
      { active: 'true', inactiveDay: 'aa', inactiveMonth: '13', inactiveYear: '26' },
      { active: 'true', inactiveDay: '1', inactiveMonth: '1', inactiveYear: '2026' },
    ])('ignores any submitted date and requests exactly {active: true}: %j', async form => {
      expect(await validate(form, req, updateActive)).toEqual(successUrl)
      expect(updateActive).toHaveBeenCalledTimes(1)
      expect(updateActive.mock.calls[0][0]).toStrictEqual({ active: true })
      expect(req.flash).not.toHaveBeenCalled()
    })
  })

  describe('inactive', () => {
    it.each([
      [inactive('15', '10', '2026'), '2026-10-15'],
      [inactive('5', '3', '2026'), '2026-03-05'],
      [inactive('05', '03', '2026'), '2026-03-05'],
      [inactive('1', '1', '1999'), '1999-01-01'],
      [inactive('31', '12', '2025'), '2025-12-31'],
      [inactive('31', '1', '2026'), '2026-01-31'],
      [inactive('30', '4', '2026'), '2026-04-30'],
      [inactive('29', '2', '2024'), '2024-02-29'],
      [inactive('29', '2', '2000'), '2000-02-29'],
      [inactive('28', '2', '2023'), '2023-02-28'],
    ])('accepts a real date %j and requests the ISO date %s', async (form, inactiveDate) => {
      expect(await validate(form, req, updateActive)).toEqual(successUrl)
      expect(updateActive).toHaveBeenCalledTimes(1)
      expect(updateActive.mock.calls[0][0]).toStrictEqual({ active: false, inactiveDate })
      expect(req.flash).not.toHaveBeenCalled()
    })

    it.each([
      inactive(),
      inactive('', '', ''),
      inactive('', '10', '2026'),
      inactive('15', '', '2026'),
      inactive('15', '10', ''),
      inactive(undefined, '10', '2026'),
      inactive('15', undefined, '2026'),
      inactive('15', '10', undefined),
    ])('requires every date component: %j', async form => {
      expect(await validate(form, req, updateActive)).toEqual(formUrl)
      expect(req.flash).toHaveBeenCalledWith('errors', missingDate)
      expect(updateActive).not.toHaveBeenCalled()
    })

    it.each([
      ['non-numeric day', inactive('aa', '10', '2026')],
      ['non-numeric month', inactive('15', 'Oct', '2026')],
      ['non-numeric year', inactive('15', '10', 'year')],
      ['decimal day', inactive('1.5', '10', '2026')],
      ['signed day', inactive('+1', '10', '2026')],
      ['negative month', inactive('15', '-1', '2026')],
      ['inner whitespace', inactive('1 5', '10', '2026')],
      ['three digit day', inactive('015', '10', '2026')],
      ['three digit month', inactive('15', '010', '2026')],
      ['two digit year', inactive('15', '10', '26')],
      ['three digit year', inactive('15', '10', '202')],
      ['five digit year', inactive('15', '10', '20261')],
      ['day zero', inactive('0', '10', '2026')],
      ['day 32', inactive('32', '1', '2026')],
      ['31 April', inactive('31', '4', '2026')],
      ['31 June', inactive('31', '6', '2026')],
      ['30 February', inactive('30', '2', '2024')],
      ['29 February in a non-leap year', inactive('29', '2', '2023')],
      ['29 February in a century non-leap year', inactive('29', '2', '1900')],
      ['month zero', inactive('15', '0', '2026')],
      ['month 13', inactive('15', '13', '2026')],
    ])('rejects an invalid date (%s) without calling the update', async (_, form) => {
      expect(await validate(form, req, updateActive)).toEqual(formUrl)
      expect(req.flash).toHaveBeenCalledTimes(1)
      expect(req.flash).toHaveBeenCalledWith('errors', invalidDate)
      expect(updateActive).not.toHaveBeenCalled()
    })
  })

  it.each<UpdateActiveForm>([{ active: 'true' }, inactive('15', '10', '2026')])(
    'flashes the API user message against the status and returns to the form when rejected: %j',
    async form => {
      updateActive.mockResolvedValue({ success: false, userMessage: 'Court could not be updated' })

      expect(await validate(form, req, updateActive)).toEqual(formUrl)
      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#active', text: 'Court could not be updated' }])
    },
  )

  it('propagates unexpected errors from the update', async () => {
    const error = new Error('Server error')
    updateActive.mockRejectedValue(error)

    await expect(validate({ active: 'true' }, req, updateActive)).rejects.toBe(error)
    expect(req.flash).not.toHaveBeenCalled()
  })
})
