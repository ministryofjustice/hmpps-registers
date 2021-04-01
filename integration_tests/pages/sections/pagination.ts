const firstPagination = () => cy.get('.moj-pagination').first()

export default {
  pagination: (): Cypress.Chainable<JQuery> => cy.get('.moj-pagination'),
  pageLinks: (): Cypress.Chainable<{ href: string; text: string; selected: boolean }[]> =>
    firstPagination()
      .find(`.moj-pagination__item`)
      .spread((...rest) =>
        rest.map(element => ({
          href: Cypress.$(element).find('a').attr('href'),
          text: Cypress.$(element).text().trim(),
          selected: Cypress.$(element).find('a').attr('href') === undefined,
        }))
      ),
  pageResults: (): Cypress.Chainable<JQuery> => firstPagination().find('.moj-pagination__results'),
  clickLinkWithText: (text: string): Cypress.Chainable<JQuery> =>
    firstPagination().get(`.moj-pagination__item`).contains(text).click(),
}
