import express from 'express'
import request from 'supertest'
import config from '../../config'
import nunjucksSetup from '../../utils/nunjucksSetup'
import appWithAllRoutes from '../testutils/appSetup'
import courtData from '../testutils/mockCourtData'
import CourtDetailsView from './courtDetailsView'

describe('Court deletion feature switch', () => {
  const originalDeleteEnabled = config.agencyRegistersDeleteEnabled
  const court = courtData.court({ courtId: 'SHFCC', courtName: 'Sheffield Crown Court' })
  const environment = nunjucksSetup(express())

  afterEach(() => {
    config.agencyRegistersDeleteEnabled = originalDeleteEnabled
  })

  it.each([true, false])('only shows the details delete button when enabled: %s', enabled => {
    config.agencyRegistersDeleteEnabled = enabled
    const html = environment.render(
      'pages/court-register/courtDetails.njk',
      new CourtDetailsView(court, 'NONE').renderArgs,
    )

    expect(html.includes('data-qa="delete-court-button"')).toBe(enabled)
    if (enabled) {
      expect(html).toContain('govuk-button--warning')
      expect(html).toContain('/court-register/delete?id=SHFCC')
      expect(html).toContain('Delete court')
    }
  })

  it.each([true, false])('only shows the confirmation delete button when enabled: %s', enabled => {
    const html = environment.render('pages/components/edit/deleteAgency.njk', {
      name: court.courtName,
      agencyId: court.courtId,
      agencyType: 'court',
      agencyRegistersDeleteEnabled: enabled,
      csrfToken: 'test-csrf-token',
      navigation: { cancelButton: '/court-register/details?id=SHFCC' },
    })

    expect(html.includes('data-qa="delete-agency-button"')).toBe(enabled)
    expect(html).toContain('test-csrf-token')
    expect(html).toContain('Sheffield Crown Court')
    expect(html).toContain('/court-register/details?id=SHFCC')
    if (enabled) expect(html).toContain('govuk-button--warning')
  })

  it.each(['get', 'post'] as const)('returns 404 for direct %s requests when disabled', async method => {
    config.agencyRegistersDeleteEnabled = false

    await request(appWithAllRoutes({}))[method]('/court-register/delete?id=SHFCC').expect(404)
  })
})
