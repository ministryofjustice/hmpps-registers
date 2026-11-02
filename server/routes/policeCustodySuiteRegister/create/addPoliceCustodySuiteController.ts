import { randomUUID } from 'node:crypto'
import { Request, Response } from 'express'
import createError from 'http-errors'
import HMPPSAgencyRegisterApi from '../../../services/hmppsAgencyRegisterApi'
import {
  AddPoliceCustodySuiteJourney,
  canVisitPoliceCustodySuitePage,
  fieldsForStep,
  firstIncompleteStep,
  isPoliceCustodySuitePage,
  PoliceCustodySuitePage,
  policeCustodySuiteNavigation,
  policeCustodySuitePageUrl,
  policeCustodySuiteSteps,
} from './addPoliceCustodySuiteFlowControl'
import validatePoliceCustodySuiteStep from './addPoliceCustodySuiteValidation'
import AddPoliceCustodySuiteView from './addPoliceCustodySuiteView'
import addPoliceCustodySuiteMapper from './addPoliceCustodySuiteMapper'

const registerUrl = '/police-custody-suite-register'

export default class AddPoliceCustodySuiteController {
  constructor(private readonly hmppsAgencyRegisterApiService: HMPPSAgencyRegisterApi) {}

  start(req: Request, res: Response): void {
    const journeyId = randomUUID()
    req.session.addPoliceCustodySuiteJourneys ??= {}
    req.session.addPoliceCustodySuiteJourneys[journeyId] = { form: {}, completedSteps: [] }
    res.redirect(policeCustodySuitePageUrl(journeyId, 'details'))
  }

  cancel(req: Request, res: Response): void {
    if (req.session.addPoliceCustodySuiteJourneys) {
      delete req.session.addPoliceCustodySuiteJourneys[String(req.params.journeyId)]
    }
    res.redirect(registerUrl)
  }

  show(req: Request, res: Response): void {
    const current = this.currentPage(req, res)
    if (!current) return
    const { journey, page, journeyId } = current
    const errors = req.flash('errors').map(error => ({ href: error.href, text: error.text }))
    const view = new AddPoliceCustodySuiteView(journeyId, page, journey, req.query.change === 'true', errors)
    res.render(
      `pages/police-custody-suite-register/create/${page === 'check-answers' ? 'checkAnswers' : 'step'}`,
      view.renderArgs,
    )
  }

  async submit(req: Request, res: Response): Promise<void> {
    const current = this.currentPage(req, res)
    if (!current) return
    const { journey, page, journeyId } = current
    const context = { username: res.locals.user?.username }
    if (page === 'check-answers') {
      for (const step of policeCustodySuiteSteps) {
        // Validate in journey order and stop at the first step needing correction.
        // eslint-disable-next-line no-await-in-loop
        const errors = await validatePoliceCustodySuiteStep(step, journey, this.hmppsAgencyRegisterApiService, context)
        if (errors.length > 0) {
          req.flash('errors', errors)
          journey.completedSteps = journey.completedSteps.filter(completed => completed !== step)
          res.redirect(`${policeCustodySuitePageUrl(journeyId, step)}?change=true`)
          return
        }
      }
      const policeCustodySuite = addPoliceCustodySuiteMapper(journey)
      const result = await this.hmppsAgencyRegisterApiService.createPoliceCustodySuite(context, policeCustodySuite)
      if (result.success === false) {
        req.flash('errors', [{ href: '#create-police-custody-suite', text: result.userMessage }])
        res.redirect(policeCustodySuitePageUrl(journeyId, 'check-answers'))
        return
      }
      delete req.session.addPoliceCustodySuiteJourneys[journeyId]
      res.redirect(
        `${registerUrl}/details?id=${encodeURIComponent(policeCustodySuite.policeCustodySuiteId)}&action=CREATED`,
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
      res.redirect(`${policeCustodySuitePageUrl(journeyId, page)}${changeQuery}`)
      return
    }
    for (const field of fields) {
      const value: unknown = req.body[field]
      journey.form[field] = typeof value === 'string' ? value.trim() : ''
    }
    const errors = await validatePoliceCustodySuiteStep(page, journey, this.hmppsAgencyRegisterApiService, context)
    if (errors.length > 0) {
      req.flash('errors', errors)
      // Keep later answers, but require this step to be corrected before confirmation.
      journey.completedSteps = journey.completedSteps.filter(step => step !== page)
      res.redirect(`${policeCustodySuitePageUrl(journeyId, page)}${changeQuery}`)
      return
    }
    if (!journey.completedSteps.includes(page)) journey.completedSteps.push(page)
    res.redirect(policeCustodySuiteNavigation(journeyId, page, req.query.change === 'true').nextPage)
  }

  private currentPage(
    req: Request,
    res: Response,
  ): { journey: AddPoliceCustodySuiteJourney; page: PoliceCustodySuitePage; journeyId: string } | undefined {
    const journeyId = String(req.params.journeyId)
    const page = String(req.params.step)
    if (!isPoliceCustodySuitePage(page)) throw createError(404, 'Police custody suite creation page not found')
    const journeys = req.session.addPoliceCustodySuiteJourneys
    const journey =
      journeys && Object.prototype.hasOwnProperty.call(journeys, journeyId) ? journeys[journeyId] : undefined
    if (!journey) {
      res.redirect(registerUrl)
      return undefined
    }
    if (!canVisitPoliceCustodySuitePage(journey, page)) {
      res.redirect(policeCustodySuitePageUrl(journeyId, firstIncompleteStep(journey) ?? 'details'))
      return undefined
    }
    return { journey, page, journeyId }
  }
}
