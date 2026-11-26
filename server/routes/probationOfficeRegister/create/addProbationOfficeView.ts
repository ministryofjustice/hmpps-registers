import { accessibleAccessOptions } from '../../courtRegister/accessibleAccessData'
import {
  AddProbationOfficeJourney,
  ProbationOfficePage,
  probationOfficeNavigation,
  probationOfficePageUrl,
  probationOfficeSteps,
  isReferenceStep,
  referenceSteps,
} from './addProbationOfficeFlowControl'
import { ProbationOfficeFormError } from './addProbationOfficeValidation'

const titles = {
  details: 'Enter probation office details',
  'cjit-code': 'Enter CJIT code',
  'accessible-access': 'Select accessible access',
  area: 'Select area',
  region: 'Select region',
  'geographical-area': 'Select geographical area',
  'local-authority': 'Select local authority',
  'payroll-region': 'Select payroll region',
  'check-answers': 'Check your answers before adding a probation office',
} satisfies Record<ProbationOfficePage, string>

export default class AddProbationOfficeView {
  constructor(
    private readonly journeyId: string,
    private readonly page: ProbationOfficePage,
    private readonly journey: AddProbationOfficeJourney,
    private readonly changing: boolean,
    private readonly errors: ProbationOfficeFormError[],
  ) {}

  get renderArgs() {
    const { form } = this.journey
    const reference = isReferenceStep(this.page) ? referenceSteps[this.page] : undefined
    const answers: Array<{ field: string; label: string; value: string | undefined; page: ProbationOfficePage }> = [
      {
        field: 'probationOfficeId',
        label: 'Probation office ID',
        value: form.probationOfficeId,
        page: 'details',
      },
      { field: 'probationOfficeName', label: 'Name', value: form.probationOfficeName, page: 'details' },
      { field: 'description', label: 'Description', value: form.description, page: 'details' },
      { field: 'contact', label: 'Contact', value: form.contact, page: 'details' },
      { field: 'cjitCode', label: 'CJIT code', value: form.cjitCode, page: 'cjit-code' },
      {
        field: 'accessibleAccess',
        label: 'Accessible access',
        value: accessibleAccessOptions.find(option => option.value === form.accessibleAccess)?.text,
        page: 'accessible-access',
      },
      ...probationOfficeSteps.filter(isReferenceStep).map(page => {
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
            href: `${probationOfficePageUrl(this.journeyId, row.page)}?change=true`,
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
      navigation: probationOfficeNavigation(this.journeyId, this.page, this.changing),
      reference: reference
        ? {
            ...reference,
            code: form[`${reference.field}Code`],
            description: form[`${reference.field}Description`],
            inputLabel: reference.label.charAt(0).toUpperCase() + reference.label.slice(1),
          }
        : undefined,
      rows,
      accessibleAccessOptions: accessibleAccessOptions.map(option => ({
        ...option,
        checked: option.value === (form.accessibleAccess || 'UNKNOWN'),
      })),
      mainDetailsRows: rows.filter((row, index) => !isReferenceStep(answers[index].page)),
      areaAndRegionRows: rows.filter((row, index) => isReferenceStep(answers[index].page)),
    }
  }
}
