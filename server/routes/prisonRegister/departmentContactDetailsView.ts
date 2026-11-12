import type { DepartmentContactDetailsForm } from 'agencyForms'
import type { DepartmentType } from '../../@types/prisonRegister'
import { departmentName, departmentNames } from './departmentTypes'

type Navigation = {
  cancelButton: string
}

type Mode = 'create' | 'update' | 'delete'

export default class DepartmentContactDetailsView {
  constructor(
    private readonly mode: Mode,
    private readonly prisonName: string,
    private readonly navigation: Navigation,
    private readonly form: DepartmentContactDetailsForm,
    private readonly errors?: Array<Record<string, string>>,
    private readonly availableTypes: DepartmentType[] = [],
  ) {}

  get renderArgs(): {
    mode: Mode
    name: string
    navigation: Navigation
    errors: Array<Record<string, string>>
    form: DepartmentContactDetailsForm
    departmentName: string
    departmentTypeItems: Array<{ value: string; text: string; checked: boolean }>
  } {
    return {
      mode: this.mode,
      name: this.prisonName,
      navigation: this.navigation,
      errors: this.errors || [],
      form: this.form,
      departmentName: this.form.departmentType ? departmentName(this.form.departmentType) : '',
      departmentTypeItems: this.availableTypes.map(type => ({
        value: type,
        text: departmentNames[type],
        checked: this.form.departmentType === type,
      })),
    }
  }
}
