import { format, parseISO } from 'date-fns'
import type { UpdateActiveForm } from 'agencyForms'

type Navigation = {
  cancelButton: string
}

export default class UpdateAgencyActiveView {
  constructor(
    private readonly name: string,
    private readonly navigation: Navigation,
    private readonly active: boolean,
    private readonly inactiveDate?: string | null,
    private readonly errors?: Array<Record<string, string>>,
    private readonly form?: UpdateActiveForm,
  ) {}

  get renderArgs() {
    const date = this.inactiveDate ? parseISO(this.inactiveDate) : new Date()
    return {
      name: this.name,
      navigation: this.navigation,
      errors: this.errors || [],
      form: this.form ?? {
        active: String(this.active),
        inactiveDay: format(date, 'd'),
        inactiveMonth: format(date, 'M'),
        inactiveYear: format(date, 'yyyy'),
      },
    }
  }
}
