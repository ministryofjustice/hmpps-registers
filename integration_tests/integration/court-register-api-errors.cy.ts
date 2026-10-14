import courtData from '../../server/routes/testutils/mockCourtData'
import CourtsDetails from '../pages/court-register/courtsDetails'

const court = courtData.court({
  courtId: 'SHFCC',
  courtName: 'Sheffield Crown Court',
  emailAddresses: [{ id: 1, address: 'original@example.com' }],
  phoneNumbers: [{ id: 1, number: '0114 555 1111' }],
  addresses: [courtData.address({ id: 1, town: 'Sheffield', country: 'England' })],
})

const flows = [
  {
    name: 'update email',
    url: '/court-register/email/update?id=SHFCC&emailId=1',
    endpoint: 'email-address/1',
    method: 'PUT',
    field: 'emailAddress',
    value: 'new@example.com',
    successTask: 'stubUpdateCourtEmailAddress',
    successArgs: { courtId: 'SHFCC', emailId: 1 },
  },
  {
    name: 'add phone',
    url: '/court-register/phone/create?id=SHFCC',
    endpoint: 'phone-number',
    method: 'POST',
    field: 'phoneNumber',
    value: '0114 555 2222',
    successTask: 'stubAddCourtPhoneNumber',
    successArgs: 'SHFCC',
  },
  {
    name: 'update phone',
    url: '/court-register/phone/update?id=SHFCC&phoneId=1',
    endpoint: 'phone-number/1',
    method: 'PUT',
    field: 'phoneNumber',
    value: '0114 555 2222',
    successTask: 'stubUpdateCourtPhoneNumber',
    successArgs: { courtId: 'SHFCC', phoneId: 1 },
  },
  {
    name: 'add address',
    url: '/court-register/address/create?id=SHFCC',
    endpoint: 'address',
    method: 'POST',
    field: 'addressline1',
    value: '2 New Street',
    successTask: 'stubAddCourtAddress',
    successArgs: 'SHFCC',
  },
  {
    name: 'update address',
    url: '/court-register/address/update?id=SHFCC&addressId=1',
    endpoint: 'address/1',
    method: 'PUT',
    field: 'addressline1',
    value: '2 New Street',
    successTask: 'stubUpdateCourtAddress',
    successArgs: { courtId: 'SHFCC', addressId: 1 },
  },
]

context('Court register - API validation errors', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetCourt', court)
    cy.task('stubGetTownSuggestions', [
      { code: 'SHEF', description: 'Sheffield' },
      { code: 'SHEP', description: 'Shepton Mallet' },
      { code: 'LEED', description: 'Leeds' },
    ])
    cy.task('stubGetCountySuggestions', [
      { code: 'SY', description: 'South Yorkshire' },
      { code: 'WY', description: 'West Yorkshire' },
      { code: 'DERB', description: 'Derbyshire' },
    ])
    cy.signIn()
  })

  flows.forEach(flow => {
    it(`will display the API message, retain input and allow retry for ${flow.name}`, () => {
      const userMessage = `Cannot ${flow.name}: this value already exists`
      cy.task('stubCourtMutationError', {
        courtId: court.courtId,
        endpoint: flow.endpoint,
        method: flow.method,
        userMessage,
      })
      cy.visit(flow.url)
      cy.get(`input#${flow.field}`).clear()
      cy.get(`input#${flow.field}`).type(`  ${flow.value}  `)

      if (flow.endpoint.startsWith('address')) {
        cy.get('#addressline2').clear()
        cy.get('#addressline2').type('Court Building')
        cy.get('input#addresstown').clear()
        cy.get('input#addresstown').type('Sheffield')
        cy.get('input#addresscounty').clear()
        cy.get('input#addresscounty').type('South Yorkshire')
        cy.get('#addresspostcode').clear()
        cy.get('#addresspostcode').type('S1 2BJ')
        cy.get('input[name=addresscountry][value=England]').check()
      }

      cy.get('[data-qa=continue-button]').click()

      cy.url().should('include', flow.url)
      cy.get(`#${flow.field}-error`).should('contain.text', userMessage)
      cy.get(`input#${flow.field}`).should('have.value', flow.value)
      if (flow.endpoint.startsWith('address')) {
        cy.get('#addressline2').should('have.value', 'Court Building')
        cy.get('input#addresstown').should('have.value', 'Sheffield')
        cy.get('input#addresscounty').should('have.value', 'South Yorkshire')
        cy.get('#addresspostcode').should('have.value', 'S1 2BJ')
        cy.get('input[name=addresscountry][value=England]').should('be.checked')
      }

      cy.task(flow.successTask, flow.successArgs)
      cy.get(`input#${flow.field}`).clear()
      cy.get(`input#${flow.field}`).type(flow.field === 'emailAddress' ? 'corrected@example.com' : `3 ${flow.value}`)
      cy.get('[data-qa=continue-button]').click()

      CourtsDetails.verifyOnPage(court.courtName)
      cy.url().should('include', '/court-register/details?id=SHFCC&action=UPDATED')
      cy.get('[data-qa=confirm-updated]').should('contain.text', 'Court has been updated successfully')
    })
  })
})
