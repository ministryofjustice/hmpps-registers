;(function () {
  window.addEventListener('load', function () {
    const original = document.getElementById('localAuthority')
    const code = document.getElementById('localAuthorityCode')
    const status = document.getElementById('localAuthority-search-status')
    if (!original || !code) return
    const container = document.createElement('div')
    original.parentNode.insertBefore(container, original)
    const defaultValue = original.value
    original.remove()
    let timer
    let latestQuery = ''
    accessibleAutocomplete({
      element: container,
      id: 'localAuthority',
      name: 'localAuthorityDescription',
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
            const response = await fetch('/api/search-local-authority?searchString=' + encodeURIComponent(query))
            if (!response.ok) throw new Error('Local authority search failed')
            const results = await response.json()
            if (latestQuery === query) {
              status.textContent = ''
              populateResults(results)
            }
          } catch (error) {
            if (latestQuery === query) {
              status.textContent = 'Unable to load local authorities. Try searching again.'
              populateResults([])
            }
          }
        }, 100)
      },
      templates: {
        inputValue: function (localAuthority) {
          return localAuthority ? localAuthority.description : ''
        },
        suggestion: function (localAuthority) {
          const element = document.createElement('span')
          element.textContent = localAuthority.description
          return element.innerHTML
        },
      },
      onConfirm: function (localAuthority) {
        if (localAuthority) code.value = localAuthority.code
      },
    })
    const input = document.getElementById('localAuthority')
    input.addEventListener('input', function () {
      latestQuery = input.value
      code.value = input.value
    })
    const hint = document.getElementById('localAuthority-hint')
    const error = document.getElementById('localAuthority-error')
    input.setAttribute('aria-describedby', [hint && hint.id, error && error.id].filter(Boolean).join(' '))
    if (error) input.classList.add('govuk-input--error')
  })
})()
