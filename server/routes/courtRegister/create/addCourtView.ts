import { allCourtTypes } from '../courtData'
import { accessibleAccessOptions } from '../accessibleAccessData'
import {
  AddCourtJourney,
  CourtPage,
  courtNavigation,
  courtPageUrl,
  courtSteps,
  isReferenceStep,
  referenceSteps,
} from './addCourtFlowControl'
import { CourtFormError } from './addCourtValidation'

const titles = {
  details: 'Enter court details',
  'court-type': 'Select court type',
  'accessible-access': 'Select accessible access',
  'cjit-code': 'Enter CJIT code',
  area: 'Select area',
  region: 'Select region',
  'geographical-area': 'Select geographical area',
  'local-authority': 'Select local authority',
  'payroll-region': 'Select payroll region',
  'check-answers': 'Check your answers before adding a court',
} satisfies Record<CourtPage, string>

export default class AddCourtView {
  constructor(
    private readonly journeyId: string,
    private readonly page: CourtPage,
    private readonly journey: AddCourtJourney,
    private readonly changing: boolean,
    private readonly errors: CourtFormError[],
  ) {}

  get renderArgs() {
    const { form } = this.journey
    const reference = isReferenceStep(this.page) ? referenceSteps[this.page] : undefined
    const answers: Array<{ field: string; label: string; value: string | undefined; page: CourtPage }> = [
      { field: 'courtId', label: 'Court ID', value: form.courtId, page: 'details' },
      { field: 'courtName', label: 'Name', value: form.courtName, page: 'details' },
      { field: 'description', label: 'Description', value: form.description, page: 'details' },
      {
        field: 'courtType',
        label: 'Court type',
        value: allCourtTypes.find(type => type.code === form.courtType)?.description,
        page: 'court-type',
      },
      {
        field: 'accessibleAccess',
        label: 'Accessible access',
        value: accessibleAccessOptions.find(option => option.value === form.accessibleAccess)?.text,
        page: 'accessible-access',
      },
      { field: 'cjitCode', label: 'CJIT code', value: form.cjitCode, page: 'cjit-code' },
      ...courtSteps.filter(isReferenceStep).map(page => {
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
            href: `${courtPageUrl(this.journeyId, row.page)}?change=true`,
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
      navigation: courtNavigation(this.journeyId, this.page, this.changing),
      courtTypeOptions: allCourtTypes.map(type => ({
        value: type.code,
        text: type.description,
        checked: type.code === form.courtType,
      })),
      accessibleAccessOptions: accessibleAccessOptions.map(option => ({
        ...option,
        checked: option.value === form.accessibleAccess,
      })),
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
