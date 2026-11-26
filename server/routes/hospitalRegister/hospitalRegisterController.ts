/* eslint-disable no-param-reassign */
import { Request, Response } from 'express'
import createError from 'http-errors'
import config from '../../config'
import HMPPSAgencyRegisterApi, { Context } from '../../services/hmppsAgencyRegisterApi'
import AllHospitalsView from './allHospitalsView'
import HospitalDetailsView, { Action } from './hospitalDetailsView'
import ControllerHelper from '../utils/controllerHelper'
import { HospitalFilter, updateHospitalMapper } from './hospitalMapper'
import trimForm from '../../utils/trim'
import AddAgencyAddressView from '../agencyRegisters/addAddressView'
import UpdateAgencyAddressView from '../agencyRegisters/updateAddressView'
import AddAgencyPhoneView from '../agencyRegisters/addPhoneView'
import UpdateAgencyPhoneView from '../agencyRegisters/updatePhoneView'
import UpdateAgencyNameDescriptionView from '../agencyRegisters/updateNameDescriptionView'
import UpdateAgencyActiveView from '../agencyRegisters/updateActiveView'
import UpdateAgencyCjitCodeView from '../agencyRegisters/updateCjitCodeView'
import UpdateAgencyAreaView from '../agencyRegisters/updateAreaView'
import UpdateAgencyRegionView from '../agencyRegisters/updateRegionView'
import UpdateAgencyGeographicalAreaView from '../agencyRegisters/updateGeographicalAreaView'
import UpdateAgencyLocalAuthorityView from '../agencyRegisters/updateLocalAuthorityView'
import UpdateAgencyPayrollRegionView from '../agencyRegisters/updatePayrollRegionView'
import UpdateHighSecurityView from './updateHighSecurityView'
import { UpdateHospital } from '../../@types/prisonRegister'
import {
  validateAddAddress,
  validateAddPhoneNumber,
  validateUpdateActive,
  validateUpdateAddress,
  validateUpdateArea,
  validateUpdateCjitCode,
  validateUpdateGeographicalArea,
  validateUpdateHighSecurity,
  validateUpdateLocalAuthority,
  validateUpdateNameDescription,
  validateUpdatePayrollRegion,
  validateUpdatePhoneNumber,
  validateUpdateRegion,
} from './hospitalValidators'

const detailsLink = (hospitalId: string) => `/hospital-register/details?id=${hospitalId}`

function context(res: Response): Context {
  return {
    username: res?.locals?.user?.username,
  }
}

export default class HospitalRegisterController {
  constructor(private readonly hmppsAgencyRegisterApiService: HMPPSAgencyRegisterApi) {}

  async showAllHospitals(req: Request, res: Response): Promise<void> {
    const filter = this.parseFilter(req)

    req.session.allListPageLink = '/hospital-register'
    const hospitals = await this.hmppsAgencyRegisterApiService.getHospitals(context(res), filter)
    const view = new AllHospitalsView(hospitals, filter)
    res.render('pages/hospital-register/allHospitals', view.renderArgs)
  }

  async viewHospital(req: Request, res: Response): Promise<void> {
    const { id, action } = req.query as { id: string; action: Action }
    const hospital = await this.hmppsAgencyRegisterApiService.getHospital(context(res), id)
    const view = new HospitalDetailsView(hospital, (action || 'NONE') as Action)
    res.render('pages/hospital-register/hospitalDetails', view.renderArgs)
  }

  async deleteHospital(req: Request, res: Response): Promise<void> {
    if (!config.agencyRegistersDeleteEnabled) throw createError(404, 'Not found')
    const hospital = await this.hmppsAgencyRegisterApiService.getHospital(context(res), req.query.id as string)
    res.render('pages/components/edit/deleteAgency', {
      name: hospital.hospitalName,
      agencyId: hospital.hospitalId,
      agencyType: 'hospital',
      agencyRegistersDeleteEnabled: config.agencyRegistersDeleteEnabled,
      navigation: { cancelButton: detailsLink(hospital.hospitalId) },
    })
  }

  async submitDeleteHospital(req: Request, res: Response): Promise<void> {
    if (!config.agencyRegistersDeleteEnabled) throw createError(404, 'Not found')
    await this.hmppsAgencyRegisterApiService.deleteHospital(context(res), req.query.id as string)
    res.redirect('/hospital-register')
  }

  async addAddress(req: Request, res: Response): Promise<void> {
    const hospital = await this.hmppsAgencyRegisterApiService.getHospital(context(res), req.query.id as string)
    const errors = req.flash('errors')
    if (!errors?.length) delete req.session.addAddressForm
    const view = new AddAgencyAddressView(
      hospital.hospitalName,
      { cancelButton: detailsLink(hospital.hospitalId) },
      errors,
      req.session.addAddressForm,
    )
    res.render('pages/components/edit/addAgencyAddress', view.renderArgs)
  }

  async submitAddAddress(req: Request, res: Response): Promise<void> {
    req.session.addAddressForm = trimForm(req.body)
    res.redirect(
      await validateAddAddress(req.session.addAddressForm, req, async address => {
        const result = await this.hmppsAgencyRegisterApiService.addHospitalAddress(
          context(res),
          req.query.id as string,
          address,
        )
        if (result.success) delete req.session.addAddressForm
        return result
      }),
    )
  }

  async updateAddress(req: Request, res: Response): Promise<void> {
    const addressId = Number(req.query.addressId)
    const hospital = await this.hmppsAgencyRegisterApiService.getHospital(context(res), req.query.id as string)
    const address = hospital.addresses.find(item => item.id === addressId)
    if (!address) throw createError(404, 'Hospital address not found')
    const errors = req.flash('errors')
    if (!errors?.length || req.session.updateAddressForm?.addressId !== addressId) {
      delete req.session.updateAddressForm
    }
    const form = req.session.updateAddressForm ?? {
      addressId,
      addressline1: address.addressLine1 ?? '',
      addressline2: address.addressLine2 ?? '',
      addresstown: address.town ?? '',
      addresscounty: address.county ?? '',
      addresspostcode: address.postcode ?? '',
      addresscountry: address.country ?? '',
    }
    const view = new UpdateAgencyAddressView(
      hospital.hospitalName,
      { cancelButton: detailsLink(hospital.hospitalId) },
      form,
      errors,
    )
    res.render('pages/components/edit/updateAgencyAddress', view.renderArgs)
  }

  async submitUpdateAddress(req: Request, res: Response): Promise<void> {
    req.session.updateAddressForm = trimForm(req.body)
    req.session.updateAddressForm.addressId = Number(req.session.updateAddressForm.addressId)
    res.redirect(
      await validateUpdateAddress(req.session.updateAddressForm, req, async address => {
        const result = await this.hmppsAgencyRegisterApiService.updateHospitalAddress(
          context(res),
          req.query.id as string,
          req.session.updateAddressForm.addressId,
          address,
        )
        if (result.success) delete req.session.updateAddressForm
        return result
      }),
    )
  }

  async deleteAddress(req: Request, res: Response): Promise<void> {
    if (!config.agencyRegistersDeleteEnabled) throw createError(404, 'Not found')
    const addressId = Number(req.query.addressId)
    if (!Number.isSafeInteger(addressId) || addressId <= 0) throw createError(400, 'Invalid address ID')
    const hospital = await this.hmppsAgencyRegisterApiService.getHospital(context(res), req.query.id as string)
    const address = hospital.addresses.find(item => item.id === addressId)
    if (!address) throw createError(404, 'Hospital address not found')
    res.render('pages/components/edit/deleteAgencyAddress', {
      name: hospital.hospitalName,
      navigation: { cancelButton: detailsLink(hospital.hospitalId) },
      address,
    })
  }

  async submitDeleteAddress(req: Request, res: Response): Promise<void> {
    if (!config.agencyRegistersDeleteEnabled) throw createError(404, 'Not found')
    const addressId = Number(req.body.addressId)
    if (!Number.isSafeInteger(addressId) || addressId <= 0) throw createError(400, 'Invalid address ID')
    await this.hmppsAgencyRegisterApiService.deleteHospitalAddress(context(res), req.query.id as string, addressId)
    res.redirect(`${detailsLink(req.query.id as string)}&action=UPDATED`)
  }

  async addPhone(req: Request, res: Response): Promise<void> {
    const hospital = await this.hmppsAgencyRegisterApiService.getHospital(context(res), req.query.id as string)
    const errors = req.flash('errors')
    if (!errors?.length) delete req.session.addPhoneNumberForm
    const view = new AddAgencyPhoneView(
      hospital.hospitalName,
      { cancelButton: detailsLink(hospital.hospitalId) },
      errors,
      req.session.addPhoneNumberForm?.phoneNumber,
    )
    res.render('pages/components/edit/addAgencyPhone', view.renderArgs)
  }

  async submitAddPhone(req: Request, res: Response): Promise<void> {
    req.session.addPhoneNumberForm = trimForm(req.body)
    res.redirect(
      await validateAddPhoneNumber(req.session.addPhoneNumberForm, req, async phoneNumber => {
        const result = await this.hmppsAgencyRegisterApiService.addHospitalPhoneNumber(
          context(res),
          req.query.id as string,
          phoneNumber,
        )
        if (result.success) delete req.session.addPhoneNumberForm
        return result
      }),
    )
  }

  async updatePhone(req: Request, res: Response): Promise<void> {
    const phoneId = Number(req.query.phoneId)
    const hospital = await this.hmppsAgencyRegisterApiService.getHospital(context(res), req.query.id as string)
    const errors = req.flash('errors')
    if (!errors?.length) delete req.session.updatePhoneNumberForm
    const view = new UpdateAgencyPhoneView(
      hospital.hospitalName,
      { cancelButton: detailsLink(hospital.hospitalId) },
      errors,
      req.session.updatePhoneNumberForm?.phoneNumber ??
        hospital.phoneNumbers.find(phone => phone.id === phoneId)?.number,
      phoneId,
    )
    res.render('pages/components/edit/updateAgencyPhone', view.renderArgs)
  }

  async submitUpdatePhone(req: Request, res: Response): Promise<void> {
    req.session.updatePhoneNumberForm = trimForm(req.body)
    res.redirect(
      await validateUpdatePhoneNumber(req.session.updatePhoneNumberForm, req, async phoneNumber => {
        const result = await this.hmppsAgencyRegisterApiService.updateHospitalPhoneNumber(
          context(res),
          req.query.id as string,
          Number(req.session.updatePhoneNumberForm.phoneId),
          phoneNumber,
        )
        if (result.success) delete req.session.updatePhoneNumberForm
        return result
      }),
    )
  }

  async deletePhone(req: Request, res: Response): Promise<void> {
    const phoneId = Number(req.query.phoneId)
    const hospital = await this.hmppsAgencyRegisterApiService.getHospital(context(res), req.query.id as string)
    res.render('pages/components/edit/deleteAgencyPhone', {
      name: hospital.hospitalName,
      navigation: { cancelButton: detailsLink(hospital.hospitalId) },
      phoneNumber: hospital.phoneNumbers.find(phone => phone.id === phoneId)?.number,
      phoneId,
    })
  }

  async submitDeletePhone(req: Request, res: Response): Promise<void> {
    await this.hmppsAgencyRegisterApiService.deleteHospitalPhoneNumber(
      context(res),
      req.query.id as string,
      Number(req.body.phoneId),
    )
    res.redirect(`${detailsLink(req.query.id as string)}&action=UPDATED`)
  }

  async updateNameDescription(req: Request, res: Response): Promise<void> {
    const hospital = await this.hmppsAgencyRegisterApiService.getHospital(context(res), req.query.id as string)
    const errors = req.flash('errors')
    if (!errors?.length) delete req.session.updateNameDescriptionForm
    const view = new UpdateAgencyNameDescriptionView(
      hospital.hospitalName,
      { cancelButton: detailsLink(hospital.hospitalId) },
      errors,
      req.session.updateNameDescriptionForm ?? {
        name: hospital.hospitalName,
        description: hospital.description ?? '',
      },
    )
    res.render('pages/components/edit/updateAgencyNameDescription', view.renderArgs)
  }

  async submitUpdateNameDescription(req: Request, res: Response): Promise<void> {
    req.session.updateNameDescriptionForm = trimForm(req.body)
    const hospitalId = req.query.id as string
    res.redirect(
      await validateUpdateNameDescription(req.session.updateNameDescriptionForm, req, async ({ name, description }) => {
        const result = await this.saveHospital(res, hospitalId, update => {
          Object.assign(update, { hospitalName: name, description })
        })
        if (result.success) delete req.session.updateNameDescriptionForm
        return result
      }),
    )
  }

  async updateActive(req: Request, res: Response): Promise<void> {
    const hospital = await this.hmppsAgencyRegisterApiService.getHospital(context(res), req.query.id as string)
    const errors = req.flash('errors')
    if (!errors?.length) delete req.session.updateActiveForm
    const view = new UpdateAgencyActiveView(
      hospital.hospitalName,
      { cancelButton: detailsLink(hospital.hospitalId) },
      hospital.active,
      hospital.inactiveDate,
      errors,
      req.session.updateActiveForm,
    )
    res.render('pages/components/edit/updateAgencyActive', view.renderArgs)
  }

  async submitUpdateActive(req: Request, res: Response): Promise<void> {
    req.session.updateActiveForm = trimForm(req.body)
    const hospitalId = req.query.id as string
    res.redirect(
      await validateUpdateActive(req.session.updateActiveForm, req, async change => {
        const result = await this.saveHospital(res, hospitalId, update => {
          Object.assign(update, change)
          if (change.active) delete update.inactiveDate
        })
        if (result.success) delete req.session.updateActiveForm
        return result
      }),
    )
  }

  async updateHighSecurity(req: Request, res: Response): Promise<void> {
    const hospital = await this.hmppsAgencyRegisterApiService.getHospital(context(res), req.query.id as string)
    const errors = req.flash('errors')
    if (!errors?.length) delete req.session.updateHighSecurityForm
    const view = new UpdateHighSecurityView(
      hospital.hospitalName,
      { cancelButton: detailsLink(hospital.hospitalId) },
      errors,
      req.session.updateHighSecurityForm
        ? req.session.updateHighSecurityForm.highSecurity
        : String(hospital.highSecurity),
    )
    res.render('pages/hospital-register/updateHighSecurity', view.renderArgs)
  }

  async submitUpdateHighSecurity(req: Request, res: Response): Promise<void> {
    req.session.updateHighSecurityForm = trimForm(req.body)
    const hospitalId = req.query.id as string
    res.redirect(
      await validateUpdateHighSecurity(req.session.updateHighSecurityForm, req, async highSecurity => {
        const result = await this.saveHospital(res, hospitalId, update => {
          Object.assign(update, { highSecurity })
        })
        if (result.success) delete req.session.updateHighSecurityForm
        return result
      }),
    )
  }

  async updateCjitCode(req: Request, res: Response): Promise<void> {
    const hospital = await this.hmppsAgencyRegisterApiService.getHospital(context(res), req.query.id as string)
    const errors = req.flash('errors')
    if (!errors?.length) delete req.session.updateCjitCodeForm
    const view = new UpdateAgencyCjitCodeView(
      hospital.hospitalName,
      { cancelButton: detailsLink(hospital.hospitalId) },
      errors,
      req.session.updateCjitCodeForm ? req.session.updateCjitCodeForm.cjitCode : (hospital.cjitCode ?? ''),
    )
    res.render('pages/components/edit/updateAgencyCjitCode', view.renderArgs)
  }

  async submitUpdateCjitCode(req: Request, res: Response): Promise<void> {
    req.session.updateCjitCodeForm = trimForm(req.body)
    const hospitalId = req.query.id as string
    res.redirect(
      await validateUpdateCjitCode(req.session.updateCjitCodeForm, req, async cjitCode => {
        const result = await this.saveHospital(res, hospitalId, update => {
          Object.assign(update, { cjitCode })
        })
        if (result.success) delete req.session.updateCjitCodeForm
        return result
      }),
    )
  }

  async updateArea(req: Request, res: Response): Promise<void> {
    const hospital = await this.hmppsAgencyRegisterApiService.getHospital(context(res), req.query.id as string)
    const errors = req.flash('errors')
    if (!errors?.length) delete req.session.updateAreaForm
    const view = new UpdateAgencyAreaView(
      hospital.hospitalName,
      { cancelButton: detailsLink(hospital.hospitalId) },
      errors,
      req.session.updateAreaForm ?? {
        areaCode: hospital.area?.code ?? '',
        areaDescription: hospital.area?.description ?? '',
      },
    )
    res.render('pages/components/edit/updateAgencyArea', view.renderArgs)
  }

  async submitUpdateArea(req: Request, res: Response): Promise<void> {
    req.session.updateAreaForm = trimForm(req.body)
    const hospitalId = req.query.id as string
    res.redirect(
      await validateUpdateArea(
        req.session.updateAreaForm,
        req,
        () => this.hmppsAgencyRegisterApiService.getAreas(context(res)),
        async areaCode => {
          const result = await this.saveHospital(res, hospitalId, update => {
            update.areaCode = areaCode
          })
          if (result.success) delete req.session.updateAreaForm
          return result
        },
      ),
    )
  }

  async updateRegion(req: Request, res: Response): Promise<void> {
    const hospital = await this.hmppsAgencyRegisterApiService.getHospital(context(res), req.query.id as string)
    const errors = req.flash('errors')
    if (!errors?.length) delete req.session.updateRegionForm
    const view = new UpdateAgencyRegionView(
      hospital.hospitalName,
      { cancelButton: detailsLink(hospital.hospitalId) },
      errors,
      req.session.updateRegionForm ?? {
        regionCode: hospital.region?.code ?? '',
        regionDescription: hospital.region?.description ?? '',
      },
    )
    res.render('pages/components/edit/updateAgencyRegion', view.renderArgs)
  }

  async submitUpdateRegion(req: Request, res: Response): Promise<void> {
    req.session.updateRegionForm = trimForm(req.body)
    const hospitalId = req.query.id as string
    res.redirect(
      await validateUpdateRegion(
        req.session.updateRegionForm,
        req,
        () => this.hmppsAgencyRegisterApiService.getRegions(context(res)),
        async regionCode => {
          const result = await this.saveHospital(res, hospitalId, update => {
            update.regionCode = regionCode
          })
          if (result.success) delete req.session.updateRegionForm
          return result
        },
      ),
    )
  }

  async updateGeographicalArea(req: Request, res: Response): Promise<void> {
    const hospital = await this.hmppsAgencyRegisterApiService.getHospital(context(res), req.query.id as string)
    const errors = req.flash('errors')
    if (!errors?.length) delete req.session.updateGeographicalAreaForm
    const view = new UpdateAgencyGeographicalAreaView(
      hospital.hospitalName,
      { cancelButton: detailsLink(hospital.hospitalId) },
      errors,
      req.session.updateGeographicalAreaForm ?? {
        geographicalAreaCode: hospital.geographicalArea?.code ?? '',
        geographicalAreaDescription: hospital.geographicalArea?.description ?? '',
      },
    )
    res.render('pages/components/edit/updateAgencyGeographicalArea', view.renderArgs)
  }

  async submitUpdateGeographicalArea(req: Request, res: Response): Promise<void> {
    req.session.updateGeographicalAreaForm = trimForm(req.body)
    const hospitalId = req.query.id as string
    res.redirect(
      await validateUpdateGeographicalArea(
        req.session.updateGeographicalAreaForm,
        req,
        () => this.hmppsAgencyRegisterApiService.getAreas(context(res)),
        async geographicalAreaCode => {
          const result = await this.saveHospital(res, hospitalId, update => {
            update.geographicalAreaCode = geographicalAreaCode
          })
          if (result.success) delete req.session.updateGeographicalAreaForm
          return result
        },
      ),
    )
  }

  async updateLocalAuthority(req: Request, res: Response): Promise<void> {
    const hospital = await this.hmppsAgencyRegisterApiService.getHospital(context(res), req.query.id as string)
    const errors = req.flash('errors')
    if (!errors?.length) delete req.session.updateLocalAuthorityForm
    const view = new UpdateAgencyLocalAuthorityView(
      hospital.hospitalName,
      { cancelButton: detailsLink(hospital.hospitalId) },
      errors,
      req.session.updateLocalAuthorityForm ?? {
        localAuthorityCode: hospital.localAuthority?.code ?? '',
        localAuthorityDescription: hospital.localAuthority?.description ?? '',
      },
    )
    res.render('pages/components/edit/updateAgencyLocalAuthority', view.renderArgs)
  }

  async submitUpdateLocalAuthority(req: Request, res: Response): Promise<void> {
    req.session.updateLocalAuthorityForm = trimForm(req.body)
    const hospitalId = req.query.id as string
    res.redirect(
      await validateUpdateLocalAuthority(
        req.session.updateLocalAuthorityForm,
        req,
        () => this.hmppsAgencyRegisterApiService.getLocalAuthorities(context(res)),
        async localAuthorityCode => {
          const result = await this.saveHospital(res, hospitalId, update => {
            update.localAuthorityCode = localAuthorityCode
          })
          if (result.success) delete req.session.updateLocalAuthorityForm
          return result
        },
      ),
    )
  }

  async updatePayrollRegion(req: Request, res: Response): Promise<void> {
    const hospital = await this.hmppsAgencyRegisterApiService.getHospital(context(res), req.query.id as string)
    const errors = req.flash('errors')
    if (!errors?.length) delete req.session.updatePayrollRegionForm
    const view = new UpdateAgencyPayrollRegionView(
      hospital.hospitalName,
      { cancelButton: detailsLink(hospital.hospitalId) },
      errors,
      req.session.updatePayrollRegionForm ?? {
        payrollRegionCode: hospital.payrollRegion?.code ?? '',
        payrollRegionDescription: hospital.payrollRegion?.description ?? '',
      },
    )
    res.render('pages/components/edit/updateAgencyPayrollRegion', view.renderArgs)
  }

  async submitUpdatePayrollRegion(req: Request, res: Response): Promise<void> {
    req.session.updatePayrollRegionForm = trimForm(req.body)
    const hospitalId = req.query.id as string
    res.redirect(
      await validateUpdatePayrollRegion(
        req.session.updatePayrollRegionForm,
        req,
        () => this.hmppsAgencyRegisterApiService.getPayrollRegions(context(res)),
        async payrollRegionCode => {
          const result = await this.saveHospital(res, hospitalId, update => {
            update.payrollRegionCode = payrollRegionCode
          })
          if (result.success) delete req.session.updatePayrollRegionForm
          return result
        },
      ),
    )
  }

  // Reads the latest hospital so that a single field change never overwrites other fields with stale values.
  private async saveHospital(res: Response, hospitalId: string, change: (update: UpdateHospital) => void) {
    const hospital = await this.hmppsAgencyRegisterApiService.getHospital(context(res), hospitalId)
    const update = updateHospitalMapper(hospital)
    change(update)
    return this.hmppsAgencyRegisterApiService.updateHospitalDetails(context(res), hospitalId, update)
  }

  parseFilter(req: Request): HospitalFilter {
    const filter: HospitalFilter = {
      active: ControllerHelper.parseBooleanFromQuery(req.query.active as string),
      textSearch: req.query.textSearch as string | undefined,
      highSecurity: ControllerHelper.parseBooleanFromQuery(req.query.highSecurity as string),
    }
    return ControllerHelper.removeEmptyValues(filter)
  }
}
