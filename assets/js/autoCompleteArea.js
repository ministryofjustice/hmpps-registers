;(function () {
  window.addEventListener('load', function () {
    const original = document.getElementById('area')
    const code = document.getElementById('areaCode')
    const status = document.getElementById('area-search-status')
    if (!original || !code) return
    const container = document.createElement('div')
    original.parentNode.insertBefore(container, original)
    const defaultValue = original.value
    original.remove()
    let timer
    let latestQuery = ''
    accessibleAutocomplete({
      element: container,
      id: 'area',
      name: 'areaDescription',
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
            const response = await fetch('/api/search-area?searchString=' + encodeURIComponent(query))
            if (!response.ok) throw new Error('Area search failed')
            const results = await response.json()
            if (latestQuery === query) {
              status.textContent = ''
              populateResults(results)
            }
          } catch (error) {
            if (latestQuery === query) {
              status.textContent = 'Unable to load areas. Try searching again.'
              populateResults([])
            }
          }
        }, 100)
      },
      templates: {
        inputValue: function (area) {
          return area ? area.description : ''
        },
        suggestion: function (area) {
          const element = document.createElement('span')
          element.textContent = area.description
          return element.innerHTML
        },
      },
      onConfirm: function (area) {
        if (area) code.value = area.code
      },
    })
    const input = document.getElementById('area')
    input.addEventListener('input', function () {
      latestQuery = input.value
      code.value = input.value
    })
    const hint = document.getElementById('area-hint')
    const error = document.getElementById('area-error')
    input.setAttribute('aria-describedby', [hint && hint.id, error && error.id].filter(Boolean).join(' '))
    if (error) input.classList.add('govuk-input--error')
  })
})()
