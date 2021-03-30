export type PageMetaData = {
  first: boolean
  last: boolean
  empty: boolean
  totalPages: number
  totalElements: number
  pageNumber: number
  pageSize: number
  elementsOnPage: number
}

export function springPageToPageMetaData(
  first: boolean,
  last: boolean,
  empty: boolean,
  totalPages: number,
  totalElements: number,
  pageNumber: number,
  pageSize: number,
  elementsOnPage: number
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
  }
}
