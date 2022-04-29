import type { Page } from '../page'
import page from '../page'

const deletePrisonAddress = {
  deleteAddressButton: () => cy.contains('Delete address'),
}
const verifyOnPage = (prisonId: string): typeof deletePrisonAddress & Page =>
  page(`Address to be removed for prison: ${prisonId}`, deletePrisonAddress)
export default { verifyOnPage }
