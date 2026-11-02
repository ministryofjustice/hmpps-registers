/* eslint-disable no-param-reassign */
import { Request, Response } from 'express'
import createError from 'http-errors'
import config from '../../config'
import HMPPSAgencyRegisterApi, { Context } from '../../services/hmppsAgencyRegisterApi'
import AllOtherAgenciesView from './allOtherAgenciesView'
import OtherAgencyDetailsView, { Action } from './otherAgencyDetailsView'
import ControllerHelper from '../utils/controllerHelper'
import { OtherAgencyFilter, updateOtherAgencyMapper } from './otherAgencyMapper'
import trimForm from '../../utils/trim'
import AddAgencyAddressView from '../agencyRegisters/addAddressView'
import UpdateAgencyAddressView from '../agencyRegisters/updateAddressView'
import AddAgencyPhoneView from '../agencyRegisters/addPhoneView'
import UpdateAgencyPhoneView from '../agencyRegisters/updatePhoneView'
import AddAgencyEmailView from '../agencyRegisters/addEmailView'
import UpdateAgencyEmailView from '../agencyRegisters/updateEmailView'
import UpdateAgencyNameDescriptionView from '../agencyRegisters/updateNameDescriptionView'
import UpdateAgencyActiveView from '../agencyRegisters/updateActiveView'
import UpdateAgencyCjitCodeView from '../agencyRegisters/updateCjitCodeView'
import UpdateAgencyAreaView from '../agencyRegisters/updateAreaView'
import UpdateAgencyRegionView from '../agencyRegisters/updateRegionView'
import UpdateAgencyGeographicalAreaView from '../agencyRegisters/updateGeographicalAreaView'
import UpdateAgencyLocalAuthorityView from '../agencyRegisters/updateLocalAuthorityView'
import UpdateAgencyPayrollRegionView from '../agencyRegisters/updatePayrollRegionView'
import UpdateAgencyTypeView from './updateAgencyTypeView'
import UpdateAccessibleAccessView from '../courtRegister/updateAccessibleAccessView'
import { UpdateOtherAgency } from '../../@types/prisonRegister'
import {
  validateAddAddress,
  validateAddEmailAddress,
  validateAddPhoneNumber,
  validateUpdateActive,
  validateUpdateAddress,
  validateUpdateAccessibleAccess,
  validateUpdateArea,
  validateUpdateCjitCode,
  validateUpdateAgencyType,
  validateUpdateEmailAddress,
  validateUpdateGeographicalArea,
  validateUpdateLocalAuthority,
  validateUpdateNameDescription,
  validateUpdatePayrollRegion,
  validateUpdatePhoneNumber,
  validateUpdateRegion,
} from './otherAgencyValidators'

const detailsLink = (agencyId: string) => `/other-agency-register/details?id=${agencyId}`

function context(res: Response): Context {
  return {
    username: res?.locals?.user?.username,
  }
}

export default class OtherAgencyRegisterController {
  constructor(private readonly hmppsAgencyRegisterApiService: HMPPSAgencyRegisterApi) {}

  async showAllOtherAgencies(req: Request, res: Response): Promise<void> {
    const filter = this.parseFilter(req)

    req.session.allListPageLink = '/other-agency-register'
    const otherAgencies = await this.hmppsAgencyRegisterApiService.getOtherAgencies(context(res), filter)
    const view = new AllOtherAgenciesView(otherAgencies, filter)
    res.render('pages/other-agency-register/allOtherAgencies', view.renderArgs)
  }

  async viewOtherAgency(req: Request, res: Response): Promise<void> {
    const { id, action } = req.query as { id: string; action: Action }
    const otherAgency = await this.hmppsAgencyRegisterApiService.getOtherAgency(context(res), id)
    const view = new OtherAgencyDetailsView(otherAgency, (action || 'NONE') as Action)
    res.render('pages/other-agency-register/otherAgencyDetails', view.renderArgs)
  }

  async addAddress(req: Request, res: Response): Promise<void> {
    const office = await this.getOffice(req, res)
    const errors = req.flash('errors')
    if (!errors?.length) delete req.session.addAddressForm
    const view = new AddAgencyAddressView(
      office.agencyName,
      { cancelButton: detailsLink(office.agencyId) },
      errors,
      req.session.addAddressForm,
    )
    res.render('pages/components/edit/addAgencyAddress', view.renderArgs)
  }

  async submitAddAddress(req: Request, res: Response): Promise<void> {
    req.session.addAddressForm = trimForm(req.body)
    res.redirect(
      await validateAddAddress(req.session.addAddressForm, req, async address => {
        const result = await this.hmppsAgencyRegisterApiService.addOtherAgencyAddress(
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
    const office = await this.getOffice(req, res)
    const address = office.addresses.find(item => item.id === addressId)
    if (!address) throw createError(404, 'Other agency address not found')
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
      office.agencyName,
      { cancelButton: detailsLink(office.agencyId) },
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
        const result = await this.hmppsAgencyRegisterApiService.updateOtherAgencyAddress(
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

  async addPhone(req: Request, res: Response): Promise<void> {
    const office = await this.getOffice(req, res)
    const errors = req.flash('errors')
    if (!errors?.length) delete req.session.addPhoneNumberForm
    const view = new AddAgencyPhoneView(
      office.agencyName,
      { cancelButton: detailsLink(office.agencyId) },
      errors,
      req.session.addPhoneNumberForm?.phoneNumber,
    )
    res.render('pages/components/edit/addAgencyPhone', view.renderArgs)
  }

  async submitAddPhone(req: Request, res: Response): Promise<void> {
    req.session.addPhoneNumberForm = trimForm(req.body)
    res.redirect(
      await validateAddPhoneNumber(req.session.addPhoneNumberForm, req, async phoneNumber => {
        const result = await this.hmppsAgencyRegisterApiService.addOtherAgencyPhoneNumber(
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
    const office = await this.getOffice(req, res)
    const errors = req.flash('errors')
    if (!errors?.length) delete req.session.updatePhoneNumberForm
    const view = new UpdateAgencyPhoneView(
      office.agencyName,
      { cancelButton: detailsLink(office.agencyId) },
      errors,
      req.session.updatePhoneNumberForm?.phoneNumber ?? office.phoneNumbers.find(phone => phone.id === phoneId)?.number,
      phoneId,
    )
    res.render('pages/components/edit/updateAgencyPhone', view.renderArgs)
  }

  async submitUpdatePhone(req: Request, res: Response): Promise<void> {
    req.session.updatePhoneNumberForm = trimForm(req.body)
    res.redirect(
      await validateUpdatePhoneNumber(req.session.updatePhoneNumberForm, req, async phoneNumber => {
        const result = await this.hmppsAgencyRegisterApiService.updateOtherAgencyPhoneNumber(
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

  async addEmail(req: Request, res: Response): Promise<void> {
    const office = await this.getOffice(req, res)
    const errors = req.flash('errors')
    if (!errors?.length) delete req.session.addEmailAddressForm
    const view = new AddAgencyEmailView(
      office.agencyName,
      { cancelButton: detailsLink(office.agencyId) },
      errors,
      req.session.addEmailAddressForm?.emailAddress,
    )
    res.render('pages/components/edit/addAgencyEmail', view.renderArgs)
  }

  async submitAddEmail(req: Request, res: Response): Promise<void> {
    req.session.addEmailAddressForm = trimForm(req.body)
    res.redirect(
      await validateAddEmailAddress(req.session.addEmailAddressForm, req, async emailAddress => {
        const result = await this.hmppsAgencyRegisterApiService.addOtherAgencyEmailAddress(
          context(res),
          req.query.id as string,
          emailAddress,
        )
        if (result.success) delete req.session.addEmailAddressForm
        return result
      }),
    )
  }

  async updateEmail(req: Request, res: Response): Promise<void> {
    const emailId = Number(req.query.emailId)
    const office = await this.getOffice(req, res)
    const errors = req.flash('errors')
    if (!errors?.length) delete req.session.updateEmailAddressForm
    const view = new UpdateAgencyEmailView(
      office.agencyName,
      { cancelButton: detailsLink(office.agencyId) },
      errors,
      req.session.updateEmailAddressForm?.emailAddress ??
        office.emailAddresses.find(email => email.id === emailId)?.address,
      emailId,
    )
    res.render('pages/components/edit/updateAgencyEmail', view.renderArgs)
  }

  async submitUpdateEmail(req: Request, res: Response): Promise<void> {
    req.session.updateEmailAddressForm = trimForm(req.body)
    res.redirect(
      await validateUpdateEmailAddress(req.session.updateEmailAddressForm, req, async emailAddress => {
        const result = await this.hmppsAgencyRegisterApiService.updateOtherAgencyEmailAddress(
          context(res),
          req.query.id as string,
          Number(req.session.updateEmailAddressForm.emailId),
          emailAddress,
        )
        if (result.success) delete req.session.updateEmailAddressForm
        return result
      }),
    )
  }

  async updateNameDescription(req: Request, res: Response): Promise<void> {
    const office = await this.getOffice(req, res)
    const errors = req.flash('errors')
    if (!errors?.length) delete req.session.updateNameDescriptionForm
    const view = new UpdateAgencyNameDescriptionView(
      office.agencyName,
      { cancelButton: detailsLink(office.agencyId) },
      errors,
      req.session.updateNameDescriptionForm ?? {
        name: office.agencyName,
        description: office.description ?? '',
      },
    )
    res.render('pages/components/edit/updateAgencyNameDescription', view.renderArgs)
  }

  async submitUpdateNameDescription(req: Request, res: Response): Promise<void> {
    req.session.updateNameDescriptionForm = trimForm(req.body)
    const id = req.query.id as string
    res.redirect(
      await validateUpdateNameDescription(req.session.updateNameDescriptionForm, req, async ({ name, description }) => {
        const result = await this.saveOffice(res, id, update => {
          Object.assign(update, { agencyName: name, description })
        })
        if (result.success) delete req.session.updateNameDescriptionForm
        return result
      }),
    )
  }

  async updateActive(req: Request, res: Response): Promise<void> {
    const office = await this.getOffice(req, res)
    const errors = req.flash('errors')
    if (!errors?.length) delete req.session.updateActiveForm
    const view = new UpdateAgencyActiveView(
      office.agencyName,
      { cancelButton: detailsLink(office.agencyId) },
      office.active,
      office.inactiveDate,
      errors,
      req.session.updateActiveForm,
    )
    res.render('pages/components/edit/updateAgencyActive', view.renderArgs)
  }

  async submitUpdateActive(req: Request, res: Response): Promise<void> {
    req.session.updateActiveForm = trimForm(req.body)
    const id = req.query.id as string
    res.redirect(
      await validateUpdateActive(req.session.updateActiveForm, req, async change => {
        const result = await this.saveOffice(res, id, update => {
          Object.assign(update, change)
          if (change.active) delete update.inactiveDate
        })
        if (result.success) delete req.session.updateActiveForm
        return result
      }),
    )
  }

  async updateAgencyType(req: Request, res: Response): Promise<void> {
    const office = await this.getOffice(req, res)
    const errors = req.flash('errors')
    if (!errors?.length) delete req.session.updateAgencyTypeForm
    const view = new UpdateAgencyTypeView(
      office.agencyName,
      { cancelButton: detailsLink(office.agencyId) },
      errors,
      req.session.updateAgencyTypeForm ? req.session.updateAgencyTypeForm.agencyType : office.agencyType,
    )
    res.render('pages/other-agency-register/updateAgencyType', view.renderArgs)
  }

  async submitUpdateAgencyType(req: Request, res: Response): Promise<void> {
    req.session.updateAgencyTypeForm = trimForm(req.body)
    const id = req.query.id as string
    res.redirect(
      await validateUpdateAgencyType(req.session.updateAgencyTypeForm, req, async otherAgencyType => {
        const result = await this.saveOffice(res, id, update => {
          update.otherAgencyType = otherAgencyType
        })
        if (result.success) delete req.session.updateAgencyTypeForm
        return result
      }),
    )
  }

  async updateAccessibleAccess(req: Request, res: Response): Promise<void> {
    const office = await this.getOffice(req, res)
    const errors = req.flash('errors')
    if (!errors?.length) delete req.session.updateAccessibleAccessForm
    const view = new UpdateAccessibleAccessView(
      office.agencyName,
      { cancelButton: detailsLink(office.agencyId) },
      errors,
      req.session.updateAccessibleAccessForm
        ? req.session.updateAccessibleAccessForm.accessibleAccess
        : (office.accessibleAccess ?? 'UNKNOWN'),
    )
    res.render('pages/components/edit/updateAgencyAccessibleAccess', view.renderArgs)
  }

  async submitUpdateAccessibleAccess(req: Request, res: Response): Promise<void> {
    req.session.updateAccessibleAccessForm = trimForm(req.body)
    const id = req.query.id as string
    res.redirect(
      await validateUpdateAccessibleAccess(req.session.updateAccessibleAccessForm, req, async accessibleAccess => {
        const result = await this.saveOffice(res, id, update => {
          if (accessibleAccess === undefined) {
            delete update.accessibleAccess
          } else {
            update.accessibleAccess = accessibleAccess
          }
        })
        if (result.success) delete req.session.updateAccessibleAccessForm
        return result
      }),
    )
  }

  async updateCjitCode(req: Request, res: Response): Promise<void> {
    const office = await this.getOffice(req, res)
    const errors = req.flash('errors')
    if (!errors?.length) delete req.session.updateCjitCodeForm
    const view = new UpdateAgencyCjitCodeView(
      office.agencyName,
      { cancelButton: detailsLink(office.agencyId) },
      errors,
      req.session.updateCjitCodeForm ? req.session.updateCjitCodeForm.cjitCode : (office.cjitCode ?? ''),
    )
    res.render('pages/components/edit/updateAgencyCjitCode', view.renderArgs)
  }

  async submitUpdateCjitCode(req: Request, res: Response): Promise<void> {
    req.session.updateCjitCodeForm = trimForm(req.body)
    const id = req.query.id as string
    res.redirect(
      await validateUpdateCjitCode(req.session.updateCjitCodeForm, req, async cjitCode => {
        const result = await this.saveOffice(res, id, update => {
          Object.assign(update, { cjitCode })
        })
        if (result.success) delete req.session.updateCjitCodeForm
        return result
      }),
    )
  }

  async updateArea(req: Request, res: Response): Promise<void> {
    const office = await this.getOffice(req, res)
    const errors = req.flash('errors')
    if (!errors?.length) delete req.session.updateAreaForm
    const view = new UpdateAgencyAreaView(
      office.agencyName,
      { cancelButton: detailsLink(office.agencyId) },
      errors,
      req.session.updateAreaForm ?? {
        areaCode: office.area?.code ?? '',
        areaDescription: office.area?.description ?? '',
      },
    )
    res.render('pages/components/edit/updateAgencyArea', view.renderArgs)
  }

  async submitUpdateArea(req: Request, res: Response): Promise<void> {
    req.session.updateAreaForm = trimForm(req.body)
    const id = req.query.id as string
    res.redirect(
      await validateUpdateArea(
        req.session.updateAreaForm,
        req,
        () => this.hmppsAgencyRegisterApiService.getAreas(context(res)),
        async areaCode => {
          const result = await this.saveOffice(res, id, update => {
            update.areaCode = areaCode
          })
          if (result.success) delete req.session.updateAreaForm
          return result
        },
      ),
    )
  }

  async updateRegion(req: Request, res: Response): Promise<void> {
    const office = await this.getOffice(req, res)
    const errors = req.flash('errors')
    if (!errors?.length) delete req.session.updateRegionForm
    const view = new UpdateAgencyRegionView(
      office.agencyName,
      { cancelButton: detailsLink(office.agencyId) },
      errors,
      req.session.updateRegionForm ?? {
        regionCode: office.region?.code ?? '',
        regionDescription: office.region?.description ?? '',
      },
    )
    res.render('pages/components/edit/updateAgencyRegion', view.renderArgs)
  }

  async submitUpdateRegion(req: Request, res: Response): Promise<void> {
    req.session.updateRegionForm = trimForm(req.body)
    const id = req.query.id as string
    res.redirect(
      await validateUpdateRegion(
        req.session.updateRegionForm,
        req,
        () => this.hmppsAgencyRegisterApiService.getRegions(context(res)),
        async regionCode => {
          const result = await this.saveOffice(res, id, update => {
            update.regionCode = regionCode
          })
          if (result.success) delete req.session.updateRegionForm
          return result
        },
      ),
    )
  }

  async updateGeographicalArea(req: Request, res: Response): Promise<void> {
    const office = await this.getOffice(req, res)
    const errors = req.flash('errors')
    if (!errors?.length) delete req.session.updateGeographicalAreaForm
    const view = new UpdateAgencyGeographicalAreaView(
      office.agencyName,
      { cancelButton: detailsLink(office.agencyId) },
      errors,
      req.session.updateGeographicalAreaForm ?? {
        geographicalAreaCode: office.geographicalArea?.code ?? '',
        geographicalAreaDescription: office.geographicalArea?.description ?? '',
      },
    )
    res.render('pages/components/edit/updateAgencyGeographicalArea', view.renderArgs)
  }

  async submitUpdateGeographicalArea(req: Request, res: Response): Promise<void> {
    req.session.updateGeographicalAreaForm = trimForm(req.body)
    const id = req.query.id as string
    res.redirect(
      await validateUpdateGeographicalArea(
        req.session.updateGeographicalAreaForm,
        req,
        () => this.hmppsAgencyRegisterApiService.getAreas(context(res)),
        async geographicalAreaCode => {
          const result = await this.saveOffice(res, id, update => {
            update.geographicalAreaCode = geographicalAreaCode
          })
          if (result.success) delete req.session.updateGeographicalAreaForm
          return result
        },
      ),
    )
  }

  async updateLocalAuthority(req: Request, res: Response): Promise<void> {
    const office = await this.getOffice(req, res)
    const errors = req.flash('errors')
    if (!errors?.length) delete req.session.updateLocalAuthorityForm
    const view = new UpdateAgencyLocalAuthorityView(
      office.agencyName,
      { cancelButton: detailsLink(office.agencyId) },
      errors,
      req.session.updateLocalAuthorityForm ?? {
        localAuthorityCode: office.localAuthority?.code ?? '',
        localAuthorityDescription: office.localAuthority?.description ?? '',
      },
    )
    res.render('pages/components/edit/updateAgencyLocalAuthority', view.renderArgs)
  }

  async submitUpdateLocalAuthority(req: Request, res: Response): Promise<void> {
    req.session.updateLocalAuthorityForm = trimForm(req.body)
    const id = req.query.id as string
    res.redirect(
      await validateUpdateLocalAuthority(
        req.session.updateLocalAuthorityForm,
        req,
        () => this.hmppsAgencyRegisterApiService.getLocalAuthorities(context(res)),
        async localAuthorityCode => {
          const result = await this.saveOffice(res, id, update => {
            update.localAuthorityCode = localAuthorityCode
          })
          if (result.success) delete req.session.updateLocalAuthorityForm
          return result
        },
      ),
    )
  }

  async updatePayrollRegion(req: Request, res: Response): Promise<void> {
    const office = await this.getOffice(req, res)
    const errors = req.flash('errors')
    if (!errors?.length) delete req.session.updatePayrollRegionForm
    const view = new UpdateAgencyPayrollRegionView(
      office.agencyName,
      { cancelButton: detailsLink(office.agencyId) },
      errors,
      req.session.updatePayrollRegionForm ?? {
        payrollRegionCode: office.payrollRegion?.code ?? '',
        payrollRegionDescription: office.payrollRegion?.description ?? '',
      },
    )
    res.render('pages/components/edit/updateAgencyPayrollRegion', view.renderArgs)
  }

  async submitUpdatePayrollRegion(req: Request, res: Response): Promise<void> {
    req.session.updatePayrollRegionForm = trimForm(req.body)
    const id = req.query.id as string
    res.redirect(
      await validateUpdatePayrollRegion(
        req.session.updatePayrollRegionForm,
        req,
        () => this.hmppsAgencyRegisterApiService.getPayrollRegions(context(res)),
        async payrollRegionCode => {
          const result = await this.saveOffice(res, id, update => {
            update.payrollRegionCode = payrollRegionCode
          })
          if (result.success) delete req.session.updatePayrollRegionForm
          return result
        },
      ),
    )
  }

  async deleteOtherAgency(req: Request, res: Response): Promise<void> {
    if (!config.agencyRegistersDeleteEnabled) throw createError(404, 'Not found')
    const otherAgency = await this.getOffice(req, res)
    res.render('pages/components/edit/deleteAgency', {
      name: otherAgency.agencyName,
      agencyId: otherAgency.agencyId,
      agencyType: 'other agency',
      agencyRegistersDeleteEnabled: config.agencyRegistersDeleteEnabled,
      navigation: { cancelButton: detailsLink(otherAgency.agencyId) },
    })
  }

  async submitDeleteOtherAgency(req: Request, res: Response): Promise<void> {
    if (!config.agencyRegistersDeleteEnabled) throw createError(404, 'Not found')
    await this.hmppsAgencyRegisterApiService.deleteOtherAgency(context(res), req.query.id as string)
    res.redirect('/other-agency-register')
  }

  private getOffice(req: Request, res: Response) {
    return this.hmppsAgencyRegisterApiService.getOtherAgency(context(res), req.query.id as string)
  }

  // Reads the latest office so that a single field change never overwrites other fields with stale values.
  private async saveOffice(res: Response, id: string, change: (update: UpdateOtherAgency) => void) {
    const office = await this.hmppsAgencyRegisterApiService.getOtherAgency(context(res), id)
    const update = updateOtherAgencyMapper(office)
    change(update)
    return this.hmppsAgencyRegisterApiService.updateOtherAgencyDetails(context(res), id, update)
  }

  parseFilter(req: Request): OtherAgencyFilter {
    const filter: OtherAgencyFilter = {
      active: ControllerHelper.parseBooleanFromQuery(req.query.active as string),
      textSearch: req.query.textSearch as string | undefined,
      otherAgencyTypeCodes: ControllerHelper.parseStringArrayFromQuery(req.query.otherAgencyTypeCodes as string[]),
    }
    return ControllerHelper.removeEmptyValues(filter)
  }
}
