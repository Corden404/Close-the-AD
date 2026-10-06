/** Install a read-only, DOM-to-text bridge in the page. This function deliberately
 * has no module dependencies so Playwright can serialize it into page.evaluate.
 * It never reads game datasets, handlers, source code, evaluator state or answers.
 */
export function installDomBridge(config = {}) {
  const doc = window.document;
  const seed = typeof config.seed === 'string' ? config.seed : '';
  let snapshot = null;
  let revision = 0;
  let observationSequence = 0;
  let nextNodeIdentity = 0;
  const identities = new WeakMap();
  const identity = node => {
    if (!identities.has(node)) identities.set(node, ++nextNodeIdentity);
    return identities.get(node);
  };
  const Observer = window.MutationObserver;
  const observer = Observer ? new Observer(() => { revision++; }) : null;
  observer?.observe(doc.documentElement, { subtree: true, childList: true, attributes: true, characterData: true });
  const drain = () => { if (observer?.takeRecords().length) revision++; };
  const clean = value => String(value ?? '').replace(/\s+/gu, ' ').trim();
  const hash = value => {
    let h = 2166136261;
    for (const c of value) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(36);
  };
  const opaque = (type, id, index) => `${type}_${hash(`${seed}\0${id}\0${type}\0${index}`)}`;
  const skipTags = new Set(['SCRIPT', 'STYLE', 'TEMPLATE', 'NOSCRIPT', 'HEAD', 'TITLE', 'META', 'LINK', 'SVG', 'CANVAS']);
  const intersection = (a, b) => {
    const left = Math.max(a.left, b.left), top = Math.max(a.top, b.top);
    const right = Math.min(a.right, b.right), bottom = Math.min(a.bottom, b.bottom);
    return right > left && bottom > top ? { left, top, right, bottom, width: right - left, height: bottom - top } : null;
  };
  const samples = r => {
    const fractions = [[.5, .5], [.15, .5], [.85, .5], [.5, .15], [.5, .85], [.15, .15], [.85, .15], [.15, .85], [.85, .85]];
    return fractions.map(([x, y]) => ({ x: r.left + r.width * x, y: r.top + r.height * y }));
  };

  function capture() {
    const width = Number(window.innerWidth), height = Number(window.innerHeight);
    const viewport = { left: 0, top: 0, right: width, bottom: height, width, height };
    const elements = [], texts = [];
    const walk = node => {
      if (node.nodeType === 1) {
        if (skipTags.has(node.tagName)) return;
        elements.push(node);
      } else if (node.nodeType === 3) texts.push(node);
      for (const child of node.childNodes || []) walk(child);
    };
    walk(doc.body);
    const styles = new Map();
    const style = node => {
      if (!styles.has(node)) styles.set(node, window.getComputedStyle(node));
      return styles.get(node);
    };
    const cssRendered = (el, ignoreOwnOpacity = false) => {
      if (!el || !el.isConnected || ['hidden', 'collapse'].includes(style(el).visibility)) return false;
      let opacity = 1;
      for (let node = el; node; node = node.parentElement) {
        if (node.inert || node.hidden || skipTags.has(node.tagName)) return false;
        const s = style(node);
        if (s.display === 'none' || s.contentVisibility === 'hidden') return false;
        if (!(ignoreOwnOpacity && node === el)) opacity *= Number(s.opacity || 1);
        if (opacity <= .001) return false;
        // Non-inset shape clipping cannot be faithfully reconstructed from DOM
        // geometry. Conservatively omit it instead of exposing clipped text.
        if (s.clipPath && s.clipPath !== 'none' && !s.clipPath.startsWith('inset(')) return false;
      }
      return true;
    };
    const modals = elements.filter(el => {
      try { if (el.matches(':modal')) return true; } catch { /* Older DOM implementations. */ }
      return cssRendered(el) && el.getAttribute('aria-modal') === 'true' && ['dialog', 'alertdialog'].includes(el.getAttribute('role'));
    });
    const modal = modals.at(-1);
    const rendered = (el, ignoreOwnOpacity = false) => (!modal || modal.contains(el)) && cssRendered(el, ignoreOwnOpacity);
    const clipRect = (el, raw) => {
      let r = intersection(raw, viewport);
      for (let node = el; r && node; node = node.parentElement) {
        const s = style(node), b = node.getBoundingClientRect();
        const xOverflow = s.overflowX || s.overflow;
        const yOverflow = s.overflowY || s.overflow;
        if (node !== el && (/^(hidden|clip|scroll|auto)$/.test(xOverflow) || /^(hidden|clip|scroll|auto)$/.test(yOverflow))) {
          const left = b.left + (node.clientLeft || 0), top = b.top + (node.clientTop || 0);
          const box = { left: /^(hidden|clip|scroll|auto)$/.test(xOverflow) ? left : r.left,
            right: /^(hidden|clip|scroll|auto)$/.test(xOverflow) ? left + node.clientWidth : r.right,
            top: /^(hidden|clip|scroll|auto)$/.test(yOverflow) ? top : r.top,
            bottom: /^(hidden|clip|scroll|auto)$/.test(yOverflow) ? top + node.clientHeight : r.bottom };
          r = intersection(r, box);
        }
        if (r && s.clip && s.clip !== 'auto') {
          const match = s.clip.match(/^rect\(\s*([-\d.]+)px?[, ]+([-\d.]+)px?[, ]+([-\d.]+)px?[, ]+([-\d.]+)px?\s*\)$/);
          if (match) r = intersection(r, { top: b.top + Number(match[1]), right: b.left + Number(match[2]), bottom: b.top + Number(match[3]), left: b.left + Number(match[4]) });
          else return null;
        }
        if (r && s.clipPath?.startsWith('inset(')) {
          const content = s.clipPath.slice(6, -1).split(/\s+round\s+/)[0].trim().split(/\s+/);
          if (content.some(v => !/^-?[\d.]+(?:px|%)?$/.test(v))) return null;
          const value = (v, size) => v.endsWith('%') ? parseFloat(v) * size / 100 : parseFloat(v);
          const t = value(content[0], b.height), right = value(content[1] || content[0], b.width);
          const bottom = value(content[2] || content[0], b.height), left = value(content[3] || content[1] || content[0], b.width);
          r = intersection(r, { top: b.top + t, right: b.right - right, bottom: b.bottom - bottom, left: b.left + left });
        }
      }
      return r;
    };
    const geometry = el => Array.from(el.getClientRects()).map(r => clipRect(el, r)).filter(Boolean);
    const hitPoint = (visual, target = visual) => {
      if (!rendered(visual)) return null;
      for (const r of geometry(visual)) {
        for (const point of samples(r)) {
          const hit = doc.elementFromPoint(point.x, point.y);
          if (hit && (visual === hit || visual.contains(hit) || target === hit || target.contains(hit))) return point;
        }
      }
      return null;
    };
    const visibleFragments = [];
    const range = doc.createRange();
    for (const node of texts) {
      const parent = node.parentElement;
      if (!rendered(parent)) continue;
      const s = style(parent);
      if (s.color === 'transparent' || /rgba\([^)]*,\s*0(?:\.0+)?\s*\)$/.test(s.color || '') || s.webkitTextFillColor === 'transparent' || parseFloat(s.fontSize) === 0) continue;
      let result = '', offset = 0, previousVisible = false;
      for (const char of node.data) {
        const end = offset + char.length;
        range.setStart(node, offset); range.setEnd(node, end); offset = end;
        const visible = Array.from(range.getClientRects()).some(raw => {
          const clipped = clipRect(parent, raw);
          if (!clipped || clipped.width + .05 < raw.width || clipped.height + .05 < raw.height) return false;
          return samples(clipped).every(point => {
            const hit = doc.elementFromPoint(point.x, point.y);
            return hit && (hit === parent || hit.contains(parent));
          });
        });
        if (visible) { if (!previousVisible && result && !/\s$/u.test(result)) result += ' … '; result += char; }
        previousVisible = visible;
      }
      result = clean(result);
      if (result) visibleFragments.push({ node, parent, text: result });
    }
    range.detach?.();
    const visibleText = el => clean(visibleFragments.filter(f => el.contains(f.node)).map(f => f.text).join(' '));
    const semanticTags = new Set(['ARTICLE', 'ASIDE', 'SECTION', 'FORM', 'FIELDSET', 'NAV', 'DIALOG']);
    const groupFor = el => {
      let card = null;
      for (let parent = el.parentElement; parent && parent !== doc.body; parent = parent.parentElement) {
        if (['ASIDE', 'DIALOG', 'FORM', 'FIELDSET'].includes(parent.tagName)) return parent;
        if (!card && parent.children.length > 1 && visibleFragments.some(f => parent.contains(f.node) && !el.contains(f.node))) card = parent;
        if (semanticTags.has(parent.tagName)) return card || parent;
      }
      return card || doc.body;
    };
    const labelsFor = el => elements.filter(label => label.tagName === 'LABEL' &&
      (label.control === el || label.contains(el) || (el.id && label.getAttribute('for') === el.id)));
    const labelFor = (el, visual) => {
      let visible = visibleText(visual);
      if (['INPUT', 'TEXTAREA'].includes(el.tagName)) visible = clean(labelsFor(el).map(visibleText).join(' ')) || visible;
      // Placeholder is actually painted only when the field is empty.
      if (!visible && ['INPUT', 'TEXTAREA'].includes(el.tagName) && !el.value) visible = clean(el.getAttribute('placeholder'));
      const accessible = clean(el.getAttribute('aria-label'));
      if (!visible && accessible) return `[accessible name: ${accessible.slice(0, 160)}]`;
      if (visible && accessible && !/[\p{L}\p{N}]/u.test(visible)) return `${visible} [accessible name: ${accessible.slice(0, 160)}]`;
      return visible || (el.tagName === 'INPUT' ? 'Input' : 'Unlabelled control');
    };
    const disabled = el => {
      if (el.disabled || el.getAttribute('aria-disabled') === 'true') return true;
      try { if (el.matches(':disabled')) return true; } catch { /* DOM double / older engine. */ }
      return false;
    };
    const entries = [];
    for (const el of elements) {
      if (disabled(el)) continue;
      const role = el.getAttribute('role'), type = String(el.type || '').toLowerCase();
      let kind = null, operations = [];
      if (el.tagName === 'INPUT' && ['checkbox', 'radio'].includes(type)) { kind = 'checkbox'; operations = ['click']; }
      else if ((el.tagName === 'INPUT' && ['text', 'number', 'search', 'email', 'url', 'tel', 'password'].includes(type)) || el.tagName === 'TEXTAREA') {
        if (type === 'password' || el.readOnly) continue;
        kind = 'textbox'; operations = ['fill'];
      } else if (el.tagName === 'BUTTON' || (el.tagName === 'INPUT' && ['button', 'submit', 'reset'].includes(type)) || role === 'button' || (el.tagName === 'A' && el.hasAttribute('href'))) {
        kind = 'button'; operations = ['click'];
      }
      if (!kind) continue;
      let visual = el;
      if (!rendered(el) && kind === 'checkbox' && rendered(el, true) && Number(style(el).opacity) <= .001) {
        visual = labelsFor(el).find(label => rendered(label) && hitPoint(label, el));
      }
      if (!visual || !rendered(visual)) continue;
      const point = hitPoint(visual, el);
      if (!point) continue;
      const group = visual.tagName === 'LABEL' ? visual : groupFor(el);
      const candidate = { kind, label: labelFor(el, visual), context: visibleText(group), operations };
      if (kind === 'checkbox') candidate.checked = Boolean(el.checked);
      if (kind === 'textbox') candidate.value = String(el.value || '');
      entries.push({ node: el, visual, point, candidate });
    }
    const scrolls = elements.filter(el => {
      const s = style(el);
      return rendered(el) && ((/^(auto|scroll)$/.test(s.overflowY || s.overflow) && el.scrollHeight > el.clientHeight + 1) ||
        (/^(auto|scroll)$/.test(s.overflowX || s.overflow) && el.scrollWidth > el.clientWidth + 1));
    });
    for (const el of scrolls) {
      const point = hitPoint(el);
      if (point) entries.push({ node: el, visual: el, point,
        candidate: { kind: 'scroll', label: 'Scrollable area', context: visibleText(el), operations: ['scroll'] } });
    }
    const root = doc.scrollingElement || doc.documentElement;
    if (!modal && root && (root.scrollHeight > height + 1 || root.scrollWidth > width + 1) &&
      !/^(hidden|clip)$/.test(style(root).overflowY || style(root).overflow) &&
      !/^(hidden|clip)$/.test(style(doc.body).overflowY || style(doc.body).overflow)) {
      const point = samples(viewport).find(p => {
        const hit = doc.elementFromPoint(p.x, p.y);
        return hit && !scrolls.some(el => el === hit || el.contains(hit));
      });
      if (point) entries.push({ node: root, visual: root, point, viewportScroll: true,
        candidate: { kind: 'scroll', label: 'Viewport', context: '', operations: ['scroll'] } });
    }
    const groups = new Map();
    const cardGroups = entries.filter(e => !e.viewportScroll).map(e => e.visual.tagName === 'LABEL' ? e.visual : groupFor(e.node));
    for (const fragment of visibleFragments) {
      let group = doc.body;
      for (let parent = fragment.parent; parent && parent !== doc.body; parent = parent.parentElement) {
        if (cardGroups.includes(parent) || semanticTags.has(parent.tagName)) { group = parent; break; }
      }
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group).push(fragment.text);
    }
    const regions = Array.from(groups, ([node, parts]) => ({ node, text: clean(parts.join(' ')) }));
    // This game's address display is ordinary rendered UI. Do not mistake an
    // advertisement's domain or document.location for the address-bar content.
    const addressNode = doc.querySelector('.browser-toolbar .address');
    const address = addressNode ? visibleText(addressNode).match(/\b(?:[a-z0-9-]+\.)+(?:example|test|invalid|com|org|net)(?:\/[^\s]*)?/i)?.[0] || '' : '';
    const warnings = ['DOM text uses geometry and hit testing; image contents, generated CSS text and pixel-only details are not represented.'];
    if (entries.some(e => e.candidate.label.includes('[accessible name:'))) warnings.push('Labels marked [accessible name: …] come from accessibility attributes, not rendered text.');
    const publicBase = { page: { title: String(doc.title || ''), displayed_address: address },
      viewport: { width, height, scroll_x: Number(window.scrollX || 0), scroll_y: Number(window.scrollY || 0) }, warnings };
    const fingerprint = JSON.stringify({ base: publicBase, regions: regions.map(r => [identity(r.node), r.text]),
      entries: entries.map(e => [identity(e.node), identity(e.visual), e.candidate, e.point,
        Array.from(e.visual.getClientRects(), r => [r.left, r.top, r.right, r.bottom])]),
      scroll: elements.map(el => [identity(el), el.scrollLeft || 0, el.scrollTop || 0]), rootScroll: [root?.scrollLeft || 0, root?.scrollTop || 0] });
    return { publicBase, entries, regions, fingerprint };
  }

  window.__closeAdsDomBridge = {
    observe(snapshotId) {
      drain();
      if (typeof snapshotId !== 'string' || !snapshotId) throw new TypeError('snapshotId must be a nonempty string');
      const current = capture();
      const references = new Map();
      const idScope = `${snapshotId}\0${++observationSequence}`;
      const candidates = current.entries.map((entry, i) => {
        const id = opaque('c', idScope, i); references.set(id, entry);
        return { id, ...entry.candidate, operations: [...entry.candidate.operations] };
      }).sort((a, b) => hash(`${seed}\0order\0${a.id}`).localeCompare(hash(`${seed}\0order\0${b.id}`)));
      const regions = current.regions.map((r, i) => ({ id: opaque('r', idScope, i), text: r.text }));
      snapshot = { id: snapshotId, revision, fingerprint: current.fingerprint, references };
      return { snapshot_id: snapshotId, ...current.publicBase, regions, candidates };
    },
    preflight(action) {
      drain();
      if (!snapshot || !action || action.snapshot_id !== snapshot.id || revision !== snapshot.revision) return { ok: false, error: 'stale_snapshot' };
      const current = capture();
      if (current.fingerprint !== snapshot.fingerprint) return { ok: false, error: 'stale_snapshot' };
      const record = snapshot.references.get(action.target_id);
      if (!record) return { ok: false, error: 'unknown_target' };
      if (!record.candidate.operations.includes(action.action)) return { ok: false, error: 'not_actionable' };
      const live = current.entries.find(e => e.node === record.node && e.candidate.kind === record.candidate.kind && e.viewportScroll === record.viewportScroll);
      if (!live || !live.node.isConnected || !live.candidate.operations.includes(action.action)) return { ok: false, error: 'not_actionable' };
      return { ok: true, point: { x: live.point.x, y: live.point.y } };
    },
    invalidate() { snapshot = null; },
  };
}
