export type PageMetaData = {
  first: boolean
  last: boolean
  empty: boolean
  totalPages: number
  totalElements: number
  pageNumber: number
  pageSize: number
  elementsOnPage: number
  hrefTemplate: string
}

export function toPageMetaData(
  first: boolean,
  last: boolean,
  empty: boolean,
  totalPages: number,
  totalElements: number,
  pageNumber: number,
  pageSize: number,
  elementsOnPage: number,
  hrefTemplate: string,
): PageMetaData {
  return {
    first,
    last,
    empty,
    totalPages,
    totalElements,
    pageNumber,
    pageSize,
    elementsOnPage,
    hrefTemplate,
  }
}
