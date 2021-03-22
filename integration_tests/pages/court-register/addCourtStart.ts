import type { Page } from '../page'
import page from '../page'

const addNewCourt = {}
const verifyOnPage = (): typeof addNewCourt & Page => page('Add a new court', addNewCourt)

export default { verifyOnPage }
