import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import PrisonRegisterController from './prisonRegisterController'
import prisonDetailFields from './prisonDetailFields'
import prisonReferenceFields from './prisonAreaFields'
import HMPPSAgencyRegisterApi from '../../services/hmppsAgencyRegisterApi'

// include this here otherwise TS complains about cyclical dependencies
export interface Services {
  hmppsAgencyRegisterApiService: HMPPSAgencyRegisterApi
}

export default function routes(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const prisonRegisterController = new PrisonRegisterController(services.hmppsAgencyRegisterApiService)

  get('/prison-register', (req, res) => prisonRegisterController.showAllPrisons(req, res))
  get('/prison-register/details', (req, res) => prisonRegisterController.viewPrison(req, res))

  get('/prison-register/add', (req, res) => prisonRegisterController.addNewPrisonStart(req, res))
  get('/prison-register/add-new-prison-details', (req, res) => prisonRegisterController.addNewPrisonDetails(req, res))
  post('/prison-register/add-new-prison-details', (req, res) =>
    prisonRegisterController.submitNewPrisonDetails(req, res),
  )
  get('/prison-register/add-new-prison-address', (req, res) => prisonRegisterController.addNewPrisonAddress(req, res))
  post('/prison-register/add-new-prison-address', (req, res) =>
    prisonRegisterController.submitNewPrisonNewAddress(req, res),
  )
  get('/prison-register/add-new-prison-summary', (req, res) => prisonRegisterController.addNewPrisonSummary(req, res))
  post('/prison-register/add-new-prison-finished', (req, res) =>
    prisonRegisterController.submitNewPrisonSummary(req, res),
  )
  get('/prison-register/add-new-prison-finished', (req, res) => prisonRegisterController.addNewPrisonFinished(req, res))

  prisonDetailFields.forEach(({ field, path }) => {
    get(`/prison-register/${path}/update`, (req, res) => prisonRegisterController.updatePrisonDetail(req, res, field))
    post(`/prison-register/${path}/update`, (req, res) =>
      prisonRegisterController.submitUpdatePrisonDetail(req, res, field),
    )
  })

  get('/prison-register/add-prison-address-start', (req, res) =>
    prisonRegisterController.addPrisonAddressStart(req, res),
  )
  get('/prison-register/add-prison-address', (req, res) => prisonRegisterController.addPrisonAddress(req, res))
  post('/prison-register/add-prison-address', (req, res) => prisonRegisterController.submitAddPrisonAddress(req, res))

  get('/prison-register/add-welsh-prison-address-start', (req, res) =>
    prisonRegisterController.addWelshPrisonAddressStart(req, res),
  )

  get('/prison-register/add-welsh-prison-address', (req, res) =>
    prisonRegisterController.addWelshPrisonAddress(req, res),
  )

  post('/prison-register/add-welsh-prison-address', (req, res) =>
    prisonRegisterController.submitAddWelshPrisonAddress(req, res),
  )

  get('/prison-register/amend-welsh-prison-address-start', (req, res) =>
    prisonRegisterController.amendWelshPrisonAddressStart(req, res),
  )

  get('/prison-register/amend-welsh-prison-address', (req, res) =>
    prisonRegisterController.amendWelshPrisonAddress(req, res),
  )

  post('/prison-register/amend-welsh-prison-address', (req, res) =>
    prisonRegisterController.submitAmendWelshPrisonAddress(req, res),
  )

  get('/prison-register/delete-welsh-prison-address-start', (req, res) =>
    prisonRegisterController.deleteWelshPrisonAddressStart(req, res),
  )

  post('/prison-register/delete-prison-welsh-address', (req, res) =>
    prisonRegisterController.submitDeleteWelshPrisonAddress(req, res),
  )

  get('/prison-register/amend-prison-address-start', (req, res) =>
    prisonRegisterController.amendPrisonAddressStart(req, res),
  )
  get('/prison-register/amend-prison-address', (req, res) => prisonRegisterController.amendPrisonAddress(req, res))
  post('/prison-register/amend-prison-address', (req, res) =>
    prisonRegisterController.submitAmendPrisonAddress(req, res),
  )

  get('/prison-register/delete-prison-address-start', (req, res) =>
    prisonRegisterController.deletePrisonAddressStart(req, res),
  )
  post('/prison-register/delete-prison-address', (req, res) =>
    prisonRegisterController.submitDeletePrisonAddress(req, res),
  )

  get('/prison-register/department/create', (req, res) => prisonRegisterController.addDepartment(req, res))
  post('/prison-register/department/create', (req, res) => prisonRegisterController.submitAddDepartment(req, res))
  get('/prison-register/department/update', (req, res) => prisonRegisterController.updateDepartment(req, res))
  post('/prison-register/department/update', (req, res) => prisonRegisterController.submitUpdateDepartment(req, res))
  get('/prison-register/department/delete', (req, res) => prisonRegisterController.deleteDepartment(req, res))
  post('/prison-register/department/delete', (req, res) => prisonRegisterController.submitDeleteDepartment(req, res))

  get('/prison-register/cjit-code/update', (req, res) => prisonRegisterController.updateCjitCode(req, res))
  post('/prison-register/cjit-code/update', (req, res) => prisonRegisterController.submitUpdateCjitCode(req, res))
  prisonReferenceFields.forEach(({ field, path }) => {
    get(`/prison-register/${path}/update`, (req, res) => prisonRegisterController.updateReference(req, res, field))
    post(`/prison-register/${path}/update`, (req, res) =>
      prisonRegisterController.submitUpdateReference(req, res, field),
    )
  })

  post('/prison-register/toggle-prison-active', (req, res) => prisonRegisterController.togglePrisonActive(req, res))

  return router
}
