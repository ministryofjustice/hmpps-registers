import { otherAgencyTypes } from '../otherAgencyData'
import { accessibleAccessOptions } from '../../courtRegister/accessibleAccessData'
import {
  AddOtherAgencyJourney,
  OtherAgencyPage,
  otherAgencyNavigation,
  otherAgencyPageUrl,
  otherAgencySteps,
  isReferenceStep,
  referenceSteps,
} from './addOtherAgencyFlowControl'
import { OtherAgencyFormError } from './addOtherAgencyValidation'

const titles = {
  details: 'Enter other agency details',
  'agency-type': 'Select agency type',
  'cjit-code': 'Enter CJIT code',
  'accessible-access': 'Select accessible access',
  area: 'Select area',
  region: 'Select region',
  'geographical-area': 'Select geographical area',
  'local-authority': 'Select local authority',
  'payroll-region': 'Select payroll region',
  'check-answers': 'Check your answers before adding an other agency',
} satisfies Record<OtherAgencyPage, string>

export default class AddOtherAgencyView {
  constructor(
    private readonly journeyId: string,
    private readonly page: OtherAgencyPage,
    private readonly journey: AddOtherAgencyJourney,
    private readonly changing: boolean,
    private readonly errors: OtherAgencyFormError[],
  ) {}

  get renderArgs() {
    const { form } = this.journey
    const reference = isReferenceStep(this.page) ? referenceSteps[this.page] : undefined
    const answers: Array<{ field: string; label: string; value: string | undefined; page: OtherAgencyPage }> = [
      {
        field: 'agencyId',
        label: 'Agency ID',
        value: form.agencyId,
        page: 'details',
      },
      { field: 'agencyName', label: 'Name', value: form.agencyName, page: 'details' },
      { field: 'description', label: 'Description', value: form.description, page: 'details' },
      {
        field: 'agencyType',
        label: 'Agency type',
        value: otherAgencyTypes.find(type => type.value === form.agencyType)?.description,
        page: 'agency-type',
      },
      { field: 'cjitCode', label: 'CJIT code', value: form.cjitCode, page: 'cjit-code' },
      {
        field: 'accessibleAccess',
        label: 'Accessible access',
        value: accessibleAccessOptions.find(option => option.value === form.accessibleAccess)?.text,
        page: 'accessible-access',
      },
      ...otherAgencySteps.filter(isReferenceStep).map(page => {
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
            href: `${otherAgencyPageUrl(this.journeyId, row.page)}?change=true`,
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
      navigation: otherAgencyNavigation(this.journeyId, this.page, this.changing),
      reference: reference
        ? {
            ...reference,
            code: form[`${reference.field}Code`],
            description: form[`${reference.field}Description`],
            inputLabel: reference.label.charAt(0).toUpperCase() + reference.label.slice(1),
          }
        : undefined,
      rows,
      agencyTypeOptions: otherAgencyTypes.map(type => ({
        value: type.value,
        text: type.description,
        checked: type.value === form.agencyType,
      })),
      accessibleAccessOptions: accessibleAccessOptions.map(option => ({
        ...option,
        checked: option.value === (form.accessibleAccess || 'UNKNOWN'),
      })),
      mainDetailsRows: rows.filter((row, index) => !isReferenceStep(answers[index].page)),
      areaAndRegionRows: rows.filter((row, index) => isReferenceStep(answers[index].page)),
    }
  }
}
