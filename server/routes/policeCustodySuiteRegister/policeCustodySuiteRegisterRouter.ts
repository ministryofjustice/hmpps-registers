import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import PoliceCustodySuiteRegisterController from './policeCustodySuiteRegisterController'
import HMPPSAgencyRegisterApi from '../../services/hmppsAgencyRegisterApi'

// include this here otherwise TS complains about cyclical dependencies
export interface Services {
  hmppsAgencyRegisterApiService: HMPPSAgencyRegisterApi
}

export default function routes(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const controller = new PoliceCustodySuiteRegisterController(services.hmppsAgencyRegisterApiService)
  const base = '/police-custody-suite-register'

  get(base, (req, res) => controller.showAllPoliceCustodySuites(req, res))
  get(`${base}/details`, (req, res) => controller.viewPoliceCustodySuite(req, res))
  get(`${base}/delete`, (req, res) => controller.deletePoliceCustodySuite(req, res))
  post(`${base}/delete`, (req, res) => controller.submitDeletePoliceCustodySuite(req, res))
  get(`${base}/name-description/update`, (req, res) => controller.updateNameDescription(req, res))
  post(`${base}/name-description/update`, (req, res) => controller.submitUpdateNameDescription(req, res))
  get(`${base}/active/update`, (req, res) => controller.updateActive(req, res))
  post(`${base}/active/update`, (req, res) => controller.submitUpdateActive(req, res))
  get(`${base}/cjit-code/update`, (req, res) => controller.updateCjitCode(req, res))
  post(`${base}/cjit-code/update`, (req, res) => controller.submitUpdateCjitCode(req, res))
  get(`${base}/area/update`, (req, res) => controller.updateArea(req, res))
  post(`${base}/area/update`, (req, res) => controller.submitUpdateArea(req, res))
  get(`${base}/region/update`, (req, res) => controller.updateRegion(req, res))
  post(`${base}/region/update`, (req, res) => controller.submitUpdateRegion(req, res))
  get(`${base}/geographical-area/update`, (req, res) => controller.updateGeographicalArea(req, res))
  post(`${base}/geographical-area/update`, (req, res) => controller.submitUpdateGeographicalArea(req, res))
  get(`${base}/local-authority/update`, (req, res) => controller.updateLocalAuthority(req, res))
  post(`${base}/local-authority/update`, (req, res) => controller.submitUpdateLocalAuthority(req, res))
  get(`${base}/payroll-region/update`, (req, res) => controller.updatePayrollRegion(req, res))
  post(`${base}/payroll-region/update`, (req, res) => controller.submitUpdatePayrollRegion(req, res))
  get(`${base}/address/create`, (req, res) => controller.addAddress(req, res))
  post(`${base}/address/create`, (req, res) => controller.submitAddAddress(req, res))
  get(`${base}/address/update`, (req, res) => controller.updateAddress(req, res))
  post(`${base}/address/update`, (req, res) => controller.submitUpdateAddress(req, res))
  get(`${base}/address/delete`, (req, res) => controller.deleteAddress(req, res))
  post(`${base}/address/delete`, (req, res) => controller.submitDeleteAddress(req, res))
  get(`${base}/phone/create`, (req, res) => controller.addPhone(req, res))
  post(`${base}/phone/create`, (req, res) => controller.submitAddPhone(req, res))
  get(`${base}/phone/update`, (req, res) => controller.updatePhone(req, res))
  post(`${base}/phone/update`, (req, res) => controller.submitUpdatePhone(req, res))
  get(`${base}/phone/delete`, (req, res) => controller.deletePhone(req, res))
  post(`${base}/phone/delete`, (req, res) => controller.submitDeletePhone(req, res))
  get(`${base}/email/create`, (req, res) => controller.addEmail(req, res))
  post(`${base}/email/create`, (req, res) => controller.submitAddEmail(req, res))
  get(`${base}/email/update`, (req, res) => controller.updateEmail(req, res))
  post(`${base}/email/update`, (req, res) => controller.submitUpdateEmail(req, res))
  get(`${base}/email/delete`, (req, res) => controller.deleteEmail(req, res))
  post(`${base}/email/delete`, (req, res) => controller.submitDeleteEmail(req, res))

  return router
}
