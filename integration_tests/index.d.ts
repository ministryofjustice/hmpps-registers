declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to login. Set failOnStatusCode to false if you expect and non 200 return code
     * @example cy.login({ failOnStatusCode: boolean })
     */
    login<S = unknown>(options?: { failOnStatusCode: false }): Chainable<S>
    /**
     * Task to stub a list of courts when calling /courts/all
     * @example cy.task('stubAllCourts', [
     * {courtId: 'SHFCC', courtName: 'Sheffield Crown Court', courtDescription: 'Sheffield Crown Court - Yorkshire', courtType: 'CROWN', active: true},
     * {courtId: 'SHFCC', courtName: 'Sheffield Crown Court', courtDescription: 'Sheffield Crown Court - Yorkshire', courtType: 'CROWN', active: true}])
     */
    task<S = unknown>(event: 'stubAllCourts', courts: Array<Court>): Chainable<S>
    /**
     * Task to stub a page of courts when calling /courts/paged
     * @example cy.task('stubPageOfCourts', {
      content: [
        { courtId: 'SHFCC', courtName: 'Sheffield Crown Court', courtDescription: 'Sheffield Crown Court - Yorkshire', courtType: 'CROWN', active: true, },
        { courtId: 'SHFMC', courtName: 'Sheffield Magistrates Court', courtDescription: 'Sheffield Magistrates Court - Yorkshire', courtType: 'MAGISTRATES', active: true, },
        { courtId: 'SHFYC', courtName: 'Sheffield Touth Court', courtDescription: 'Sheffield Youth Court - Yorkshire', courtType: 'YOUTH', active: false, },
      ],
      last: false,
      totalPages: 2,
      totalElements: 4,
      number: 0,
      size: 3,
      first: true,
      numberOfElements: 3,
      empty: false,
    })
     */
    task<S = unknown>(event: 'stubPageOfCourts', courtPage: CourtsPage): Chainable<S>
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

interface CourtsPage {
  content?: Court[]
  last?: boolean
  totalPages?: number
  totalElements?: number
  number?: number
  size?: number
  first?: boolean
  numberOfElements?: number
  empty?: boolean
}
