import { Request, Response } from 'express'
import createError from 'http-errors'
import config from '../../config'
import HMPPSAgencyRegisterApi, { Context } from '../../services/hmppsAgencyRegisterApi'
import AllCourtsView from './allCourtsView'
import ControllerHelper from '../utils/controllerHelper'
import { CourtsFilter, updateCourtMapper } from './courtMapper'
import CourtDetailsView, { Action } from './courtDetailsView'
import AddAgencyEmailView from '../agencyRegisters/addEmailView'
import trimForm from '../../utils/trim'
import addEmailAddressValidator from './addEmailAddressValidator'
import updateEmailAddressValidator from './updateEmailAddressValidator'
import { EmailAddress, UpdateEmailAddress } from '../../@types/prisonRegister'
import UpdateAgencyEmailView from '../agencyRegisters/updateEmailView'
import AddAgencyPhoneView from '../agencyRegisters/addPhoneView'
import addPhoneNumberValidator from './addPhoneNumberValidator'
import AddAgencyAddressView from '../agencyRegisters/addAddressView'
import addAddressValidator from './addAddressValidator'
import UpdateAgencyPhoneView from '../agencyRegisters/updatePhoneView'
import updatePhoneNumberValidator from './updatePhoneNumberValidator'
import UpdateAgencyAddressView from '../agencyRegisters/updateAddressView'
import updateAddressValidator from './updateAddressValidator'
import UpdateAgencyNameDescriptionView from '../agencyRegisters/updateNameDescriptionView'
import updateNameDescriptionValidator from './updateNameDescriptionValidator'
import UpdateCourtTypeView from './updateCourtTypeView'
import updateCourtTypeValidator from './updateCourtTypeValidator'
import { allCourtTypes } from './courtData'
import UpdateAccessibleAccessView from './updateAccessibleAccessView'
import updateAccessibleAccessValidator from './updateAccessibleAccessValidator'
import UpdateAgencyCjitCodeView from '../agencyRegisters/updateCjitCodeView'
import updateCjitCodeValidator from './updateCjitCodeValidator'
import UpdateAgencyActiveView from '../agencyRegisters/updateActiveView'
import updateActiveValidator from './updateActiveValidator'
import UpdateAgencyAreaView from '../agencyRegisters/updateAreaView'
import updateAreaValidator from './updateAreaValidator'
import UpdateAgencyRegionView from '../agencyRegisters/updateRegionView'
import updateRegionValidator from './updateRegionValidator'
import UpdateAgencyGeographicalAreaView from '../agencyRegisters/updateGeographicalAreaView'
import updateGeographicalAreaValidator from './updateGeographicalAreaValidator'
import UpdateAgencyLocalAuthorityView from '../agencyRegisters/updateLocalAuthorityView'
import updateLocalAuthorityValidator from './updateLocalAuthorityValidator'
import UpdateAgencyPayrollRegionView from '../agencyRegisters/updatePayrollRegionView'
import updatePayrollRegionValidator from './updatePayrollRegionValidator'

function context(res: Response): Context {
  return {
    username: res?.locals?.user?.username,
  }
}

export default class CourtRegisterController {
  constructor(private readonly hmppsAgencyRegisterApiService: HMPPSAgencyRegisterApi) {}

  async showAllCourts(req: Request, res: Response): Promise<void> {
    const filter = this.parseFilter(req)

    req.session.allListPageLink = '/court-register'
    const courts = await this.hmppsAgencyRegisterApiService.getCourts(context(res), filter)
    const view = new AllCourtsView(courts, filter)
    res.render('pages/court-register/allCourts', view.renderArgs)
  }

  async viewCourt(req: Request, res: Response): Promise<void> {
    const { id, action } = req.query as { id: string; action: Action }
    const court = await this.hmppsAgencyRegisterApiService.getCourt(context(res), id)
    const view = new CourtDetailsView(court, (action || 'NONE') as Action)
    res.render('pages/court-register/courtDetails', view.renderArgs)
  }

  async deleteCourt(req: Request, res: Response): Promise<void> {
    if (!config.agencyRegistersDeleteEnabled) throw createError(404, 'Not found')
    const court = await this.hmppsAgencyRegisterApiService.getCourt(context(res), req.query.id as string)
    res.render('pages/components/edit/deleteAgency', {
      name: court.courtName,
      agencyId: court.courtId,
      agencyType: 'court',
      agencyRegistersDeleteEnabled: config.agencyRegistersDeleteEnabled,
      navigation: { cancelButton: `/court-register/details?id=${court.courtId}` },
    })
  }

  async submitDeleteCourt(req: Request, res: Response): Promise<void> {
    if (!config.agencyRegistersDeleteEnabled) throw createError(404, 'Not found')
    await this.hmppsAgencyRegisterApiService.deleteCourt(context(res), req.query.id as string)
    res.redirect('/court-register')
  }

  async addAddress(req: Request, res: Response): Promise<void> {
    const { id } = req.query as { id: string }
    const court = await this.hmppsAgencyRegisterApiService.getCourt(context(res), id)
    const errors = req.flash('errors')
    if (!errors?.length) {
      delete req.session.addAddressForm
    }
    const view = new AddAgencyAddressView(
      court.courtName,
      { cancelButton: `/court-register/details?id=${court.courtId}` },
      errors,
      req.session.addAddressForm,
    )
    res.render('pages/components/edit/addAgencyAddress', view.renderArgs)
  }

  async submitAddAddress(req: Request, res: Response): Promise<void> {
    req.session.addAddressForm = trimForm(req.body)

    res.redirect(
      await addAddressValidator(req.session.addAddressForm, req, async address => {
        const addedAddress = await this.hmppsAgencyRegisterApiService.addCourtAddress(
          context(res),
          req.query.id as string,
          address,
        )
        if (addedAddress.success) {
          delete req.session.addAddressForm
        }
        return addedAddress
      }),
    )
  }

  async updateAddress(req: Request, res: Response): Promise<void> {
    const { id } = req.query as { id: string }
    const addressId = Number(req.query.addressId)
    const court = await this.hmppsAgencyRegisterApiService.getCourt(context(res), id)
    const address = court.addresses.find(item => item.id === addressId)
    if (!address) {
      throw createError(404, 'Court address not found')
    }
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
      court.courtName,
      { cancelButton: `/court-register/details?id=${court.courtId}` },
      form,
      errors,
    )
    res.render('pages/components/edit/updateAgencyAddress', view.renderArgs)
  }

  async submitUpdateAddress(req: Request, res: Response): Promise<void> {
    req.session.updateAddressForm = trimForm(req.body)
    req.session.updateAddressForm.addressId = Number(req.session.updateAddressForm.addressId)

    res.redirect(
      await updateAddressValidator(req.session.updateAddressForm, req, async address => {
        const updatedAddress = await this.hmppsAgencyRegisterApiService.updateCourtAddress(
          context(res),
          req.query.id as string,
          req.session.updateAddressForm.addressId,
          address,
        )
        if (updatedAddress.success) {
          delete req.session.updateAddressForm
        }
        return updatedAddress
      }),
    )
  }

  async addPhone(req: Request, res: Response): Promise<void> {
    const { id } = req.query as { id: string }
    const court = await this.hmppsAgencyRegisterApiService.getCourt(context(res), id)
    const errors = req.flash('errors')
    if (!errors?.length) {
      delete req.session.addPhoneNumberForm
    }
    const view = new AddAgencyPhoneView(
      court.courtName,
      { cancelButton: `/court-register/details?id=${court.courtId}` },
      errors,
      req.session.addPhoneNumberForm?.phoneNumber,
    )
    res.render('pages/components/edit/addAgencyPhone', view.renderArgs)
  }

  async submitAddPhone(req: Request, res: Response): Promise<void> {
    req.session.addPhoneNumberForm = trimForm(req.body)

    res.redirect(
      await addPhoneNumberValidator(req.session.addPhoneNumberForm, req, async phoneNumber => {
        const addedPhoneNumber = await this.hmppsAgencyRegisterApiService.addCourtPhoneNumber(
          context(res),
          req.query.id as string,
          phoneNumber,
        )
        if (addedPhoneNumber.success) {
          delete req.session.addPhoneNumberForm
        }
        return addedPhoneNumber
      }),
    )
  }

  async addEmail(req: Request, res: Response): Promise<void> {
    const { id } = req.query as { id: string }
    const court = await this.hmppsAgencyRegisterApiService.getCourt(context(res), id)
    const errors = req.flash('errors')
    if (!errors?.length) {
      delete req.session.addEmailAddressForm
    }
    const view = new AddAgencyEmailView(
      court.courtName,
      { cancelButton: `/court-register/details?id=${court.courtId}` },
      errors,
      req.session.addEmailAddressForm?.emailAddress,
    )
    res.render('pages/components/edit/addAgencyEmail', view.renderArgs)
  }

  async submitAddEmail(req: Request, res: Response): Promise<void> {
    req.session.addEmailAddressForm = trimForm(req.body)

    res.redirect(
      await addEmailAddressValidator(req.session.addEmailAddressForm, req, async (addEmailAddress: EmailAddress) => {
        const result = await this.hmppsAgencyRegisterApiService.addCourtEmailAddress(
          context(res),
          req.query.id as string,
          addEmailAddress,
        )
        if (result.success) {
          delete req.session.addEmailAddressForm
        }
        return result
      }),
    )
  }

  async updatePhone(req: Request, res: Response): Promise<void> {
    const { id } = req.query as { id: string }
    const phoneId = Number(req.query.phoneId)
    const court = await this.hmppsAgencyRegisterApiService.getCourt(context(res), id)
    const errors = req.flash('errors')
    if (!errors?.length) {
      delete req.session.updatePhoneNumberForm
    }
    const view = new UpdateAgencyPhoneView(
      court.courtName,
      { cancelButton: `/court-register/details?id=${court.courtId}` },
      errors,
      req.session.updatePhoneNumberForm?.phoneNumber ?? court.phoneNumbers.find(phone => phone.id === phoneId)?.number,
      phoneId,
    )
    res.render('pages/components/edit/updateAgencyPhone', view.renderArgs)
  }

  async submitUpdatePhone(req: Request, res: Response): Promise<void> {
    req.session.updatePhoneNumberForm = trimForm(req.body)

    res.redirect(
      await updatePhoneNumberValidator(req.session.updatePhoneNumberForm, req, async phoneNumber => {
        const updatedPhoneNumber = await this.hmppsAgencyRegisterApiService.updateCourtPhoneNumber(
          context(res),
          req.query.id as string,
          Number(req.session.updatePhoneNumberForm.phoneId),
          phoneNumber,
        )
        if (updatedPhoneNumber.success) {
          delete req.session.updatePhoneNumberForm
        }
        return updatedPhoneNumber
      }),
    )
  }

  async deletePhone(req: Request, res: Response): Promise<void> {
    const { id } = req.query as { id: string }
    const phoneId = Number(req.query.phoneId)
    const court = await this.hmppsAgencyRegisterApiService.getCourt(context(res), id)
    const phoneNumber = court.phoneNumbers.find(phone => phone.id === phoneId)?.number
    res.render('pages/components/edit/deleteAgencyPhone', {
      name: court.courtName,
      navigation: { cancelButton: `/court-register/details?id=${court.courtId}` },
      phoneNumber,
      phoneId,
    })
  }

  async submitDeletePhone(req: Request, res: Response): Promise<void> {
    await this.hmppsAgencyRegisterApiService.deleteCourtPhoneNumber(
      context(res),
      req.query.id as string,
      Number(req.body.phoneId),
    )
    res.redirect(`/court-register/details?id=${req.query.id}&action=UPDATED`)
  }

  async updateEmail(req: Request, res: Response): Promise<void> {
    const { id } = req.query as { id: string }
    const emailId = Number(req.query.emailId)
    const court = await this.hmppsAgencyRegisterApiService.getCourt(context(res), id)
    const errors = req.flash('errors')
    if (!errors?.length) {
      delete req.session.updateEmailAddressForm
    }
    const view = new UpdateAgencyEmailView(
      court.courtName,
      { cancelButton: `/court-register/details?id=${court.courtId}` },
      errors,
      req.session?.updateEmailAddressForm?.emailAddress ??
        court.emailAddresses.find(email => email.id === emailId)?.address,
      emailId,
    )
    res.render('pages/components/edit/updateAgencyEmail', view.renderArgs)
  }

  async submitUpdateEmail(req: Request, res: Response): Promise<void> {
    req.session.updateEmailAddressForm = trimForm(req.body)

    res.redirect(
      await updateEmailAddressValidator(
        req.session.updateEmailAddressForm,
        req,
        async (updateEmailAddress: UpdateEmailAddress) => {
          const emailAddress = await this.hmppsAgencyRegisterApiService.updateCourtEmailAddress(
            context(res),
            req.query.id as string,
            Number(req.session.updateEmailAddressForm.emailId),
            updateEmailAddress,
          )
          if (emailAddress.success) {
            delete req.session.updateEmailAddressForm
          }
          return emailAddress
        },
      ),
    )
  }

  async updateNameDescription(req: Request, res: Response): Promise<void> {
    const { id } = req.query as { id: string }
    const court = await this.hmppsAgencyRegisterApiService.getCourt(context(res), id)
    const errors = req.flash('errors')
    if (!errors?.length) {
      delete req.session.updateNameDescriptionForm
    }
    const view = new UpdateAgencyNameDescriptionView(
      court.courtName,
      { cancelButton: `/court-register/details?id=${court.courtId}` },
      errors,
      req.session.updateNameDescriptionForm ?? { name: court.courtName, description: court.description ?? '' },
    )
    res.render('pages/components/edit/updateAgencyNameDescription', view.renderArgs)
  }

  async submitUpdateNameDescription(req: Request, res: Response): Promise<void> {
    req.session.updateNameDescriptionForm = trimForm(req.body)
    const courtId = req.query.id as string

    res.redirect(
      await updateNameDescriptionValidator(
        req.session.updateNameDescriptionForm,
        req,
        async ({ name, description }) => {
          const court = await this.hmppsAgencyRegisterApiService.getCourt(context(res), courtId)
          const result = await this.hmppsAgencyRegisterApiService.updateCourtDetails(context(res), courtId, {
            ...updateCourtMapper(court),
            courtName: name,
            description,
          })
          if (result.success) {
            delete req.session.updateNameDescriptionForm
          }
          return result
        },
      ),
    )
  }

  async updateCourtType(req: Request, res: Response): Promise<void> {
    const { id } = req.query as { id: string }
    const court = await this.hmppsAgencyRegisterApiService.getCourt(context(res), id)
    const errors = req.flash('errors')
    if (!errors?.length) {
      delete req.session.updateCourtTypeForm
    }
    const view = new UpdateCourtTypeView(
      court.courtName,
      { cancelButton: `/court-register/details?id=${court.courtId}` },
      allCourtTypes,
      errors,
      req.session.updateCourtTypeForm ? req.session.updateCourtTypeForm.courtType : court.courtType?.code,
    )
    res.render('pages/court-register/updateCourtType', view.renderArgs)
  }

  async submitUpdateCourtType(req: Request, res: Response): Promise<void> {
    req.session.updateCourtTypeForm = trimForm(req.body)
    const courtId = req.query.id as string

    res.redirect(
      await updateCourtTypeValidator(req.session.updateCourtTypeForm, req, async courtTypeCode => {
        const court = await this.hmppsAgencyRegisterApiService.getCourt(context(res), courtId)
        const result = await this.hmppsAgencyRegisterApiService.updateCourtDetails(context(res), courtId, {
          ...updateCourtMapper(court),
          courtTypeCode,
        })
        if (result.success) {
          delete req.session.updateCourtTypeForm
        }
        return result
      }),
    )
  }

  async updateAccessibleAccess(req: Request, res: Response): Promise<void> {
    const { id } = req.query as { id: string }
    const court = await this.hmppsAgencyRegisterApiService.getCourt(context(res), id)
    const errors = req.flash('errors')
    if (!errors?.length) {
      delete req.session.updateAccessibleAccessForm
    }
    const view = new UpdateAccessibleAccessView(
      court.courtName,
      { cancelButton: `/court-register/details?id=${court.courtId}` },
      errors,
      req.session.updateAccessibleAccessForm
        ? req.session.updateAccessibleAccessForm.accessibleAccess
        : (court.accessibleAccess ?? 'UNKNOWN'),
    )
    res.render('pages/components/edit/updateAgencyAccessibleAccess', view.renderArgs)
  }

  async submitUpdateAccessibleAccess(req: Request, res: Response): Promise<void> {
    req.session.updateAccessibleAccessForm = trimForm(req.body)
    const courtId = req.query.id as string

    res.redirect(
      await updateAccessibleAccessValidator(req.session.updateAccessibleAccessForm, req, async accessibleAccess => {
        const court = await this.hmppsAgencyRegisterApiService.getCourt(context(res), courtId)
        const updateCourt = updateCourtMapper(court)
        if (accessibleAccess === undefined) {
          delete updateCourt.accessibleAccess
        } else {
          updateCourt.accessibleAccess = accessibleAccess
        }
        const result = await this.hmppsAgencyRegisterApiService.updateCourtDetails(context(res), courtId, updateCourt)
        if (result.success) {
          delete req.session.updateAccessibleAccessForm
        }
        return result
      }),
    )
  }

  async updateCjitCode(req: Request, res: Response): Promise<void> {
    const { id } = req.query as { id: string }
    const court = await this.hmppsAgencyRegisterApiService.getCourt(context(res), id)
    const errors = req.flash('errors')
    if (!errors?.length) {
      delete req.session.updateCjitCodeForm
    }
    const view = new UpdateAgencyCjitCodeView(
      court.courtName,
      { cancelButton: `/court-register/details?id=${court.courtId}` },
      errors,
      req.session.updateCjitCodeForm ? req.session.updateCjitCodeForm.cjitCode : (court.cjitCode ?? ''),
    )
    res.render('pages/components/edit/updateAgencyCjitCode', view.renderArgs)
  }

  async submitUpdateCjitCode(req: Request, res: Response): Promise<void> {
    req.session.updateCjitCodeForm = trimForm(req.body)
    const courtId = req.query.id as string

    res.redirect(
      await updateCjitCodeValidator(req.session.updateCjitCodeForm, req, async cjitCode => {
        const court = await this.hmppsAgencyRegisterApiService.getCourt(context(res), courtId)
        const result = await this.hmppsAgencyRegisterApiService.updateCourtDetails(context(res), courtId, {
          ...updateCourtMapper(court),
          cjitCode,
        })
        if (result.success) {
          delete req.session.updateCjitCodeForm
        }
        return result
      }),
    )
  }

  async updateActive(req: Request, res: Response): Promise<void> {
    const { id } = req.query as { id: string }
    const court = await this.hmppsAgencyRegisterApiService.getCourt(context(res), id)
    const errors = req.flash('errors')
    if (!errors?.length) {
      delete req.session.updateActiveForm
    }
    const view = new UpdateAgencyActiveView(
      court.courtName,
      { cancelButton: `/court-register/details?id=${court.courtId}` },
      court.active,
      court.inactiveDate,
      errors,
      req.session.updateActiveForm,
    )
    res.render('pages/components/edit/updateAgencyActive', view.renderArgs)
  }

  async submitUpdateActive(req: Request, res: Response): Promise<void> {
    req.session.updateActiveForm = trimForm(req.body)
    const courtId = req.query.id as string
    res.redirect(
      await updateActiveValidator(req.session.updateActiveForm, req, async update => {
        const court = await this.hmppsAgencyRegisterApiService.getCourt(context(res), courtId)
        const updatedCourt = { ...updateCourtMapper(court), ...update }
        if (update.active) {
          delete updatedCourt.inactiveDate
        }
        const result = await this.hmppsAgencyRegisterApiService.updateCourtDetails(context(res), courtId, updatedCourt)
        if (result.success) {
          delete req.session.updateActiveForm
        }
        return result
      }),
    )
  }

  async updateArea(req: Request, res: Response): Promise<void> {
    const { id } = req.query as { id: string }
    const court = await this.hmppsAgencyRegisterApiService.getCourt(context(res), id)
    const errors = req.flash('errors')
    if (!errors?.length) delete req.session.updateAreaForm
    const view = new UpdateAgencyAreaView(
      court.courtName,
      { cancelButton: `/court-register/details?id=${id}` },
      errors,
      req.session.updateAreaForm ?? {
        areaCode: court.area?.code ?? '',
        areaDescription: court.area?.description ?? '',
      },
    )
    res.render('pages/components/edit/updateAgencyArea', view.renderArgs)
  }

  async submitUpdateArea(req: Request, res: Response): Promise<void> {
    req.session.updateAreaForm = trimForm(req.body)
    const courtId = req.query.id as string
    res.redirect(
      await updateAreaValidator(
        req.session.updateAreaForm,
        req,
        () => this.hmppsAgencyRegisterApiService.getAreas(context(res)),
        async areaCode => {
          const court = await this.hmppsAgencyRegisterApiService.getCourt(context(res), courtId)
          const update = updateCourtMapper(court)
          if (areaCode === undefined) delete update.areaCode
          else update.areaCode = areaCode
          const result = await this.hmppsAgencyRegisterApiService.updateCourtDetails(context(res), courtId, update)
          if (result.success) delete req.session.updateAreaForm
          return result
        },
      ),
    )
  }

  async updateRegion(req: Request, res: Response): Promise<void> {
    const { id } = req.query as { id: string }
    const court = await this.hmppsAgencyRegisterApiService.getCourt(context(res), id)
    const errors = req.flash('errors')
    if (!errors?.length) delete req.session.updateRegionForm
    const view = new UpdateAgencyRegionView(
      court.courtName,
      { cancelButton: `/court-register/details?id=${id}` },
      errors,
      req.session.updateRegionForm ?? {
        regionCode: court.region?.code ?? '',
        regionDescription: court.region?.description ?? '',
      },
    )
    res.render('pages/components/edit/updateAgencyRegion', view.renderArgs)
  }

  async submitUpdateRegion(req: Request, res: Response): Promise<void> {
    req.session.updateRegionForm = trimForm(req.body)
    const courtId = req.query.id as string
    res.redirect(
      await updateRegionValidator(
        req.session.updateRegionForm,
        req,
        () => this.hmppsAgencyRegisterApiService.getRegions(context(res)),
        async regionCode => {
          const court = await this.hmppsAgencyRegisterApiService.getCourt(context(res), courtId)
          const update = updateCourtMapper(court)
          if (regionCode === undefined) delete update.regionCode
          else update.regionCode = regionCode
          const result = await this.hmppsAgencyRegisterApiService.updateCourtDetails(context(res), courtId, update)
          if (result.success) delete req.session.updateRegionForm
          return result
        },
      ),
    )
  }

  async updateGeographicalArea(req: Request, res: Response): Promise<void> {
    const { id } = req.query as { id: string }
    const court = await this.hmppsAgencyRegisterApiService.getCourt(context(res), id)
    const errors = req.flash('errors')
    if (!errors?.length) delete req.session.updateGeographicalAreaForm
    const view = new UpdateAgencyGeographicalAreaView(
      court.courtName,
      { cancelButton: `/court-register/details?id=${id}` },
      errors,
      req.session.updateGeographicalAreaForm ?? {
        geographicalAreaCode: court.geographicalArea?.code ?? '',
        geographicalAreaDescription: court.geographicalArea?.description ?? '',
      },
    )
    res.render('pages/components/edit/updateAgencyGeographicalArea', view.renderArgs)
  }

  async submitUpdateGeographicalArea(req: Request, res: Response): Promise<void> {
    req.session.updateGeographicalAreaForm = trimForm(req.body)
    const courtId = req.query.id as string
    res.redirect(
      await updateGeographicalAreaValidator(
        req.session.updateGeographicalAreaForm,
        req,
        () => this.hmppsAgencyRegisterApiService.getAreas(context(res)),
        async geographicalAreaCode => {
          const court = await this.hmppsAgencyRegisterApiService.getCourt(context(res), courtId)
          const update = updateCourtMapper(court)
          if (geographicalAreaCode === undefined) delete update.geographicalAreaCode
          else update.geographicalAreaCode = geographicalAreaCode
          const result = await this.hmppsAgencyRegisterApiService.updateCourtDetails(context(res), courtId, update)
          if (result.success) delete req.session.updateGeographicalAreaForm
          return result
        },
      ),
    )
  }

  async updateLocalAuthority(req: Request, res: Response): Promise<void> {
    const { id } = req.query as { id: string }
    const court = await this.hmppsAgencyRegisterApiService.getCourt(context(res), id)
    const errors = req.flash('errors')
    if (!errors?.length) delete req.session.updateLocalAuthorityForm
    const view = new UpdateAgencyLocalAuthorityView(
      court.courtName,
      { cancelButton: `/court-register/details?id=${id}` },
      errors,
      req.session.updateLocalAuthorityForm ?? {
        localAuthorityCode: court.localAuthority?.code ?? '',
        localAuthorityDescription: court.localAuthority?.description ?? '',
      },
    )
    res.render('pages/components/edit/updateAgencyLocalAuthority', view.renderArgs)
  }

  async submitUpdateLocalAuthority(req: Request, res: Response): Promise<void> {
    req.session.updateLocalAuthorityForm = trimForm(req.body)
    const courtId = req.query.id as string
    res.redirect(
      await updateLocalAuthorityValidator(
        req.session.updateLocalAuthorityForm,
        req,
        () => this.hmppsAgencyRegisterApiService.getLocalAuthorities(context(res)),
        async localAuthorityCode => {
          const court = await this.hmppsAgencyRegisterApiService.getCourt(context(res), courtId)
          const update = updateCourtMapper(court)
          if (localAuthorityCode === undefined) delete update.localAuthorityCode
          else update.localAuthorityCode = localAuthorityCode
          const result = await this.hmppsAgencyRegisterApiService.updateCourtDetails(context(res), courtId, update)
          if (result.success) delete req.session.updateLocalAuthorityForm
          return result
        },
      ),
    )
  }

  async updatePayrollRegion(req: Request, res: Response): Promise<void> {
    const { id } = req.query as { id: string }
    const court = await this.hmppsAgencyRegisterApiService.getCourt(context(res), id)
    const errors = req.flash('errors')
    if (!errors?.length) delete req.session.updatePayrollRegionForm
    const view = new UpdateAgencyPayrollRegionView(
      court.courtName,
      { cancelButton: `/court-register/details?id=${id}` },
      errors,
      req.session.updatePayrollRegionForm ?? {
        payrollRegionCode: court.payrollRegion?.code ?? '',
        payrollRegionDescription: court.payrollRegion?.description ?? '',
      },
    )
    res.render('pages/components/edit/updateAgencyPayrollRegion', view.renderArgs)
  }

  async submitUpdatePayrollRegion(req: Request, res: Response): Promise<void> {
    req.session.updatePayrollRegionForm = trimForm(req.body)
    const courtId = req.query.id as string
    res.redirect(
      await updatePayrollRegionValidator(
        req.session.updatePayrollRegionForm,
        req,
        () => this.hmppsAgencyRegisterApiService.getPayrollRegions(context(res)),
        async payrollRegionCode => {
          const court = await this.hmppsAgencyRegisterApiService.getCourt(context(res), courtId)
          const update = updateCourtMapper(court)
          if (payrollRegionCode === undefined) delete update.payrollRegionCode
          else update.payrollRegionCode = payrollRegionCode
          const result = await this.hmppsAgencyRegisterApiService.updateCourtDetails(context(res), courtId, update)
          if (result.success) delete req.session.updatePayrollRegionForm
          return result
        },
      ),
    )
  }

  async deleteEmail(req: Request, res: Response): Promise<void> {
    const { id } = req.query as { id: string }
    const emailId = Number(req.query.emailId)
    const court = await this.hmppsAgencyRegisterApiService.getCourt(context(res), id)
    const emailAddress = court.emailAddresses.find(email => email.id === emailId)?.address
    res.render('pages/components/edit/deleteAgencyEmail', {
      name: court.courtName,
      navigation: { cancelButton: `/court-register/details?id=${court.courtId}` },
      emailAddress,
      emailId,
    })
  }

  async submitDeleteEmail(req: Request, res: Response): Promise<void> {
    await this.hmppsAgencyRegisterApiService.deleteCourtEmailAddress(
      context(res),
      req.query.id as string,
      Number(req.body.emailId),
    )
    res.redirect(`/court-register/details?id=${req.query.id}&action=UPDATED`)
  }

  parseFilter(req: Request): CourtsFilter {
    const filter: CourtsFilter = {
      active: ControllerHelper.parseBooleanFromQuery(req.query.active as string),
      textSearch: req.query.textSearch as string | undefined,
      courtTypeCodes: ControllerHelper.parseStringArrayFromQuery(req.query.courtTypeCodes as string[]),
    }
    return ControllerHelper.removeEmptyValues(filter)
  }
}
