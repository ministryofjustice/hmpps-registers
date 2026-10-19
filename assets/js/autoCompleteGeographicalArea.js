;(function () {
  window.addEventListener('load', function () {
    const original = document.getElementById('geographicalArea')
    const code = document.getElementById('geographicalAreaCode')
    const status = document.getElementById('geographicalArea-search-status')
    if (!original || !code) return
    const container = document.createElement('div')
    original.parentNode.insertBefore(container, original)
    const defaultValue = original.value
    original.remove()
    let timer
    let latestQuery = ''
    accessibleAutocomplete({
      element: container,
      id: 'geographicalArea',
      name: 'geographicalAreaDescription',
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
            if (!response.ok) throw new Error('Geographical area search failed')
            const results = await response.json()
            if (latestQuery === query) {
              status.textContent = ''
              populateResults(results)
            }
          } catch (error) {
            if (latestQuery === query) {
              status.textContent = 'Unable to load geographical areas. Try searching again.'
              populateResults([])
            }
          }
        }, 100)
      },
      templates: {
        inputValue: function (geographicalArea) {
          return geographicalArea ? geographicalArea.description : ''
        },
        suggestion: function (geographicalArea) {
          const element = document.createElement('span')
          element.textContent = geographicalArea.description
          return element.innerHTML
        },
      },
      onConfirm: function (geographicalArea) {
        if (geographicalArea) code.value = geographicalArea.code
      },
    })
    const input = document.getElementById('geographicalArea')
    input.addEventListener('input', function () {
      latestQuery = input.value
      code.value = input.value
    })
    const hint = document.getElementById('geographicalArea-hint')
    const error = document.getElementById('geographicalArea-error')
    input.setAttribute('aria-describedby', [hint && hint.id, error && error.id].filter(Boolean).join(' '))
    if (error) input.classList.add('govuk-input--error')
  })
})()
