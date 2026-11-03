import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import AddProbationOfficeController from './create/addProbationOfficeController'
import ProbationOfficeRegisterController from './probationOfficeRegisterController'
import HMPPSAgencyRegisterApi from '../../services/hmppsAgencyRegisterApi'

// include this here otherwise TS complains about cyclical dependencies
export interface Services {
  hmppsAgencyRegisterApiService: HMPPSAgencyRegisterApi
}

export default function routes(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const base = '/probation-office-register'
  const probationOfficeRegisterController = new ProbationOfficeRegisterController(
    services.hmppsAgencyRegisterApiService,
  )

  const addController = new AddProbationOfficeController(services.hmppsAgencyRegisterApiService)

  get('/probation-office-register', (req, res) => probationOfficeRegisterController.showAllProbationOffices(req, res))
  get(`${base}/create/start`, (req, res) => addController.start(req, res))
  get(`${base}/create/:journeyId/cancel`, (req, res) => addController.cancel(req, res))
  get(`${base}/create/:journeyId/:step`, (req, res) => addController.show(req, res))
  post(`${base}/create/:journeyId/:step`, (req, res) => addController.submit(req, res))
  get('/probation-office-register/details', (req, res) =>
    probationOfficeRegisterController.viewProbationOffice(req, res),
  )

  get(`${base}/delete`, (req, res) => probationOfficeRegisterController.deleteProbationOffice(req, res))
  post(`${base}/delete`, (req, res) => probationOfficeRegisterController.submitDeleteProbationOffice(req, res))
  get(`${base}/name-description/update`, (req, res) =>
    probationOfficeRegisterController.updateNameDescription(req, res),
  )
  post(`${base}/name-description/update`, (req, res) =>
    probationOfficeRegisterController.submitUpdateNameDescription(req, res),
  )
  get(`${base}/active/update`, (req, res) => probationOfficeRegisterController.updateActive(req, res))
  post(`${base}/active/update`, (req, res) => probationOfficeRegisterController.submitUpdateActive(req, res))
  get(`${base}/cjit-code/update`, (req, res) => probationOfficeRegisterController.updateCjitCode(req, res))
  post(`${base}/cjit-code/update`, (req, res) => probationOfficeRegisterController.submitUpdateCjitCode(req, res))
  get(`${base}/area/update`, (req, res) => probationOfficeRegisterController.updateArea(req, res))
  post(`${base}/area/update`, (req, res) => probationOfficeRegisterController.submitUpdateArea(req, res))
  get(`${base}/region/update`, (req, res) => probationOfficeRegisterController.updateRegion(req, res))
  post(`${base}/region/update`, (req, res) => probationOfficeRegisterController.submitUpdateRegion(req, res))
  get(`${base}/geographical-area/update`, (req, res) =>
    probationOfficeRegisterController.updateGeographicalArea(req, res),
  )
  post(`${base}/geographical-area/update`, (req, res) =>
    probationOfficeRegisterController.submitUpdateGeographicalArea(req, res),
  )
  get(`${base}/local-authority/update`, (req, res) => probationOfficeRegisterController.updateLocalAuthority(req, res))
  post(`${base}/local-authority/update`, (req, res) =>
    probationOfficeRegisterController.submitUpdateLocalAuthority(req, res),
  )
  get(`${base}/payroll-region/update`, (req, res) => probationOfficeRegisterController.updatePayrollRegion(req, res))
  post(`${base}/payroll-region/update`, (req, res) =>
    probationOfficeRegisterController.submitUpdatePayrollRegion(req, res),
  )
  get(`${base}/address/create`, (req, res) => probationOfficeRegisterController.addAddress(req, res))
  post(`${base}/address/create`, (req, res) => probationOfficeRegisterController.submitAddAddress(req, res))
  get(`${base}/address/update`, (req, res) => probationOfficeRegisterController.updateAddress(req, res))
  post(`${base}/address/update`, (req, res) => probationOfficeRegisterController.submitUpdateAddress(req, res))
  get(`${base}/address/delete`, (req, res) => probationOfficeRegisterController.deleteAddress(req, res))
  post(`${base}/address/delete`, (req, res) => probationOfficeRegisterController.submitDeleteAddress(req, res))
  get(`${base}/phone/create`, (req, res) => probationOfficeRegisterController.addPhone(req, res))
  post(`${base}/phone/create`, (req, res) => probationOfficeRegisterController.submitAddPhone(req, res))
  get(`${base}/phone/update`, (req, res) => probationOfficeRegisterController.updatePhone(req, res))
  post(`${base}/phone/update`, (req, res) => probationOfficeRegisterController.submitUpdatePhone(req, res))
  get(`${base}/phone/delete`, (req, res) => probationOfficeRegisterController.deletePhone(req, res))
  post(`${base}/phone/delete`, (req, res) => probationOfficeRegisterController.submitDeletePhone(req, res))
  get(`${base}/email/create`, (req, res) => probationOfficeRegisterController.addEmail(req, res))
  post(`${base}/email/create`, (req, res) => probationOfficeRegisterController.submitAddEmail(req, res))
  get(`${base}/email/update`, (req, res) => probationOfficeRegisterController.updateEmail(req, res))
  post(`${base}/email/update`, (req, res) => probationOfficeRegisterController.submitUpdateEmail(req, res))
  get(`${base}/email/delete`, (req, res) => probationOfficeRegisterController.deleteEmail(req, res))
  post(`${base}/email/delete`, (req, res) => probationOfficeRegisterController.submitDeleteEmail(req, res))
  get(`${base}/contact/update`, (req, res) => probationOfficeRegisterController.updateContact(req, res))
  post(`${base}/contact/update`, (req, res) => probationOfficeRegisterController.submitUpdateContact(req, res))
  get(`${base}/accessible-access/update`, (req, res) =>
    probationOfficeRegisterController.updateAccessibleAccess(req, res),
  )
  post(`${base}/accessible-access/update`, (req, res) =>
    probationOfficeRegisterController.submitUpdateAccessibleAccess(req, res),
  )

  return router
}
