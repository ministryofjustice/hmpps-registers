export default class ControllerHelper {
  public static removeEmptyValues(obj: Record<string, unknown>) {
    return Object.keys(obj)
      .filter(k => obj[k] != null && obj[k] !== '')
      .reduce((a, k) => ({ ...a, [k]: obj[k] }), {})
  }

  public static parseBooleanFromQuery(boolAsString: string | undefined): boolean | undefined {
    if (boolAsString === 'true') return true
    if (boolAsString === 'false') return false
    return undefined
  }

  public static parseStringArrayFromQuery(stringArray: string | string[] | undefined): string[] | undefined {
    if (!stringArray) return undefined
    if (typeof stringArray === 'string') return [stringArray]
    return stringArray
  }
}
