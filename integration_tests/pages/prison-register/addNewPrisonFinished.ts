import type { Page } from '../page'
import page from '../page'

const finished = {
  message: () => cy.get('[data-qa=message]'),
}
const verifyOnPage = (): typeof finished & Page => page('Add a new prison - finished', finished)

export default { verifyOnPage }
