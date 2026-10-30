import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import HospitalRegisterController from './hospitalRegisterController'
import HMPPSAgencyRegisterApi from '../../services/hmppsAgencyRegisterApi'

// include this here otherwise TS complains about cyclical dependencies
export interface Services {
  hmppsAgencyRegisterApiService: HMPPSAgencyRegisterApi
}

export default function routes(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const controller = new HospitalRegisterController(services.hmppsAgencyRegisterApiService)

  get('/hospital-register', (req, res) => controller.showAllHospitals(req, res))
  get('/hospital-register/details', (req, res) => controller.viewHospital(req, res))
  get('/hospital-register/delete', (req, res) => controller.deleteHospital(req, res))
  post('/hospital-register/delete', (req, res) => controller.submitDeleteHospital(req, res))
  get('/hospital-register/name-description/update', (req, res) => controller.updateNameDescription(req, res))
  post('/hospital-register/name-description/update', (req, res) => controller.submitUpdateNameDescription(req, res))
  get('/hospital-register/active/update', (req, res) => controller.updateActive(req, res))
  post('/hospital-register/active/update', (req, res) => controller.submitUpdateActive(req, res))
  get('/hospital-register/high-security/update', (req, res) => controller.updateHighSecurity(req, res))
  post('/hospital-register/high-security/update', (req, res) => controller.submitUpdateHighSecurity(req, res))
  get('/hospital-register/cjit-code/update', (req, res) => controller.updateCjitCode(req, res))
  post('/hospital-register/cjit-code/update', (req, res) => controller.submitUpdateCjitCode(req, res))
  get('/hospital-register/area/update', (req, res) => controller.updateArea(req, res))
  post('/hospital-register/area/update', (req, res) => controller.submitUpdateArea(req, res))
  get('/hospital-register/region/update', (req, res) => controller.updateRegion(req, res))
  post('/hospital-register/region/update', (req, res) => controller.submitUpdateRegion(req, res))
  get('/hospital-register/geographical-area/update', (req, res) => controller.updateGeographicalArea(req, res))
  post('/hospital-register/geographical-area/update', (req, res) => controller.submitUpdateGeographicalArea(req, res))
  get('/hospital-register/local-authority/update', (req, res) => controller.updateLocalAuthority(req, res))
  post('/hospital-register/local-authority/update', (req, res) => controller.submitUpdateLocalAuthority(req, res))
  get('/hospital-register/payroll-region/update', (req, res) => controller.updatePayrollRegion(req, res))
  post('/hospital-register/payroll-region/update', (req, res) => controller.submitUpdatePayrollRegion(req, res))
  get('/hospital-register/address/create', (req, res) => controller.addAddress(req, res))
  post('/hospital-register/address/create', (req, res) => controller.submitAddAddress(req, res))
  get('/hospital-register/address/update', (req, res) => controller.updateAddress(req, res))
  post('/hospital-register/address/update', (req, res) => controller.submitUpdateAddress(req, res))
  get('/hospital-register/address/delete', (req, res) => controller.deleteAddress(req, res))
  post('/hospital-register/address/delete', (req, res) => controller.submitDeleteAddress(req, res))
  get('/hospital-register/phone/create', (req, res) => controller.addPhone(req, res))
  post('/hospital-register/phone/create', (req, res) => controller.submitAddPhone(req, res))
  get('/hospital-register/phone/update', (req, res) => controller.updatePhone(req, res))
  post('/hospital-register/phone/update', (req, res) => controller.submitUpdatePhone(req, res))
  get('/hospital-register/phone/delete', (req, res) => controller.deletePhone(req, res))
  post('/hospital-register/phone/delete', (req, res) => controller.submitDeletePhone(req, res))

  return router
}
