export default function initialiseReferenceAutocomplete(field, endpoint, failureMessage) {
  window.addEventListener('load', function () {
    const original = document.getElementById(field)
    const code = document.getElementById(field + 'Code')
    const status = document.getElementById(field + '-search-status')
    if (!original || !code || !status) return
    const container = document.createElement('div')
    original.parentNode.insertBefore(container, original)
    const defaultValue = original.value
    original.remove()
    let timer
    let latestQuery = ''
    accessibleAutocomplete({
      element: container,
      id: field,
      name: field + 'Description',
      defaultValue,
      confirmOnBlur: false,
      minLength: 2,
      displayMenu: 'overlay',
      inputClasses: 'govuk-input',
      menuClasses: 'govuk-body',
      source: function (query, populateResults) {
        latestQuery = query
        clearTimeout(timer)
        timer = setTimeout(async function () {
          try {
            const response = await fetch(endpoint + '?searchString=' + encodeURIComponent(query))
            if (!response.ok) throw new Error(failureMessage)
            const results = await response.json()
            if (latestQuery === query) {
              status.textContent = ''
              populateResults(results)
            }
          } catch (error) {
            if (latestQuery === query) {
              status.textContent = failureMessage
              populateResults([])
            }
          }
        }, 100)
      },
      templates: {
        inputValue: function (data) {
          if (typeof data === 'string') return data
          return data ? data.description : ''
        },
        suggestion: function (data) {
          const element = document.createElement('span')
          if (typeof data === 'string') {
            element.textContent = data
          } else {
            element.textContent = data.description
          }
          return element.innerHTML
        },
      },
      onConfirm: function (data) {
        if (data) code.value = data.code
      },
    })
    const input = document.getElementById(field)
    input.addEventListener('input', function () {
      latestQuery = input.value
      code.value = ''
      status.textContent = ''
    })
    const hint = document.getElementById(field + '-hint')
    const error = document.getElementById(field + '-error')
    input.setAttribute('aria-describedby', [hint && hint.id, error && error.id].filter(Boolean).join(' '))
    if (error) input.classList.add('govuk-input--error')
  })
}
