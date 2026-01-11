export function showToast(message: string, type: 'success' | 'error' = 'success', timeout = 3500) {
  if (typeof document === 'undefined') return;

  const containerId = 'toast-container';
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    Object.assign(container.style, {
      position: 'fixed',
      top: '16px',
      right: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      zIndex: '9999',
      pointerEvents: 'none',
      maxWidth: '420px',
    } as any);
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const id = `toast-${Date.now()}`;
  toast.id = id;
  toast.setAttribute('role', 'status');
  Object.assign(toast.style, {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    pointerEvents: 'auto',
    background: type === 'success' ? 'linear-gradient(90deg,#16a34a, #059669)' : 'linear-gradient(90deg,#ef4444,#dc2626)',
    color: '#fff',
    padding: '12px 14px',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(2,6,23,0.16)',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    transition: 'transform 240ms cubic-bezier(.2,.8,.2,1), opacity 240ms ease',
    transform: 'translateX(12px)',
    opacity: '0',
    fontWeight: '600',
    fontFamily: 'ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,"Apple Color Emoji","Segoe UI Emoji"',
    maxWidth: '420px',
  } as any);

  // icon
  const icon = document.createElement('span');
  icon.style.display = 'inline-flex';
  icon.style.alignItems = 'center';
  icon.style.justifyContent = 'center';
  icon.style.width = '28px';
  icon.style.height = '28px';
  icon.style.flex = '0 0 28px';
  icon.style.borderRadius = '8px';
  icon.style.background = 'rgba(255,255,255,0.08)';

  if (type === 'success') {
    icon.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17l-5-5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  } else {
    icon.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18M6 6l12 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  const text = document.createElement('div');
  text.style.display = 'flex';
  text.style.flexDirection = 'column';
  text.style.gap = '2px';
  text.style.minWidth = '0';
  const title = document.createElement('div');
  title.textContent = message;
  title.style.whiteSpace = 'pre-wrap';
  title.style.fontSize = '14px';
  title.style.lineHeight = '1.2';

  text.appendChild(title);

  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18M6 6l12 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  Object.assign(closeBtn.style, {
    marginLeft: '8px',
    background: 'transparent',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '8px',
    opacity: '0.9',
  } as any);

  const inner = document.createElement('div');
  inner.style.display = 'flex';
  inner.style.alignItems = 'center';
  inner.style.justifyContent = 'space-between';
  inner.style.width = '100%';
  inner.appendChild(icon);
  inner.appendChild(text);
  inner.appendChild(closeBtn);

  toast.appendChild(inner);
  container.appendChild(toast);

  // entrance
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(0)';
  });

  const remove = () => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(12px)';
    setTimeout(() => { try { toast.remove(); } catch {} }, 260);
  };

  const timer = setTimeout(remove, timeout);

  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    clearTimeout(timer);
    remove();
  });

  toast.addEventListener('click', () => {
    clearTimeout(timer);
    remove();
  });
}

export default showToast;
