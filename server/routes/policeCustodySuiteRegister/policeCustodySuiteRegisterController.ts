/* eslint-disable no-param-reassign */
import { Request, Response } from 'express'
import createError from 'http-errors'
import config from '../../config'
import HMPPSAgencyRegisterApi, { Context } from '../../services/hmppsAgencyRegisterApi'
import AllPoliceCustodySuitesView from './allPoliceCustodySuitesView'
import PoliceCustodySuiteDetailsView, { Action } from './policeCustodySuiteDetailsView'
import ControllerHelper from '../utils/controllerHelper'
import { PoliceCustodySuiteFilter, updatePoliceCustodySuiteMapper } from './policeCustodySuiteMapper'
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
import { UpdatePoliceCustodySuite } from '../../@types/prisonRegister'
import {
  validateAddAddress,
  validateAddEmailAddress,
  validateAddPhoneNumber,
  validateUpdateActive,
  validateUpdateAddress,
  validateUpdateArea,
  validateUpdateCjitCode,
  validateUpdateEmailAddress,
  validateUpdateGeographicalArea,
  validateUpdateLocalAuthority,
  validateUpdateNameDescription,
  validateUpdatePayrollRegion,
  validateUpdatePhoneNumber,
  validateUpdateRegion,
} from './policeCustodySuiteValidators'

const detailsLink = (policeCustodySuiteId: string) =>
  `/police-custody-suite-register/details?id=${policeCustodySuiteId}`

function context(res: Response): Context {
  return {
    username: res?.locals?.user?.username,
  }
}

export default class PoliceCustodySuiteRegisterController {
  constructor(private readonly hmppsAgencyRegisterApiService: HMPPSAgencyRegisterApi) {}

  async showAllPoliceCustodySuites(req: Request, res: Response): Promise<void> {
    const filter = this.parseFilter(req)

    req.session.allListPageLink = '/police-custody-suite-register'
    const policeCustodySuites = await this.hmppsAgencyRegisterApiService.getPoliceCustodySuites(context(res), filter)
    const view = new AllPoliceCustodySuitesView(policeCustodySuites, filter)
    res.render('pages/police-custody-suite-register/allPoliceCustodySuites', view.renderArgs)
  }

  async viewPoliceCustodySuite(req: Request, res: Response): Promise<void> {
    const { id, action } = req.query as { id: string; action: Action }
    const policeCustodySuite = await this.hmppsAgencyRegisterApiService.getPoliceCustodySuite(context(res), id)
    const view = new PoliceCustodySuiteDetailsView(policeCustodySuite, (action || 'NONE') as Action)
    res.render('pages/police-custody-suite-register/policeCustodySuiteDetails', view.renderArgs)
  }

  async deletePoliceCustodySuite(req: Request, res: Response): Promise<void> {
    if (!config.agencyRegistersDeleteEnabled) throw createError(404, 'Not found')
    const policeCustodySuite = await this.hmppsAgencyRegisterApiService.getPoliceCustodySuite(
      context(res),
      req.query.id as string,
    )
    res.render('pages/components/edit/deleteAgency', {
      name: policeCustodySuite.policeCustodySuiteName,
      agencyId: policeCustodySuite.policeCustodySuiteId,
      agencyType: 'police custody suite',
      agencyRegistersDeleteEnabled: config.agencyRegistersDeleteEnabled,
      navigation: { cancelButton: detailsLink(policeCustodySuite.policeCustodySuiteId) },
    })
  }

  async submitDeletePoliceCustodySuite(req: Request, res: Response): Promise<void> {
    if (!config.agencyRegistersDeleteEnabled) throw createError(404, 'Not found')
    await this.hmppsAgencyRegisterApiService.deletePoliceCustodySuite(context(res), req.query.id as string)
    res.redirect('/police-custody-suite-register')
  }

  async addAddress(req: Request, res: Response): Promise<void> {
    const suite = await this.getSuite(req, res)
    const errors = req.flash('errors')
    if (!errors?.length) delete req.session.addAddressForm
    const view = new AddAgencyAddressView(
      suite.policeCustodySuiteName,
      { cancelButton: detailsLink(suite.policeCustodySuiteId) },
      errors,
      req.session.addAddressForm,
    )
    res.render('pages/components/edit/addAgencyAddress', view.renderArgs)
  }

  async submitAddAddress(req: Request, res: Response): Promise<void> {
    req.session.addAddressForm = trimForm(req.body)
    res.redirect(
      await validateAddAddress(req.session.addAddressForm, req, async address => {
        const result = await this.hmppsAgencyRegisterApiService.addPoliceCustodySuiteAddress(
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
    const suite = await this.getSuite(req, res)
    const address = suite.addresses.find(item => item.id === addressId)
    if (!address) throw createError(404, 'Police custody suite address not found')
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
      suite.policeCustodySuiteName,
      { cancelButton: detailsLink(suite.policeCustodySuiteId) },
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
        const result = await this.hmppsAgencyRegisterApiService.updatePoliceCustodySuiteAddress(
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
    const suite = await this.getSuite(req, res)
    const address = suite.addresses.find(item => item.id === addressId)
    if (!address) throw createError(404, 'Police custody suite address not found')
    res.render('pages/components/edit/deleteAgencyAddress', {
      name: suite.policeCustodySuiteName,
      navigation: { cancelButton: detailsLink(suite.policeCustodySuiteId) },
      address,
    })
  }

  async submitDeleteAddress(req: Request, res: Response): Promise<void> {
    if (!config.agencyRegistersDeleteEnabled) throw createError(404, 'Not found')
    const addressId = Number(req.body.addressId)
    if (!Number.isSafeInteger(addressId) || addressId <= 0) throw createError(400, 'Invalid address ID')
    await this.hmppsAgencyRegisterApiService.deletePoliceCustodySuiteAddress(
      context(res),
      req.query.id as string,
      addressId,
    )
    res.redirect(`${detailsLink(req.query.id as string)}&action=UPDATED`)
  }

  async addPhone(req: Request, res: Response): Promise<void> {
    const suite = await this.getSuite(req, res)
    const errors = req.flash('errors')
    if (!errors?.length) delete req.session.addPhoneNumberForm
    const view = new AddAgencyPhoneView(
      suite.policeCustodySuiteName,
      { cancelButton: detailsLink(suite.policeCustodySuiteId) },
      errors,
      req.session.addPhoneNumberForm?.phoneNumber,
    )
    res.render('pages/components/edit/addAgencyPhone', view.renderArgs)
  }

  async submitAddPhone(req: Request, res: Response): Promise<void> {
    req.session.addPhoneNumberForm = trimForm(req.body)
    res.redirect(
      await validateAddPhoneNumber(req.session.addPhoneNumberForm, req, async phoneNumber => {
        const result = await this.hmppsAgencyRegisterApiService.addPoliceCustodySuitePhoneNumber(
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
    const suite = await this.getSuite(req, res)
    const errors = req.flash('errors')
    if (!errors?.length) delete req.session.updatePhoneNumberForm
    const view = new UpdateAgencyPhoneView(
      suite.policeCustodySuiteName,
      { cancelButton: detailsLink(suite.policeCustodySuiteId) },
      errors,
      req.session.updatePhoneNumberForm?.phoneNumber ?? suite.phoneNumbers.find(phone => phone.id === phoneId)?.number,
      phoneId,
    )
    res.render('pages/components/edit/updateAgencyPhone', view.renderArgs)
  }

  async submitUpdatePhone(req: Request, res: Response): Promise<void> {
    req.session.updatePhoneNumberForm = trimForm(req.body)
    res.redirect(
      await validateUpdatePhoneNumber(req.session.updatePhoneNumberForm, req, async phoneNumber => {
        const result = await this.hmppsAgencyRegisterApiService.updatePoliceCustodySuitePhoneNumber(
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
    const suite = await this.getSuite(req, res)
    res.render('pages/components/edit/deleteAgencyPhone', {
      name: suite.policeCustodySuiteName,
      navigation: { cancelButton: detailsLink(suite.policeCustodySuiteId) },
      phoneNumber: suite.phoneNumbers.find(phone => phone.id === phoneId)?.number,
      phoneId,
    })
  }

  async submitDeletePhone(req: Request, res: Response): Promise<void> {
    await this.hmppsAgencyRegisterApiService.deletePoliceCustodySuitePhoneNumber(
      context(res),
      req.query.id as string,
      Number(req.body.phoneId),
    )
    res.redirect(`${detailsLink(req.query.id as string)}&action=UPDATED`)
  }

  async addEmail(req: Request, res: Response): Promise<void> {
    const suite = await this.getSuite(req, res)
    const errors = req.flash('errors')
    if (!errors?.length) delete req.session.addEmailAddressForm
    const view = new AddAgencyEmailView(
      suite.policeCustodySuiteName,
      { cancelButton: detailsLink(suite.policeCustodySuiteId) },
      errors,
      req.session.addEmailAddressForm?.emailAddress,
    )
    res.render('pages/components/edit/addAgencyEmail', view.renderArgs)
  }

  async submitAddEmail(req: Request, res: Response): Promise<void> {
    req.session.addEmailAddressForm = trimForm(req.body)
    res.redirect(
      await validateAddEmailAddress(req.session.addEmailAddressForm, req, async emailAddress => {
        const result = await this.hmppsAgencyRegisterApiService.addPoliceCustodySuiteEmailAddress(
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
    const suite = await this.getSuite(req, res)
    const errors = req.flash('errors')
    if (!errors?.length) delete req.session.updateEmailAddressForm
    const view = new UpdateAgencyEmailView(
      suite.policeCustodySuiteName,
      { cancelButton: detailsLink(suite.policeCustodySuiteId) },
      errors,
      req.session.updateEmailAddressForm?.emailAddress ??
        suite.emailAddresses.find(email => email.id === emailId)?.address,
      emailId,
    )
    res.render('pages/components/edit/updateAgencyEmail', view.renderArgs)
  }

  async submitUpdateEmail(req: Request, res: Response): Promise<void> {
    req.session.updateEmailAddressForm = trimForm(req.body)
    res.redirect(
      await validateUpdateEmailAddress(req.session.updateEmailAddressForm, req, async emailAddress => {
        const result = await this.hmppsAgencyRegisterApiService.updatePoliceCustodySuiteEmailAddress(
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

  async deleteEmail(req: Request, res: Response): Promise<void> {
    const emailId = Number(req.query.emailId)
    const suite = await this.getSuite(req, res)
    res.render('pages/components/edit/deleteAgencyEmail', {
      name: suite.policeCustodySuiteName,
      navigation: { cancelButton: detailsLink(suite.policeCustodySuiteId) },
      emailAddress: suite.emailAddresses.find(email => email.id === emailId)?.address,
      emailId,
    })
  }

  async submitDeleteEmail(req: Request, res: Response): Promise<void> {
    await this.hmppsAgencyRegisterApiService.deletePoliceCustodySuiteEmailAddress(
      context(res),
      req.query.id as string,
      Number(req.body.emailId),
    )
    res.redirect(`${detailsLink(req.query.id as string)}&action=UPDATED`)
  }

  async updateNameDescription(req: Request, res: Response): Promise<void> {
    const suite = await this.getSuite(req, res)
    const errors = req.flash('errors')
    if (!errors?.length) delete req.session.updateNameDescriptionForm
    const view = new UpdateAgencyNameDescriptionView(
      suite.policeCustodySuiteName,
      { cancelButton: detailsLink(suite.policeCustodySuiteId) },
      errors,
      req.session.updateNameDescriptionForm ?? {
        name: suite.policeCustodySuiteName,
        description: suite.description ?? '',
      },
    )
    res.render('pages/components/edit/updateAgencyNameDescription', view.renderArgs)
  }

  async submitUpdateNameDescription(req: Request, res: Response): Promise<void> {
    req.session.updateNameDescriptionForm = trimForm(req.body)
    const id = req.query.id as string
    res.redirect(
      await validateUpdateNameDescription(req.session.updateNameDescriptionForm, req, async ({ name, description }) => {
        const result = await this.saveSuite(res, id, update => {
          Object.assign(update, { policeCustodySuiteName: name, description })
        })
        if (result.success) delete req.session.updateNameDescriptionForm
        return result
      }),
    )
  }

  async updateActive(req: Request, res: Response): Promise<void> {
    const suite = await this.getSuite(req, res)
    const errors = req.flash('errors')
    if (!errors?.length) delete req.session.updateActiveForm
    const view = new UpdateAgencyActiveView(
      suite.policeCustodySuiteName,
      { cancelButton: detailsLink(suite.policeCustodySuiteId) },
      suite.active,
      suite.inactiveDate,
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
        const result = await this.saveSuite(res, id, update => {
          Object.assign(update, change)
          if (change.active) delete update.inactiveDate
        })
        if (result.success) delete req.session.updateActiveForm
        return result
      }),
    )
  }

  async updateCjitCode(req: Request, res: Response): Promise<void> {
    const suite = await this.getSuite(req, res)
    const errors = req.flash('errors')
    if (!errors?.length) delete req.session.updateCjitCodeForm
    const view = new UpdateAgencyCjitCodeView(
      suite.policeCustodySuiteName,
      { cancelButton: detailsLink(suite.policeCustodySuiteId) },
      errors,
      req.session.updateCjitCodeForm ? req.session.updateCjitCodeForm.cjitCode : (suite.cjitCode ?? ''),
    )
    res.render('pages/components/edit/updateAgencyCjitCode', view.renderArgs)
  }

  async submitUpdateCjitCode(req: Request, res: Response): Promise<void> {
    req.session.updateCjitCodeForm = trimForm(req.body)
    const id = req.query.id as string
    res.redirect(
      await validateUpdateCjitCode(req.session.updateCjitCodeForm, req, async cjitCode => {
        const result = await this.saveSuite(res, id, update => {
          Object.assign(update, { cjitCode })
        })
        if (result.success) delete req.session.updateCjitCodeForm
        return result
      }),
    )
  }

  async updateArea(req: Request, res: Response): Promise<void> {
    const suite = await this.getSuite(req, res)
    const errors = req.flash('errors')
    if (!errors?.length) delete req.session.updateAreaForm
    const view = new UpdateAgencyAreaView(
      suite.policeCustodySuiteName,
      { cancelButton: detailsLink(suite.policeCustodySuiteId) },
      errors,
      req.session.updateAreaForm ?? {
        areaCode: suite.area?.code ?? '',
        areaDescription: suite.area?.description ?? '',
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
          const result = await this.saveSuite(res, id, update => {
            update.areaCode = areaCode
          })
          if (result.success) delete req.session.updateAreaForm
          return result
        },
      ),
    )
  }

  async updateRegion(req: Request, res: Response): Promise<void> {
    const suite = await this.getSuite(req, res)
    const errors = req.flash('errors')
    if (!errors?.length) delete req.session.updateRegionForm
    const view = new UpdateAgencyRegionView(
      suite.policeCustodySuiteName,
      { cancelButton: detailsLink(suite.policeCustodySuiteId) },
      errors,
      req.session.updateRegionForm ?? {
        regionCode: suite.region?.code ?? '',
        regionDescription: suite.region?.description ?? '',
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
          const result = await this.saveSuite(res, id, update => {
            update.regionCode = regionCode
          })
          if (result.success) delete req.session.updateRegionForm
          return result
        },
      ),
    )
  }

  async updateGeographicalArea(req: Request, res: Response): Promise<void> {
    const suite = await this.getSuite(req, res)
    const errors = req.flash('errors')
    if (!errors?.length) delete req.session.updateGeographicalAreaForm
    const view = new UpdateAgencyGeographicalAreaView(
      suite.policeCustodySuiteName,
      { cancelButton: detailsLink(suite.policeCustodySuiteId) },
      errors,
      req.session.updateGeographicalAreaForm ?? {
        geographicalAreaCode: suite.geographicalArea?.code ?? '',
        geographicalAreaDescription: suite.geographicalArea?.description ?? '',
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
          const result = await this.saveSuite(res, id, update => {
            update.geographicalAreaCode = geographicalAreaCode
          })
          if (result.success) delete req.session.updateGeographicalAreaForm
          return result
        },
      ),
    )
  }

  async updateLocalAuthority(req: Request, res: Response): Promise<void> {
    const suite = await this.getSuite(req, res)
    const errors = req.flash('errors')
    if (!errors?.length) delete req.session.updateLocalAuthorityForm
    const view = new UpdateAgencyLocalAuthorityView(
      suite.policeCustodySuiteName,
      { cancelButton: detailsLink(suite.policeCustodySuiteId) },
      errors,
      req.session.updateLocalAuthorityForm ?? {
        localAuthorityCode: suite.localAuthority?.code ?? '',
        localAuthorityDescription: suite.localAuthority?.description ?? '',
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
          const result = await this.saveSuite(res, id, update => {
            update.localAuthorityCode = localAuthorityCode
          })
          if (result.success) delete req.session.updateLocalAuthorityForm
          return result
        },
      ),
    )
  }

  async updatePayrollRegion(req: Request, res: Response): Promise<void> {
    const suite = await this.getSuite(req, res)
    const errors = req.flash('errors')
    if (!errors?.length) delete req.session.updatePayrollRegionForm
    const view = new UpdateAgencyPayrollRegionView(
      suite.policeCustodySuiteName,
      { cancelButton: detailsLink(suite.policeCustodySuiteId) },
      errors,
      req.session.updatePayrollRegionForm ?? {
        payrollRegionCode: suite.payrollRegion?.code ?? '',
        payrollRegionDescription: suite.payrollRegion?.description ?? '',
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
          const result = await this.saveSuite(res, id, update => {
            update.payrollRegionCode = payrollRegionCode
          })
          if (result.success) delete req.session.updatePayrollRegionForm
          return result
        },
      ),
    )
  }

  private getSuite(req: Request, res: Response) {
    return this.hmppsAgencyRegisterApiService.getPoliceCustodySuite(context(res), req.query.id as string)
  }

  // Reads the latest suite so that a single field change never overwrites other fields with stale values.
  private async saveSuite(res: Response, id: string, change: (update: UpdatePoliceCustodySuite) => void) {
    const suite = await this.hmppsAgencyRegisterApiService.getPoliceCustodySuite(context(res), id)
    const update = updatePoliceCustodySuiteMapper(suite)
    change(update)
    return this.hmppsAgencyRegisterApiService.updatePoliceCustodySuiteDetails(context(res), id, update)
  }

  parseFilter(req: Request): PoliceCustodySuiteFilter {
    const filter: PoliceCustodySuiteFilter = {
      active: ControllerHelper.parseBooleanFromQuery(req.query.active as string),
      textSearch: req.query.textSearch as string | undefined,
    }
    return ControllerHelper.removeEmptyValues(filter)
  }
}
