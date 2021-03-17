import type { Page } from '../page'
import page from '../page'

const courtDetails = {
  markAsClosedButton: () => cy.get('[data-qa=mark-as-closed]'),
  markAsOpenButton: () => cy.get('[data-qa=mark-as-open]'),
  activatedConfirmationBlock: () => cy.get('[data-qa=confirm-activation]'),
  deactivatedConfirmationBlock: () => cy.get('[data-qa=confirm-deactivation]'),
}
const verifyOnPage = (courtName: string): typeof courtDetails & Page => page(courtName, courtDetails)

export default { verifyOnPage }
