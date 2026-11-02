import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import OtherAgencyRegisterController from './otherAgencyRegisterController'
import AddOtherAgencyController from './create/addOtherAgencyController'
import HMPPSAgencyRegisterApi from '../../services/hmppsAgencyRegisterApi'

// include this here otherwise TS complains about cyclical dependencies
export interface Services {
  hmppsAgencyRegisterApiService: HMPPSAgencyRegisterApi
}

export default function routes(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))
  const base = '/other-agency-register'

  const otherAgencyRegisterController = new OtherAgencyRegisterController(services.hmppsAgencyRegisterApiService)

  const addController = new AddOtherAgencyController(services.hmppsAgencyRegisterApiService)

  get('/other-agency-register', (req, res) => otherAgencyRegisterController.showAllOtherAgencies(req, res))
  get('/other-agency-register/details', (req, res) => otherAgencyRegisterController.viewOtherAgency(req, res))

  get(`${base}/create/start`, (req, res) => addController.start(req, res))
  get(`${base}/create/:journeyId/cancel`, (req, res) => addController.cancel(req, res))
  get(`${base}/create/:journeyId/:step`, (req, res) => addController.show(req, res))
  post(`${base}/create/:journeyId/:step`, (req, res) => addController.submit(req, res))
  get(`${base}/name-description/update`, (req, res) => otherAgencyRegisterController.updateNameDescription(req, res))
  post(`${base}/name-description/update`, (req, res) =>
    otherAgencyRegisterController.submitUpdateNameDescription(req, res),
  )
  get(`${base}/active/update`, (req, res) => otherAgencyRegisterController.updateActive(req, res))
  post(`${base}/active/update`, (req, res) => otherAgencyRegisterController.submitUpdateActive(req, res))
  get(`${base}/cjit-code/update`, (req, res) => otherAgencyRegisterController.updateCjitCode(req, res))
  post(`${base}/cjit-code/update`, (req, res) => otherAgencyRegisterController.submitUpdateCjitCode(req, res))
  get(`${base}/area/update`, (req, res) => otherAgencyRegisterController.updateArea(req, res))
  post(`${base}/area/update`, (req, res) => otherAgencyRegisterController.submitUpdateArea(req, res))
  get(`${base}/region/update`, (req, res) => otherAgencyRegisterController.updateRegion(req, res))
  post(`${base}/region/update`, (req, res) => otherAgencyRegisterController.submitUpdateRegion(req, res))
  get(`${base}/geographical-area/update`, (req, res) => otherAgencyRegisterController.updateGeographicalArea(req, res))
  post(`${base}/geographical-area/update`, (req, res) =>
    otherAgencyRegisterController.submitUpdateGeographicalArea(req, res),
  )
  get(`${base}/local-authority/update`, (req, res) => otherAgencyRegisterController.updateLocalAuthority(req, res))
  post(`${base}/local-authority/update`, (req, res) =>
    otherAgencyRegisterController.submitUpdateLocalAuthority(req, res),
  )
  get(`${base}/payroll-region/update`, (req, res) => otherAgencyRegisterController.updatePayrollRegion(req, res))
  post(`${base}/payroll-region/update`, (req, res) => otherAgencyRegisterController.submitUpdatePayrollRegion(req, res))
  get(`${base}/address/create`, (req, res) => otherAgencyRegisterController.addAddress(req, res))
  post(`${base}/address/create`, (req, res) => otherAgencyRegisterController.submitAddAddress(req, res))
  get(`${base}/address/update`, (req, res) => otherAgencyRegisterController.updateAddress(req, res))
  post(`${base}/address/update`, (req, res) => otherAgencyRegisterController.submitUpdateAddress(req, res))
  get(`${base}/phone/create`, (req, res) => otherAgencyRegisterController.addPhone(req, res))
  post(`${base}/phone/create`, (req, res) => otherAgencyRegisterController.submitAddPhone(req, res))
  get(`${base}/phone/update`, (req, res) => otherAgencyRegisterController.updatePhone(req, res))
  post(`${base}/phone/update`, (req, res) => otherAgencyRegisterController.submitUpdatePhone(req, res))
  get(`${base}/email/create`, (req, res) => otherAgencyRegisterController.addEmail(req, res))
  post(`${base}/email/create`, (req, res) => otherAgencyRegisterController.submitAddEmail(req, res))
  get(`${base}/email/update`, (req, res) => otherAgencyRegisterController.updateEmail(req, res))
  post(`${base}/email/update`, (req, res) => otherAgencyRegisterController.submitUpdateEmail(req, res))
  get(`${base}/agency-type/update`, (req, res) => otherAgencyRegisterController.updateAgencyType(req, res))
  post(`${base}/agency-type/update`, (req, res) => otherAgencyRegisterController.submitUpdateAgencyType(req, res))
  get(`${base}/accessible-access/update`, (req, res) => otherAgencyRegisterController.updateAccessibleAccess(req, res))
  post(`${base}/accessible-access/update`, (req, res) =>
    otherAgencyRegisterController.submitUpdateAccessibleAccess(req, res),
  )

  return router
}
