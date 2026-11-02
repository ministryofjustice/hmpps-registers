import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import AddApprovedPremisesController from './create/addApprovedPremisesController'
import ApprovedPremisesRegisterController from './approvedPremisesRegisterController'
import HMPPSAgencyRegisterApi from '../../services/hmppsAgencyRegisterApi'

// include this here otherwise TS complains about cyclical dependencies
export interface Services {
  hmppsAgencyRegisterApiService: HMPPSAgencyRegisterApi
}

export default function routes(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const base = '/approved-premises-register'
  const approvedPremisesRegisterController = new ApprovedPremisesRegisterController(
    services.hmppsAgencyRegisterApiService,
  )

  const addController = new AddApprovedPremisesController(services.hmppsAgencyRegisterApiService)

  get('/approved-premises-register', (req, res) => approvedPremisesRegisterController.showAllApprovedPremises(req, res))
  get(`${base}/create/start`, (req, res) => addController.start(req, res))
  get(`${base}/create/:journeyId/cancel`, (req, res) => addController.cancel(req, res))
  get(`${base}/create/:journeyId/:step`, (req, res) => addController.show(req, res))
  post(`${base}/create/:journeyId/:step`, (req, res) => addController.submit(req, res))
  get('/approved-premises-register/details', (req, res) =>
    approvedPremisesRegisterController.viewApprovedPremises(req, res),
  )

  get(`${base}/name-description/update`, (req, res) =>
    approvedPremisesRegisterController.updateNameDescription(req, res),
  )
  post(`${base}/name-description/update`, (req, res) =>
    approvedPremisesRegisterController.submitUpdateNameDescription(req, res),
  )
  get(`${base}/active/update`, (req, res) => approvedPremisesRegisterController.updateActive(req, res))
  post(`${base}/active/update`, (req, res) => approvedPremisesRegisterController.submitUpdateActive(req, res))
  get(`${base}/cjit-code/update`, (req, res) => approvedPremisesRegisterController.updateCjitCode(req, res))
  post(`${base}/cjit-code/update`, (req, res) => approvedPremisesRegisterController.submitUpdateCjitCode(req, res))
  get(`${base}/area/update`, (req, res) => approvedPremisesRegisterController.updateArea(req, res))
  post(`${base}/area/update`, (req, res) => approvedPremisesRegisterController.submitUpdateArea(req, res))
  get(`${base}/region/update`, (req, res) => approvedPremisesRegisterController.updateRegion(req, res))
  post(`${base}/region/update`, (req, res) => approvedPremisesRegisterController.submitUpdateRegion(req, res))
  get(`${base}/geographical-area/update`, (req, res) =>
    approvedPremisesRegisterController.updateGeographicalArea(req, res),
  )
  post(`${base}/geographical-area/update`, (req, res) =>
    approvedPremisesRegisterController.submitUpdateGeographicalArea(req, res),
  )
  get(`${base}/local-authority/update`, (req, res) => approvedPremisesRegisterController.updateLocalAuthority(req, res))
  post(`${base}/local-authority/update`, (req, res) =>
    approvedPremisesRegisterController.submitUpdateLocalAuthority(req, res),
  )
  get(`${base}/payroll-region/update`, (req, res) => approvedPremisesRegisterController.updatePayrollRegion(req, res))
  post(`${base}/payroll-region/update`, (req, res) =>
    approvedPremisesRegisterController.submitUpdatePayrollRegion(req, res),
  )
  get(`${base}/address/create`, (req, res) => approvedPremisesRegisterController.addAddress(req, res))
  post(`${base}/address/create`, (req, res) => approvedPremisesRegisterController.submitAddAddress(req, res))
  get(`${base}/address/update`, (req, res) => approvedPremisesRegisterController.updateAddress(req, res))
  post(`${base}/address/update`, (req, res) => approvedPremisesRegisterController.submitUpdateAddress(req, res))
  get(`${base}/phone/create`, (req, res) => approvedPremisesRegisterController.addPhone(req, res))
  post(`${base}/phone/create`, (req, res) => approvedPremisesRegisterController.submitAddPhone(req, res))
  get(`${base}/phone/update`, (req, res) => approvedPremisesRegisterController.updatePhone(req, res))
  post(`${base}/phone/update`, (req, res) => approvedPremisesRegisterController.submitUpdatePhone(req, res))
  get(`${base}/email/create`, (req, res) => approvedPremisesRegisterController.addEmail(req, res))
  post(`${base}/email/create`, (req, res) => approvedPremisesRegisterController.submitAddEmail(req, res))
  get(`${base}/email/update`, (req, res) => approvedPremisesRegisterController.updateEmail(req, res))
  post(`${base}/email/update`, (req, res) => approvedPremisesRegisterController.submitUpdateEmail(req, res))
  get(`${base}/contact/update`, (req, res) => approvedPremisesRegisterController.updateContact(req, res))
  post(`${base}/contact/update`, (req, res) => approvedPremisesRegisterController.submitUpdateContact(req, res))
  get(`${base}/accessible-access/update`, (req, res) =>
    approvedPremisesRegisterController.updateAccessibleAccess(req, res),
  )
  post(`${base}/accessible-access/update`, (req, res) =>
    approvedPremisesRegisterController.submitUpdateAccessibleAccess(req, res),
  )

  return router
}
