;(function () {
  window.addEventListener('load', function () {
    const original = document.getElementById('payrollRegion')
    const code = document.getElementById('payrollRegionCode')
    const status = document.getElementById('payrollRegion-search-status')
    if (!original || !code) return
    const container = document.createElement('div')
    original.parentNode.insertBefore(container, original)
    const defaultValue = original.value
    original.remove()
    let timer
    let latestQuery = ''
    accessibleAutocomplete({
      element: container,
      id: 'payrollRegion',
      name: 'payrollRegionDescription',
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
            const response = await fetch('/api/search-payroll-region?searchString=' + encodeURIComponent(query))
            if (!response.ok) throw new Error('Payroll region search failed')
            const results = await response.json()
            if (latestQuery === query) {
              status.textContent = ''
              populateResults(results)
            }
          } catch (error) {
            if (latestQuery === query) {
              status.textContent = 'Unable to load payroll regions. Try searching again.'
              populateResults([])
            }
          }
        }, 100)
      },
      templates: {
        inputValue: function (payrollRegion) {
          return payrollRegion ? payrollRegion.description : ''
        },
        suggestion: function (payrollRegion) {
          const element = document.createElement('span')
          element.textContent = payrollRegion.description
          return element.innerHTML
        },
      },
      onConfirm: function (payrollRegion) {
        if (payrollRegion) code.value = payrollRegion.code
      },
    })
    const input = document.getElementById('payrollRegion')
    input.addEventListener('input', function () {
      latestQuery = input.value
      code.value = input.value
    })
    const hint = document.getElementById('payrollRegion-hint')
    const error = document.getElementById('payrollRegion-error')
    input.setAttribute('aria-describedby', [hint && hint.id, error && error.id].filter(Boolean).join(' '))
    if (error) input.classList.add('govuk-input--error')
  })
})()
