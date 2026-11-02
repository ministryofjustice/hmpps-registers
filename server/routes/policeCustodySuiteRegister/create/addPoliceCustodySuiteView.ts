import {
  AddPoliceCustodySuiteJourney,
  PoliceCustodySuitePage,
  policeCustodySuiteNavigation,
  policeCustodySuitePageUrl,
  policeCustodySuiteSteps,
  isReferenceStep,
  referenceSteps,
} from './addPoliceCustodySuiteFlowControl'
import { PoliceCustodySuiteFormError } from './addPoliceCustodySuiteValidation'

const titles = {
  details: 'Enter police custody suite details',
  'cjit-code': 'Enter CJIT code',
  area: 'Select area',
  region: 'Select region',
  'geographical-area': 'Select geographical area',
  'local-authority': 'Select local authority',
  'payroll-region': 'Select payroll region',
  'check-answers': 'Check your answers before adding a police custody suite',
} satisfies Record<PoliceCustodySuitePage, string>

export default class AddPoliceCustodySuiteView {
  constructor(
    private readonly journeyId: string,
    private readonly page: PoliceCustodySuitePage,
    private readonly journey: AddPoliceCustodySuiteJourney,
    private readonly changing: boolean,
    private readonly errors: PoliceCustodySuiteFormError[],
  ) {}

  get renderArgs() {
    const { form } = this.journey
    const reference = isReferenceStep(this.page) ? referenceSteps[this.page] : undefined
    const answers: Array<{ field: string; label: string; value: string | undefined; page: PoliceCustodySuitePage }> = [
      {
        field: 'policeCustodySuiteId',
        label: 'Police custody suite ID',
        value: form.policeCustodySuiteId,
        page: 'details',
      },
      { field: 'policeCustodySuiteName', label: 'Name', value: form.policeCustodySuiteName, page: 'details' },
      { field: 'description', label: 'Description', value: form.description, page: 'details' },
      { field: 'cjitCode', label: 'CJIT code', value: form.cjitCode, page: 'cjit-code' },
      ...policeCustodySuiteSteps.filter(isReferenceStep).map(page => {
        const { field, label } = referenceSteps[page]
        return {
          field,
          label: label.charAt(0).toUpperCase() + label.slice(1),
          value: form[`${field}Description`],
          page,
        }
      }),
    ]
    const rows = answers.map(row => ({
      key: { text: row.label },
      value: { text: row.value || 'Not provided' },
      actions: {
        items: [
          {
            href: `${policeCustodySuitePageUrl(this.journeyId, row.page)}?change=true`,
            text: 'Change',
            visuallyHiddenText: row.label.toLowerCase(),
            attributes: { 'data-qa': `change-${row.field}-link` },
          },
        ],
      },
    }))
    return {
      page: this.page,
      title: titles[this.page],
      form,
      errors: this.errors,
      changing: this.changing,
      navigation: policeCustodySuiteNavigation(this.journeyId, this.page, this.changing),
      reference: reference
        ? {
            ...reference,
            code: form[`${reference.field}Code`],
            description: form[`${reference.field}Description`],
            inputLabel: reference.label.charAt(0).toUpperCase() + reference.label.slice(1),
          }
        : undefined,
      rows,
      mainDetailsRows: rows.filter((row, index) => !isReferenceStep(answers[index].page)),
      areaAndRegionRows: rows.filter((row, index) => isReferenceStep(answers[index].page)),
    }
  }
}
