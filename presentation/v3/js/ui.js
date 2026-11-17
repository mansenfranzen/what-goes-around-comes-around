export function icon(name, className = '') {
  return `<svg class="artifact ${className}" aria-hidden="true" viewBox="0 0 120 100" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><use href="assets/symbols.svg#${name}"></use></svg>`;
}

export function button(action, label, options = '') {
  return `<button type="button" data-action="${action}" ${options}>${label}</button>`;
}

export function table(headers, rows, className = '') {
  return `<div class="table-wrap"><table class="${className}"><thead><tr>${headers.map(h => `<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

export function feedback(text, success = false) {
  return `<p class="feedback ${success ? 'success' : ''}" role="status">${success ? '<span aria-hidden="true">✓</span> ' : ''}${text}</p>`;
}

// Keep keyboard focus when an experiment redraws its controls.
export function painter(root) {
  return html => {
    const active = root.contains(document.activeElement) ? document.activeElement : null;
    const key = active?.dataset.action;
    const id = active?.id;
    if (active?.matches('input[type="range"]') && id) {
      const template = document.createElement('template');
      template.innerHTML = html;
      // Keep the live slider and its ancestor branch attached so pointer
      // capture survives input events. Slider control layouts stay stable.
      function updateAroundSlider(current, next) {
        const oldChildren = [...current.childNodes], newChildren = [...next.childNodes];
        if (oldChildren.length !== newChildren.length) throw new Error('A slider redraw changed its control layout.');
        oldChildren.forEach((child, i) => {
          if (child === active) { active.value = newChildren[i].value; return; }
          if (child.nodeType === 1 && child.contains(active)) updateAroundSlider(child, newChildren[i]);
          else child.replaceWith(newChildren[i]);
        });
      }
      updateAroundSlider(root, template.content);
      return;
    }
    root.innerHTML = html;
    const replacement = id ? root.querySelector(`#${id}`) : key ? [...root.querySelectorAll('[data-action]')].find(el => el.dataset.action === key) : null;
    replacement?.focus({ preventScroll: true });
  };
}
