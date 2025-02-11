import type { Page } from '../page'
import page from '../page'

const deleteWelshPrisonAddress = {
  deleteAddressButton: () => cy.contains('Delete address'),
}
const verifyOnPage = (prisonId: string): typeof deleteWelshPrisonAddress & Page =>
  page(`Delete Welsh address for ${prisonId}`, deleteWelshPrisonAddress)
export default { verifyOnPage }
