import { Request } from 'express'
import validate from './updatePayrollRegionValidator'
import type { AgencyMutationResponse } from '../../services/hmppsAgencyRegisterApi'
import type { CodeDescription } from '../../@types/prisonRegister'

describe('updatePayrollRegionValidator', () => {
  const req = { query: { id: 'SHFCC' }, flash: jest.fn() } as unknown as Request
  const getPayrollRegions = jest.fn<Promise<CodeDescription[]>, []>()
  const updatePayrollRegion = jest.fn<Promise<AgencyMutationResponse>, [string?]>()

  beforeEach(() => {
    jest.resetAllMocks()
    req.session = {} as Request['session']
    getPayrollRegions.mockResolvedValue([
      { code: 'YH', description: 'Yorkshire and the Humber' },
      { code: 'NE', description: 'North East' },
    ])
    updatePayrollRegion.mockResolvedValue({ success: true })
  })

  it('rejects description-only input instead of silently clearing the reference', async () => {
    await validate(
      { payrollRegionCode: '', payrollRegionDescription: 'Unselected text' },
      req,
      getPayrollRegions,
      updatePayrollRegion,
    )
    expect(req.flash).toHaveBeenCalledWith('errors', [
      { href: '#payrollRegion', text: 'Select a valid payroll region from the suggestions' },
    ])
    expect(updatePayrollRegion).not.toHaveBeenCalled()
    expect(getPayrollRegions).not.toHaveBeenCalled()
  })

  it.each(['YH', 'NE'])('accepts the known payroll region code %s', async payrollRegionCode => {
    expect(
      await validate(
        { payrollRegionCode, payrollRegionDescription: 'Not the description' },
        req,
        getPayrollRegions,
        updatePayrollRegion,
      ),
    ).toBe('/court-register/details?id=SHFCC&action=UPDATED')
    expect(updatePayrollRegion).toHaveBeenCalledWith(payrollRegionCode)
    expect(req.flash).not.toHaveBeenCalled()
  })

  it.each([{}, { payrollRegionCode: '' }])(
    'clears the payroll region without loading reference data for %j',
    async form => {
      expect(await validate(form, req, getPayrollRegions, updatePayrollRegion)).toBe(
        '/court-register/details?id=SHFCC&action=UPDATED',
      )
      expect(getPayrollRegions).not.toHaveBeenCalled()
      expect(updatePayrollRegion).toHaveBeenCalledWith(undefined)
    },
  )

  it('rejects an unknown payroll region code', async () => {
    expect(
      await validate(
        { payrollRegionCode: 'North East', payrollRegionDescription: 'North East' },
        req,
        getPayrollRegions,
        updatePayrollRegion,
      ),
    ).toBe('/court-register/payroll-region/update?id=SHFCC')
    expect(req.flash).toHaveBeenCalledWith('errors', [
      { href: '#payrollRegion', text: 'Select a valid payroll region from the suggestions' },
    ])
    expect(updatePayrollRegion).not.toHaveBeenCalled()
  })

  it('shows API user messages when the update is rejected', async () => {
    updatePayrollRegion.mockResolvedValue({ success: false, userMessage: 'Payroll region cannot be changed' })

    expect(await validate({ payrollRegionCode: 'YH' }, req, getPayrollRegions, updatePayrollRegion)).toBe(
      '/court-register/payroll-region/update?id=SHFCC',
    )
    expect(req.flash).toHaveBeenCalledWith('errors', [
      { href: '#payrollRegion', text: 'Payroll region cannot be changed' },
    ])
  })

  it('propagates reference data failures without updating', async () => {
    const error = new Error('Reference data unavailable')
    getPayrollRegions.mockRejectedValue(error)

    await expect(validate({ payrollRegionCode: 'YH' }, req, getPayrollRegions, updatePayrollRegion)).rejects.toBe(error)
    expect(updatePayrollRegion).not.toHaveBeenCalled()
  })
})
