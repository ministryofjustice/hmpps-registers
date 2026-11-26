import { accessibleAccessOptions } from '../../courtRegister/accessibleAccessData'
import {
  AddApprovedPremisesJourney,
  ApprovedPremisesPage,
  approvedPremisesNavigation,
  approvedPremisesPageUrl,
  approvedPremisesSteps,
  isReferenceStep,
  referenceSteps,
} from './addApprovedPremisesFlowControl'
import { ApprovedPremisesFormError } from './addApprovedPremisesValidation'

const titles = {
  details: 'Enter approved premises details',
  'cjit-code': 'Enter CJIT code',
  'accessible-access': 'Select accessible access',
  area: 'Select area',
  region: 'Select region',
  'geographical-area': 'Select geographical area',
  'local-authority': 'Select local authority',
  'payroll-region': 'Select payroll region',
  'check-answers': 'Check your answers before adding a approved premises',
} satisfies Record<ApprovedPremisesPage, string>

export default class AddApprovedPremisesView {
  constructor(
    private readonly journeyId: string,
    private readonly page: ApprovedPremisesPage,
    private readonly journey: AddApprovedPremisesJourney,
    private readonly changing: boolean,
    private readonly errors: ApprovedPremisesFormError[],
  ) {}

  get renderArgs() {
    const { form } = this.journey
    const reference = isReferenceStep(this.page) ? referenceSteps[this.page] : undefined
    const answers: Array<{ field: string; label: string; value: string | undefined; page: ApprovedPremisesPage }> = [
      {
        field: 'approvedPremisesId',
        label: 'Approved premises ID',
        value: form.approvedPremisesId,
        page: 'details',
      },
      { field: 'approvedPremisesName', label: 'Name', value: form.approvedPremisesName, page: 'details' },
      { field: 'description', label: 'Description', value: form.description, page: 'details' },
      { field: 'contact', label: 'Contact', value: form.contact, page: 'details' },
      { field: 'cjitCode', label: 'CJIT code', value: form.cjitCode, page: 'cjit-code' },
      {
        field: 'accessibleAccess',
        label: 'Accessible access',
        value: accessibleAccessOptions.find(option => option.value === form.accessibleAccess)?.text,
        page: 'accessible-access',
      },
      ...approvedPremisesSteps.filter(isReferenceStep).map(page => {
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
            href: `${approvedPremisesPageUrl(this.journeyId, row.page)}?change=true`,
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
      navigation: approvedPremisesNavigation(this.journeyId, this.page, this.changing),
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
