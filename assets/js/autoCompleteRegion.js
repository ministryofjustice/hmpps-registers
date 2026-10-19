;(function () {
  window.addEventListener('load', function () {
    const original = document.getElementById('region')
    const code = document.getElementById('regionCode')
    const status = document.getElementById('region-search-status')
    if (!original || !code) return
    const container = document.createElement('div')
    original.parentNode.insertBefore(container, original)
    const defaultValue = original.value
    original.remove()
    let timer
    let latestQuery = ''
    accessibleAutocomplete({
      element: container,
      id: 'region',
      name: 'regionDescription',
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
            const response = await fetch('/api/search-region?searchString=' + encodeURIComponent(query))
            if (!response.ok) throw new Error('Region search failed')
            const results = await response.json()
            if (latestQuery === query) {
              status.textContent = ''
              populateResults(results)
            }
          } catch (error) {
            if (latestQuery === query) {
              status.textContent = 'Unable to load regions. Try searching again.'
              populateResults([])
            }
          }
        }, 100)
      },
      templates: {
        inputValue: function (region) {
          return region ? region.description : ''
        },
        suggestion: function (region) {
          const element = document.createElement('span')
          element.textContent = region.description
          return element.innerHTML
        },
      },
      onConfirm: function (region) {
        if (region) code.value = region.code
      },
    })
    const input = document.getElementById('region')
    input.addEventListener('input', function () {
      latestQuery = input.value
      code.value = input.value
    })
    const hint = document.getElementById('region-hint')
    const error = document.getElementById('region-error')
    input.setAttribute('aria-describedby', [hint && hint.id, error && error.id].filter(Boolean).join(' '))
    if (error) input.classList.add('govuk-input--error')
  })
})()
