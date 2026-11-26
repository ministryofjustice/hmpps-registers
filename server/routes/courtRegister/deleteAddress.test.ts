import express from 'express'
import request from 'supertest'
import config from '../../config'
import nunjucksSetup from '../../utils/nunjucksSetup'
import appWithAllRoutes from '../testutils/appSetup'
import courtData from '../testutils/mockCourtData'
import CourtDetailsView from './courtDetailsView'

describe('Court address deletion', () => {
  const originalDeleteEnabled = config.agencyRegistersDeleteEnabled
  const address = courtData.address({ id: 2, addressLine1: '<script>alert(1)</script>' })
  const court = courtData.court({ addresses: [address] })
  const environment = nunjucksSetup(express())

  afterEach(() => {
    config.agencyRegistersDeleteEnabled = originalDeleteEnabled
  })

  it.each([true, false])('only shows address delete links when enabled: %s', enabled => {
    config.agencyRegistersDeleteEnabled = enabled
    const html = environment.render(
      'pages/court-register/courtDetails.njk',
      new CourtDetailsView(court, 'NONE').renderArgs,
    )

    expect(html.includes('data-qa="delete-address-link"')).toBe(enabled)
    expect(html).toContain('data-qa="update-address-link"')
    if (enabled) expect(html).toContain('/court-register/address/delete?id=SHFCC&amp;addressId=2')
  })

  it('does not show delete links when there are no addresses', () => {
    config.agencyRegistersDeleteEnabled = true
    const html = environment.render(
      'pages/court-register/courtDetails.njk',
      new CourtDetailsView(courtData.court({}), 'NONE').renderArgs,
    )

    expect(html).not.toContain('data-qa="delete-address-link"')
  })

  it('does not enable deletion for other register address cards', () => {
    const html = environment.renderString(
      '{% from "partials/addressesCard.njk" import addressesCard %}{{ addressesCard(opts) }}',
      { opts: { addresses: [address], id: 'OTHER', baseRegisterUrl: '/other-agency-register' } },
    )

    expect(html).toContain('data-qa="update-address-link"')
    expect(html).not.toContain('data-qa="delete-address-link"')
  })

  it('renders an escaped address, CSRF token, selected ID, warning button and cancel link', () => {
    const html = environment.render('pages/components/edit/deleteAgencyAddress.njk', {
      name: court.courtName,
      address,
      csrfToken: 'test-csrf-token',
      navigation: { cancelButton: '/court-register/details?id=SHFCC' },
    })

    expect(html).toContain('Delete address for Sheffield Crown Court')
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(html).not.toContain('<script>alert(1)</script>')
    expect(html).toContain('name="addressId" value="2"')
    expect(html).toContain('test-csrf-token')
    expect(html).toContain('govuk-button--warning')
    expect(html).toContain('/court-register/details?id=SHFCC')
  })

  it.each(['get', 'post'] as const)('blocks direct %s requests when disabled', async method => {
    config.agencyRegistersDeleteEnabled = false

    await request(appWithAllRoutes({}))
      [method]('/court-register/address/delete?id=SHFCC&addressId=2')
      .send({ addressId: '2' })
      .expect(404)
  })
})
