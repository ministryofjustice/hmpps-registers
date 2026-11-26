import { randomUUID } from 'node:crypto'
import { Request, Response } from 'express'
import createError from 'http-errors'
import HMPPSAgencyRegisterApi from '../../../services/hmppsAgencyRegisterApi'
import {
  AddOtherAgencyJourney,
  canVisitOtherAgencyPage,
  fieldsForStep,
  firstIncompleteStep,
  isOtherAgencyPage,
  OtherAgencyPage,
  otherAgencyNavigation,
  otherAgencyPageUrl,
  otherAgencySteps,
} from './addOtherAgencyFlowControl'
import validateOtherAgencyStep from './addOtherAgencyValidation'
import AddOtherAgencyView from './addOtherAgencyView'
import addOtherAgencyMapper from './addOtherAgencyMapper'

const registerUrl = '/other-agency-register'

export default class AddOtherAgencyController {
  constructor(private readonly hmppsAgencyRegisterApiService: HMPPSAgencyRegisterApi) {}

  start(req: Request, res: Response): void {
    const journeyId = randomUUID()
    req.session.addOtherAgencyJourneys ??= {}
    req.session.addOtherAgencyJourneys[journeyId] = { form: {}, completedSteps: [] }
    res.redirect(otherAgencyPageUrl(journeyId, 'details'))
  }

  cancel(req: Request, res: Response): void {
    if (req.session.addOtherAgencyJourneys) {
      delete req.session.addOtherAgencyJourneys[String(req.params.journeyId)]
    }
    res.redirect(registerUrl)
  }

  show(req: Request, res: Response): void {
    const current = this.currentPage(req, res)
    if (!current) return
    const { journey, page, journeyId } = current
    const errors = req.flash('errors').map(error => ({ href: error.href, text: error.text }))
    const view = new AddOtherAgencyView(journeyId, page, journey, req.query.change === 'true', errors)
    res.render(
      `pages/other-agency-register/create/${page === 'check-answers' ? 'checkAnswers' : 'step'}`,
      view.renderArgs,
    )
  }

  async submit(req: Request, res: Response): Promise<void> {
    const current = this.currentPage(req, res)
    if (!current) return
    const { journey, page, journeyId } = current
    const context = { username: res.locals.user?.username }
    if (page === 'check-answers') {
      for (const step of otherAgencySteps) {
        // Validate in journey order and stop at the first step needing correction.
        // eslint-disable-next-line no-await-in-loop
        const errors = await validateOtherAgencyStep(step, journey, this.hmppsAgencyRegisterApiService, context)
        if (errors.length > 0) {
          req.flash('errors', errors)
          journey.completedSteps = journey.completedSteps.filter(completed => completed !== step)
          res.redirect(`${otherAgencyPageUrl(journeyId, step)}?change=true`)
          return
        }
      }
      const otherAgency = addOtherAgencyMapper(journey)
      const result = await this.hmppsAgencyRegisterApiService.createOtherAgency(context, otherAgency)
      if (result.success === false) {
        req.flash('errors', [{ href: '#create-other-agency', text: result.userMessage }])
        res.redirect(otherAgencyPageUrl(journeyId, 'check-answers'))
        return
      }
      delete req.session.addOtherAgencyJourneys[journeyId]
      res.redirect(`${registerUrl}/details?id=${encodeURIComponent(otherAgency.agencyId)}&action=CREATED`)
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
      res.redirect(`${otherAgencyPageUrl(journeyId, page)}${changeQuery}`)
      return
    }
    for (const field of fields) {
      const value: unknown = req.body[field]
      journey.form[field] = typeof value === 'string' ? value.trim() : ''
    }
    const errors = await validateOtherAgencyStep(page, journey, this.hmppsAgencyRegisterApiService, context)
    if (errors.length > 0) {
      req.flash('errors', errors)
      // Keep later answers, but require this step to be corrected before confirmation.
      journey.completedSteps = journey.completedSteps.filter(step => step !== page)
      res.redirect(`${otherAgencyPageUrl(journeyId, page)}${changeQuery}`)
      return
    }
    if (!journey.completedSteps.includes(page)) journey.completedSteps.push(page)
    res.redirect(otherAgencyNavigation(journeyId, page, req.query.change === 'true').nextPage)
  }

  private currentPage(
    req: Request,
    res: Response,
  ): { journey: AddOtherAgencyJourney; page: OtherAgencyPage; journeyId: string } | undefined {
    const journeyId = String(req.params.journeyId)
    const page = String(req.params.step)
    if (!isOtherAgencyPage(page)) throw createError(404, 'Other agency creation page not found')
    const journeys = req.session.addOtherAgencyJourneys
    const journey =
      journeys && Object.prototype.hasOwnProperty.call(journeys, journeyId) ? journeys[journeyId] : undefined
    if (!journey) {
      res.redirect(registerUrl)
      return undefined
    }
    if (!canVisitOtherAgencyPage(journey, page)) {
      res.redirect(otherAgencyPageUrl(journeyId, firstIncompleteStep(journey) ?? 'details'))
      return undefined
    }
    return { journey, page, journeyId }
  }
}
