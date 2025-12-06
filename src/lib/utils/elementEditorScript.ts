/**
 * Element Editor Script Generator
 * Responsibility: Generate the JavaScript that gets injected into the iframe
 * for enabling direct element editing capabilities
 */

export function generateEditorScript(): string {
  return `
(function() {
  // Prevent double initialization
  if (window.__elementEditorInitialized) return;
  window.__elementEditorInitialized = true;

  // State
  let selectedElement = null;
  let toolbar = null;
  let isEditing = false;
  let isAiEditing = false;
  let aiPromptInput = null;

  // Elements that should not be selectable
  const IGNORE_SELECTORS = ['html', 'head', 'body', 'script', 'style', 'meta', 'link', 'title'];
  const IGNORE_CLASSES = ['element-editor-toolbar', 'element-editor-overlay'];

  // Create and inject styles
  const styles = document.createElement('style');
  styles.textContent = \`
    .element-editor-hover {
      outline: 2px dashed rgba(251, 191, 36, 0.6) !important;
      outline-offset: 2px !important;
      cursor: pointer !important;
    }
    
    .element-editor-selected {
      outline: 2px solid #f59e0b !important;
      outline-offset: 2px !important;
    }
    
    .element-editor-toolbar {
      position: fixed;
      z-index: 999999;
      background: #18181b;
      border: 1px solid #3f3f46;
      border-radius: 8px;
      padding: 8px;
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
      max-width: 320px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    .element-editor-toolbar button {
      background: #27272a;
      border: 1px solid #3f3f46;
      color: #e4e4e7;
      padding: 6px 10px;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: all 0.15s ease;
    }
    
    .element-editor-toolbar button:hover {
      background: #3f3f46;
      border-color: #52525b;
    }
    
    .element-editor-toolbar button.active {
      background: #f59e0b;
      border-color: #f59e0b;
      color: #18181b;
    }
    
    .element-editor-toolbar button.danger {
      color: #ef4444;
    }
    
    .element-editor-toolbar button.danger:hover {
      background: #ef4444;
      color: white;
      border-color: #ef4444;
    }
    
    .element-editor-toolbar input {
      background: #27272a;
      border: 1px solid #3f3f46;
      color: #e4e4e7;
      padding: 6px 10px;
      border-radius: 4px;
      font-size: 12px;
      width: 100%;
      margin-top: 4px;
    }
    
    .element-editor-toolbar input:focus {
      outline: none;
      border-color: #f59e0b;
    }
    
    .element-editor-toolbar .toolbar-section {
      display: flex;
      gap: 4px;
      padding: 4px 0;
      border-top: 1px solid #3f3f46;
      width: 100%;
      margin-top: 4px;
    }
    
    .element-editor-toolbar .toolbar-section:first-child {
      border-top: none;
      margin-top: 0;
      padding-top: 0;
    }
    
    .element-editor-toolbar .toolbar-label {
      font-size: 10px;
      color: #71717a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      width: 100%;
      margin-bottom: 4px;
    }
    
    .element-editor-toolbar .color-input {
      width: 32px;
      height: 32px;
      padding: 2px;
      border-radius: 4px;
      cursor: pointer;
    }
    
    [contenteditable="true"] {
      outline: 2px solid #f59e0b !important;
      outline-offset: 2px !important;
      min-height: 1em;
    }
    
    [contenteditable="true"]:focus {
      outline: 2px solid #22c55e !important;
    }
  \`;
  document.head.appendChild(styles);

  // Helper: Check if element should be ignored
  function shouldIgnoreElement(el) {
    if (!el || !el.tagName) return true;
    const tagName = el.tagName.toLowerCase();
    if (IGNORE_SELECTORS.includes(tagName)) return true;
    if (IGNORE_CLASSES.some(cls => el.classList && el.classList.contains(cls))) return true;
    return false;
  }

  // Helper: Get element path for identification
  function getElementPath(el) {
    const path = [];
    while (el && el !== document.body) {
      let selector = el.tagName.toLowerCase();
      if (el.id) {
        selector += '#' + el.id;
      } else if (el.className && typeof el.className === 'string') {
        const classes = el.className.split(' ').filter(c => !c.startsWith('element-editor-'));
        if (classes.length) {
          selector += '.' + classes.join('.');
        }
      }
      const siblings = el.parentNode ? Array.from(el.parentNode.children).filter(c => c.tagName === el.tagName) : [];
      if (siblings.length > 1) {
        selector += ':nth-of-type(' + (siblings.indexOf(el) + 1) + ')';
      }
      path.unshift(selector);
      el = el.parentNode;
    }
    return path.join(' > ');
  }

  // Helper: Send message to parent
  function sendToParent(type, payload) {
    window.parent.postMessage({ source: 'element-editor', type, payload }, '*');
  }

  // Helper: Get computed styles for element
  function getElementStyles(el) {
    const computed = window.getComputedStyle(el);
    return {
      color: computed.color,
      backgroundColor: computed.backgroundColor,
      fontSize: computed.fontSize,
      fontWeight: computed.fontWeight,
      textAlign: computed.textAlign,
    };
  }

  // Create toolbar
  function createToolbar() {
    if (toolbar) toolbar.remove();
    
    toolbar = document.createElement('div');
    toolbar.className = 'element-editor-toolbar';
    document.body.appendChild(toolbar);
    
    return toolbar;
  }

  // Update toolbar content based on selected element
  function updateToolbar(el) {
    if (!toolbar || !el) return;
    
    const tagName = el.tagName.toLowerCase();
    const isImage = tagName === 'img';
    const isLink = tagName === 'a';
    const styles = getElementStyles(el);
    
    toolbar.innerHTML = '';
    
    // Text editing section
    const textSection = document.createElement('div');
    textSection.className = 'toolbar-section';
    textSection.style.flexDirection = 'column';
    
    if (!isImage) {
      const textLabel = document.createElement('div');
      textLabel.className = 'toolbar-label';
      textLabel.textContent = 'Text';
      textSection.appendChild(textLabel);
      
      const textButtons = document.createElement('div');
      textButtons.style.display = 'flex';
      textButtons.style.gap = '4px';
      
      const editTextBtn = document.createElement('button');
      editTextBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg> Edit';
      editTextBtn.onclick = () => startTextEdit(el);
      textButtons.appendChild(editTextBtn);
      
      textSection.appendChild(textButtons);
    }
    
    toolbar.appendChild(textSection);
    
    // Image section
    if (isImage) {
      const imgSection = document.createElement('div');
      imgSection.className = 'toolbar-section';
      imgSection.style.flexDirection = 'column';
      
      const imgLabel = document.createElement('div');
      imgLabel.className = 'toolbar-label';
      imgLabel.textContent = 'Image Source';
      imgSection.appendChild(imgLabel);
      
      const imgInput = document.createElement('input');
      imgInput.type = 'text';
      imgInput.value = el.src || '';
      imgInput.placeholder = 'Enter image URL...';
      imgInput.onchange = () => {
        el.src = imgInput.value;
        notifyChange();
      };
      imgSection.appendChild(imgInput);
      
      const altLabel = document.createElement('div');
      altLabel.className = 'toolbar-label';
      altLabel.textContent = 'Alt Text';
      altLabel.style.marginTop = '8px';
      imgSection.appendChild(altLabel);
      
      const altInput = document.createElement('input');
      altInput.type = 'text';
      altInput.value = el.alt || '';
      altInput.placeholder = 'Enter alt text...';
      altInput.onchange = () => {
        el.alt = altInput.value;
        notifyChange();
      };
      imgSection.appendChild(altInput);
      
      toolbar.appendChild(imgSection);
    }
    
    // Link section
    if (isLink) {
      const linkSection = document.createElement('div');
      linkSection.className = 'toolbar-section';
      linkSection.style.flexDirection = 'column';
      
      const linkLabel = document.createElement('div');
      linkLabel.className = 'toolbar-label';
      linkLabel.textContent = 'Link URL';
      linkSection.appendChild(linkLabel);
      
      const linkInput = document.createElement('input');
      linkInput.type = 'text';
      linkInput.value = el.href || '';
      linkInput.placeholder = 'Enter URL...';
      linkInput.onchange = () => {
        el.href = linkInput.value;
        notifyChange();
      };
      linkSection.appendChild(linkInput);
      
      toolbar.appendChild(linkSection);
    }
    
    // Style section
    const styleSection = document.createElement('div');
    styleSection.className = 'toolbar-section';
    styleSection.style.flexDirection = 'column';
    
    const styleLabel = document.createElement('div');
    styleLabel.className = 'toolbar-label';
    styleLabel.textContent = 'Styles';
    styleSection.appendChild(styleLabel);
    
    const styleButtons = document.createElement('div');
    styleButtons.style.display = 'flex';
    styleButtons.style.gap = '4px';
    styleButtons.style.flexWrap = 'wrap';
    styleButtons.style.alignItems = 'center';
    
    // Text color
    if (!isImage) {
      const colorLabel = document.createElement('span');
      colorLabel.style.fontSize = '11px';
      colorLabel.style.color = '#a1a1aa';
      colorLabel.textContent = 'Text:';
      styleButtons.appendChild(colorLabel);
      
      const colorInput = document.createElement('input');
      colorInput.type = 'color';
      colorInput.className = 'color-input';
      colorInput.value = rgbToHex(styles.color);
      colorInput.onchange = () => {
        el.style.color = colorInput.value;
        notifyChange();
      };
      styleButtons.appendChild(colorInput);
    }
    
    // Background color
    const bgLabel = document.createElement('span');
    bgLabel.style.fontSize = '11px';
    bgLabel.style.color = '#a1a1aa';
    bgLabel.style.marginLeft = '8px';
    bgLabel.textContent = 'BG:';
    styleButtons.appendChild(bgLabel);
    
    const bgInput = document.createElement('input');
    bgInput.type = 'color';
    bgInput.className = 'color-input';
    bgInput.value = rgbToHex(styles.backgroundColor);
    bgInput.onchange = () => {
      el.style.backgroundColor = bgInput.value;
      notifyChange();
    };
    styleButtons.appendChild(bgInput);
    
    styleSection.appendChild(styleButtons);
    
    // Font size controls
    if (!isImage) {
      const sizeRow = document.createElement('div');
      sizeRow.style.display = 'flex';
      sizeRow.style.gap = '4px';
      sizeRow.style.marginTop = '8px';
      sizeRow.style.alignItems = 'center';
      
      const sizeLabel = document.createElement('span');
      sizeLabel.style.fontSize = '11px';
      sizeLabel.style.color = '#a1a1aa';
      sizeLabel.textContent = 'Size:';
      sizeRow.appendChild(sizeLabel);
      
      const decreaseBtn = document.createElement('button');
      decreaseBtn.textContent = '-';
      decreaseBtn.onclick = () => {
        const currentSize = parseFloat(window.getComputedStyle(el).fontSize);
        el.style.fontSize = (currentSize - 2) + 'px';
        notifyChange();
      };
      sizeRow.appendChild(decreaseBtn);
      
      const increaseBtn = document.createElement('button');
      increaseBtn.textContent = '+';
      increaseBtn.onclick = () => {
        const currentSize = parseFloat(window.getComputedStyle(el).fontSize);
        el.style.fontSize = (currentSize + 2) + 'px';
        notifyChange();
      };
      sizeRow.appendChild(increaseBtn);
      
      // Text align
      const alignLabel = document.createElement('span');
      alignLabel.style.fontSize = '11px';
      alignLabel.style.color = '#a1a1aa';
      alignLabel.style.marginLeft = '8px';
      alignLabel.textContent = 'Align:';
      sizeRow.appendChild(alignLabel);
      
      ['left', 'center', 'right'].forEach(align => {
        const alignBtn = document.createElement('button');
        alignBtn.innerHTML = align === 'left' ? '⊣' : align === 'center' ? '⊢' : '⊢';
        alignBtn.title = align;
        alignBtn.style.padding = '6px 8px';
        if (styles.textAlign === align) alignBtn.classList.add('active');
        alignBtn.onclick = () => {
          el.style.textAlign = align;
          notifyChange();
          updateToolbar(el);
        };
        sizeRow.appendChild(alignBtn);
      });
      
      styleSection.appendChild(sizeRow);
    }
    
    toolbar.appendChild(styleSection);
    
    // AI Edit section
    const aiSection = document.createElement('div');
    aiSection.className = 'toolbar-section';
    aiSection.style.flexDirection = 'column';
    
    const aiLabel = document.createElement('div');
    aiLabel.className = 'toolbar-label';
    aiLabel.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline;vertical-align:middle;margin-right:4px"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg> AI Edit';
    aiSection.appendChild(aiLabel);
    
    const aiInputRow = document.createElement('div');
    aiInputRow.style.display = 'flex';
    aiInputRow.style.gap = '4px';
    
    aiPromptInput = document.createElement('input');
    aiPromptInput.type = 'text';
    aiPromptInput.placeholder = 'Describe changes... (e.g., "make it blue")';
    aiPromptInput.style.flex = '1';
    aiPromptInput.onkeydown = (e) => {
      if (e.key === 'Enter' && aiPromptInput.value.trim()) {
        submitAiEdit(el, aiPromptInput.value.trim());
      }
    };
    aiInputRow.appendChild(aiPromptInput);
    
    const aiSubmitBtn = document.createElement('button');
    aiSubmitBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>';
    aiSubmitBtn.title = 'Apply AI Edit';
    aiSubmitBtn.style.flexShrink = '0';
    aiSubmitBtn.onclick = () => {
      if (aiPromptInput.value.trim()) {
        submitAiEdit(el, aiPromptInput.value.trim());
      }
    };
    aiInputRow.appendChild(aiSubmitBtn);
    
    aiSection.appendChild(aiInputRow);
    toolbar.appendChild(aiSection);

    // Actions section
    const actionsSection = document.createElement('div');
    actionsSection.className = 'toolbar-section';
    
    const duplicateBtn = document.createElement('button');
    duplicateBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
    duplicateBtn.title = 'Duplicate';
    duplicateBtn.onclick = () => {
      const clone = el.cloneNode(true);
      clone.classList.remove('element-editor-selected', 'element-editor-hover');
      el.parentNode.insertBefore(clone, el.nextSibling);
      notifyChange();
    };
    actionsSection.appendChild(duplicateBtn);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'danger';
    deleteBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
    deleteBtn.title = 'Delete';
    deleteBtn.onclick = () => {
      el.remove();
      deselectElement();
      notifyChange();
    };
    actionsSection.appendChild(deleteBtn);
    
    const doneBtn = document.createElement('button');
    doneBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Done';
    doneBtn.style.marginLeft = 'auto';
    doneBtn.onclick = () => deselectElement();
    actionsSection.appendChild(doneBtn);
    
    toolbar.appendChild(actionsSection);
    
    positionToolbar(el);
  }

  // Position toolbar near element
  function positionToolbar(el) {
    if (!toolbar || !el) return;
    
    const rect = el.getBoundingClientRect();
    const toolbarRect = toolbar.getBoundingClientRect();
    
    let top = rect.top - toolbarRect.height - 10;
    let left = rect.left;
    
    // If toolbar would go above viewport, position below element
    if (top < 10) {
      top = rect.bottom + 10;
    }
    
    // Keep toolbar within horizontal bounds
    if (left + toolbarRect.width > window.innerWidth - 10) {
      left = window.innerWidth - toolbarRect.width - 10;
    }
    if (left < 10) left = 10;
    
    // Keep toolbar within vertical bounds
    if (top + toolbarRect.height > window.innerHeight - 10) {
      top = window.innerHeight - toolbarRect.height - 10;
    }
    
    toolbar.style.top = top + 'px';
    toolbar.style.left = left + 'px';
  }

  // RGB to Hex converter
  function rgbToHex(rgb) {
    if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return '#ffffff';
    const match = rgb.match(/^rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)/);
    if (!match) return '#ffffff';
    const hex = (x) => ('0' + parseInt(x).toString(16)).slice(-2);
    return '#' + hex(match[1]) + hex(match[2]) + hex(match[3]);
  }

  // Start text editing
  function startTextEdit(el) {
    if (isEditing) return;
    isEditing = true;
    
    el.contentEditable = 'true';
    el.focus();
    
    // Select all text
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    
    const finishEdit = () => {
      el.contentEditable = 'false';
      isEditing = false;
      el.removeEventListener('blur', finishEdit);
      el.removeEventListener('keydown', handleKeydown);
      notifyChange();
    };
    
    const handleKeydown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        finishEdit();
      }
    };
    
    el.addEventListener('blur', finishEdit);
    el.addEventListener('keydown', handleKeydown);
  }

  // Submit AI edit request
  function submitAiEdit(el, prompt) {
    if (isAiEditing) return;
    isAiEditing = true;

    // Get clean element HTML (without editor classes)
    const clone = el.cloneNode(true);
    clone.classList.remove('element-editor-selected', 'element-editor-hover');
    clone.removeAttribute('contenteditable');
    const elementHtml = clone.outerHTML;
    
    // Get element tag for context
    const tagName = el.tagName.toLowerCase();
    
    // Show loading state
    if (aiPromptInput) {
      aiPromptInput.disabled = true;
      aiPromptInput.value = 'AI is editing...';
    }
    
    // Store reference to element for later update
    window.__pendingAiEditElement = el;
    
    sendToParent('ai-edit-request', {
      elementHtml,
      tagName,
      prompt,
      path: getElementPath(el),
    });
  }

  // Apply AI edit result
  function applyAiEditResult(newHtml) {
    const el = window.__pendingAiEditElement;
    
    if (!el) {
      console.error('AI Edit: No pending element found');
      resetAiEditState();
      return;
    }
    
    if (!newHtml || typeof newHtml !== 'string') {
      console.error('AI Edit: Invalid HTML received', newHtml);
      showAiEditError('No HTML received');
      return;
    }
    
    try {
      // Clean and parse the new HTML
      let cleanHtml = newHtml.trim();
      
      // Create a temporary container to parse the new HTML
      const temp = document.createElement('div');
      temp.innerHTML = cleanHtml;
      
      // Get the first element, handling possible whitespace nodes
      let newElement = temp.firstElementChild;
      
      // If no element found, try wrapping in a span for text-only responses
      if (!newElement && temp.textContent) {
        const wrapper = document.createElement(el.tagName.toLowerCase());
        wrapper.innerHTML = cleanHtml;
        newElement = wrapper;
      }
      
      if (!newElement) {
        console.error('AI Edit: Could not parse HTML', cleanHtml);
        showAiEditError('Invalid HTML returned');
        return;
      }
      
      // Ensure element still has a parent (hasn't been removed)
      if (!el.parentNode) {
        console.error('AI Edit: Element no longer in DOM');
        showAiEditError('Element was removed');
        return;
      }
      
      // Replace the old element with the new one
      el.parentNode.replaceChild(newElement, el);
      
      // Select the new element
      selectedElement = newElement;
      newElement.classList.add('element-editor-selected');
      
      // Update toolbar for new element
      updateToolbar(newElement);
      
      // Notify parent of changes
      notifyChange();
      
      resetAiEditState();
      
    } catch (err) {
      console.error('Failed to apply AI edit:', err);
      showAiEditError('Failed to apply changes');
    }
  }

  // Reset AI edit state
  function resetAiEditState() {
    isAiEditing = false;
    window.__pendingAiEditElement = null;
    if (aiPromptInput) {
      aiPromptInput.disabled = false;
      aiPromptInput.value = '';
    }
  }

  // Show AI edit error
  function showAiEditError(error) {
    resetAiEditState();
    if (aiPromptInput) {
      aiPromptInput.value = '';
      aiPromptInput.placeholder = error || 'Error - try again';
      setTimeout(() => {
        if (aiPromptInput) {
          aiPromptInput.placeholder = 'Describe changes... (e.g., "make it blue")';
        }
      }, 3000);
    }
  }

  // Select element
  function selectElement(el) {
    if (selectedElement) {
      selectedElement.classList.remove('element-editor-selected');
    }
    
    selectedElement = el;
    el.classList.add('element-editor-selected');
    
    createToolbar();
    updateToolbar(el);
    
    sendToParent('element-selected', {
      path: getElementPath(el),
      tagName: el.tagName.toLowerCase(),
    });
  }

  // Deselect element
  function deselectElement() {
    if (selectedElement) {
      selectedElement.classList.remove('element-editor-selected');
      selectedElement = null;
    }
    if (toolbar) {
      toolbar.remove();
      toolbar = null;
    }
    sendToParent('element-deselected', {});
  }

  // Notify parent of changes
  function notifyChange() {
    // Remove editor classes before getting HTML
    const editClasses = ['element-editor-hover', 'element-editor-selected'];
    const elements = document.querySelectorAll('.' + editClasses.join(', .'));
    elements.forEach(el => editClasses.forEach(cls => el.classList.remove(cls)));
    
    // Remove toolbar temporarily
    const toolbarTemp = toolbar;
    if (toolbarTemp) toolbarTemp.remove();
    
    // Remove contenteditable
    const editables = document.querySelectorAll('[contenteditable]');
    editables.forEach(el => el.removeAttribute('contenteditable'));
    
    // Get clean HTML
    const html = document.documentElement.outerHTML;
    
    // Restore toolbar
    if (toolbarTemp) document.body.appendChild(toolbarTemp);
    
    sendToParent('html-changed', { html });
  }

  // Event handlers
  function handleMouseOver(e) {
    if (isEditing) return;
    const el = e.target;
    if (shouldIgnoreElement(el) || el === selectedElement) return;
    el.classList.add('element-editor-hover');
  }

  function handleMouseOut(e) {
    const el = e.target;
    el.classList.remove('element-editor-hover');
  }

  function handleClick(e) {
    if (isEditing) return;
    
    const el = e.target;
    if (shouldIgnoreElement(el)) return;
    if (el.closest('.element-editor-toolbar')) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    if (el === selectedElement) {
      // Double click to edit text
      if (e.detail === 2 && el.tagName.toLowerCase() !== 'img') {
        startTextEdit(el);
      }
    } else {
      selectElement(el);
    }
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') {
      deselectElement();
    }
  }

  // Listen for messages from parent
  window.addEventListener('message', (e) => {
    if (e.data && e.data.source === 'element-editor-parent') {
      switch (e.data.type) {
        case 'disable-edit-mode':
          deselectElement();
          document.removeEventListener('mouseover', handleMouseOver);
          document.removeEventListener('mouseout', handleMouseOut);
          document.removeEventListener('click', handleClick, true);
          document.removeEventListener('keydown', handleKeydown);
          break;
        
        case 'ai-edit-result':
          if (e.data.payload && e.data.payload.success) {
            applyAiEditResult(e.data.payload.html);
          } else {
            showAiEditError(e.data.payload?.error);
          }
          break;
      }
    }
  });

  // Initialize event listeners
  document.addEventListener('mouseover', handleMouseOver);
  document.addEventListener('mouseout', handleMouseOut);
  document.addEventListener('click', handleClick, true);
  document.addEventListener('keydown', handleKeydown);

  // Notify parent that editor is ready
  sendToParent('editor-ready', {});
})();
`;
}

/**
 * Inject the editor script into HTML
 */
export function injectEditorScript(html: string): string {
  const script = `<script>${generateEditorScript()}</script>`;
  
  // Try to insert before </body>
  if (html.includes('</body>')) {
    return html.replace('</body>', `${script}</body>`);
  }
  
  // Try to insert before </html>
  if (html.includes('</html>')) {
    return html.replace('</html>', `${script}</html>`);
  }
  
  // Fallback: append to end
  return html + script;
}

/**
 * Clean editor artifacts from HTML
 */
export function cleanEditorArtifacts(html: string): string {
  // Remove editor classes
  let cleaned = html.replace(/\s*element-editor-(hover|selected)\s*/g, ' ');
  
  // Remove empty class attributes
  cleaned = cleaned.replace(/\s*class="\s*"/g, '');
  
  // Remove contenteditable attributes
  cleaned = cleaned.replace(/\s*contenteditable="(true|false)"/g, '');
  
  // Remove the injected script (between our markers)
  cleaned = cleaned.replace(/<script>\s*\(function\(\)\s*\{\s*\/\/ Prevent double initialization[\s\S]*?window\.__elementEditorInitialized[\s\S]*?\}\)\(\);\s*<\/script>/g, '');
  
  return cleaned;
}

