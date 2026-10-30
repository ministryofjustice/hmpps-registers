import {
  AddHospitalJourney,
  HospitalPage,
  hospitalNavigation,
  hospitalPageUrl,
  hospitalSteps,
  isReferenceStep,
  referenceSteps,
} from './addHospitalFlowControl'
import { HospitalFormError } from './addHospitalValidation'

const titles = {
  details: 'Enter hospital details',
  'high-security': 'Select high security',
  'cjit-code': 'Enter CJIT code',
  area: 'Select area',
  region: 'Select region',
  'geographical-area': 'Select geographical area',
  'local-authority': 'Select local authority',
  'payroll-region': 'Select payroll region',
  'check-answers': 'Check your answers before adding a hospital',
} satisfies Record<HospitalPage, string>

export default class AddHospitalView {
  constructor(
    private readonly journeyId: string,
    private readonly page: HospitalPage,
    private readonly journey: AddHospitalJourney,
    private readonly changing: boolean,
    private readonly errors: HospitalFormError[],
  ) {}

  get renderArgs() {
    const { form } = this.journey
    const reference = isReferenceStep(this.page) ? referenceSteps[this.page] : undefined
    const answers: Array<{ field: string; label: string; value: string | undefined; page: HospitalPage }> = [
      { field: 'hospitalId', label: 'Hospital ID', value: form.hospitalId, page: 'details' },
      { field: 'hospitalName', label: 'Name', value: form.hospitalName, page: 'details' },
      { field: 'description', label: 'Description', value: form.description, page: 'details' },
      {
        field: 'highSecurity',
        label: 'High security',
        value: { true: 'Yes', false: 'No' }[form.highSecurity],
        page: 'high-security',
      },
      { field: 'cjitCode', label: 'CJIT code', value: form.cjitCode, page: 'cjit-code' },
      ...hospitalSteps.filter(isReferenceStep).map(page => {
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
            href: `${hospitalPageUrl(this.journeyId, row.page)}?change=true`,
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
      navigation: hospitalNavigation(this.journeyId, this.page, this.changing),
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
