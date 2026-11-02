import { randomUUID } from 'node:crypto'
import { Request, Response } from 'express'
import createError from 'http-errors'
import HMPPSAgencyRegisterApi from '../../../services/hmppsAgencyRegisterApi'
import {
  AddApprovedPremisesJourney,
  canVisitApprovedPremisesPage,
  fieldsForStep,
  firstIncompleteStep,
  isApprovedPremisesPage,
  ApprovedPremisesPage,
  approvedPremisesNavigation,
  approvedPremisesPageUrl,
  approvedPremisesSteps,
} from './addApprovedPremisesFlowControl'
import validateApprovedPremisesStep from './addApprovedPremisesValidation'
import AddApprovedPremisesView from './addApprovedPremisesView'
import addApprovedPremisesMapper from './addApprovedPremisesMapper'

const registerUrl = '/approved-premises-register'

export default class AddApprovedPremisesController {
  constructor(private readonly hmppsAgencyRegisterApiService: HMPPSAgencyRegisterApi) {}

  start(req: Request, res: Response): void {
    const journeyId = randomUUID()
    req.session.addApprovedPremisesJourneys ??= {}
    req.session.addApprovedPremisesJourneys[journeyId] = { form: {}, completedSteps: [] }
    res.redirect(approvedPremisesPageUrl(journeyId, 'details'))
  }

  cancel(req: Request, res: Response): void {
    if (req.session.addApprovedPremisesJourneys) {
      delete req.session.addApprovedPremisesJourneys[String(req.params.journeyId)]
    }
    res.redirect(registerUrl)
  }

  show(req: Request, res: Response): void {
    const current = this.currentPage(req, res)
    if (!current) return
    const { journey, page, journeyId } = current
    const errors = req.flash('errors').map(error => ({ href: error.href, text: error.text }))
    const view = new AddApprovedPremisesView(journeyId, page, journey, req.query.change === 'true', errors)
    res.render(
      `pages/approved-premises-register/create/${page === 'check-answers' ? 'checkAnswers' : 'step'}`,
      view.renderArgs,
    )
  }

  async submit(req: Request, res: Response): Promise<void> {
    const current = this.currentPage(req, res)
    if (!current) return
    const { journey, page, journeyId } = current
    const context = { username: res.locals.user?.username }
    if (page === 'check-answers') {
      for (const step of approvedPremisesSteps) {
        // Validate in journey order and stop at the first step needing correction.
        // eslint-disable-next-line no-await-in-loop
        const errors = await validateApprovedPremisesStep(step, journey, this.hmppsAgencyRegisterApiService, context)
        if (errors.length > 0) {
          req.flash('errors', errors)
          journey.completedSteps = journey.completedSteps.filter(completed => completed !== step)
          res.redirect(`${approvedPremisesPageUrl(journeyId, step)}?change=true`)
          return
        }
      }
      const approvedPremises = addApprovedPremisesMapper(journey)
      const result = await this.hmppsAgencyRegisterApiService.createApprovedPremises(context, approvedPremises)
      if (result.success === false) {
        req.flash('errors', [{ href: '#create-approved-premises', text: result.userMessage }])
        res.redirect(approvedPremisesPageUrl(journeyId, 'check-answers'))
        return
      }
      delete req.session.addApprovedPremisesJourneys[journeyId]
      res.redirect(
        `${registerUrl}/details?id=${encodeURIComponent(approvedPremises.approvedPremisesId)}&action=CREATED`,
      )
      return
    }
    const changeQuery = req.query.change === 'true' ? '?change=true' : ''
    const fields = fieldsForStep(page)
    const invalidFields = fields.filter(field => req.body[field] !== undefined && typeof req.body[field] !== 'string')
    if (invalidFields.length > 0) {
      req.flash(
        'errors',
        invalidFields.map(field => ({ href: `#${field.replace(/Code$/, '')}`, text: 'Enter a valid value' })),
      )
      res.redirect(`${approvedPremisesPageUrl(journeyId, page)}${changeQuery}`)
      return
    }
    for (const field of fields) {
      const value: unknown = req.body[field]
      journey.form[field] = typeof value === 'string' ? value.trim() : ''
    }
    const errors = await validateApprovedPremisesStep(page, journey, this.hmppsAgencyRegisterApiService, context)
    if (errors.length > 0) {
      req.flash('errors', errors)
      // Keep later answers, but require this step to be corrected before confirmation.
      journey.completedSteps = journey.completedSteps.filter(step => step !== page)
      res.redirect(`${approvedPremisesPageUrl(journeyId, page)}${changeQuery}`)
      return
    }
    if (!journey.completedSteps.includes(page)) journey.completedSteps.push(page)
    res.redirect(approvedPremisesNavigation(journeyId, page, req.query.change === 'true').nextPage)
  }

  private currentPage(
    req: Request,
    res: Response,
  ): { journey: AddApprovedPremisesJourney; page: ApprovedPremisesPage; journeyId: string } | undefined {
    const journeyId = String(req.params.journeyId)
    const page = String(req.params.step)
    if (!isApprovedPremisesPage(page)) throw createError(404, 'Approved premises creation page not found')
    const journeys = req.session.addApprovedPremisesJourneys
    const journey =
      journeys && Object.prototype.hasOwnProperty.call(journeys, journeyId) ? journeys[journeyId] : undefined
    if (!journey) {
      res.redirect(registerUrl)
      return undefined
    }
    if (!canVisitApprovedPremisesPage(journey, page)) {
      res.redirect(approvedPremisesPageUrl(journeyId, firstIncompleteStep(journey) ?? 'details'))
      return undefined
    }
    return { journey, page, journeyId }
  }
}
