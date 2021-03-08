declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to login. Set failOnStatusCode to false if you expect and non 200 return code
     * @example cy.login({ failOnStatusCode: boolean })
     */
    login<S = unknown>(options?: { failOnStatusCode: false }): Chainable<S>
    /**
     * Task to stub a list of courts when calling /courts/all
     * @example cy.task('stubCourts', [
     * {courtId: 'SHFCC', courtName: 'Sheffield Crown Court', courtDescription: 'Sheffield Crown Court - Yorkshire', courtType: 'CROWN', active: true},
     * {courtId: 'SHFCC', courtName: 'Sheffield Crown Court', courtDescription: 'Sheffield Crown Court - Yorkshire', courtType: 'CROWN', active: true}])
     */
    task<S = unknown>(event: 'stubCourts', courts: Array<Court>): Chainable<S>
    /**
     * Task to stub a list of courts when calling /courts/:id
     * @example cy.task( 'stubCourt', { courtId: 'SHFCC', courtName: 'Sheffield Crown Court', courtDescription: 'Sheffield Crown Court - Yorkshire', courtType: 'CROWN', active: true })
     */
    task<S = unknown>(event: 'stubCourt', court: Court): Chainable<S>
  }
}

interface Court {
  courtId: string
  courtName: string
  courtDescription: string
  courtType: string
  active: boolean
}
