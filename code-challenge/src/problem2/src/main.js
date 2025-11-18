import './style.css';

const PRICE_ENDPOINT = 'https://interview.switcheo.com/prices.json';
const TOKEN_ICON_BASE = 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/';
const FALLBACK_ICON = 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/USDC.svg';

const state = {
  tokens: [],
  fromToken: null,
  toToken: null,
  amount: '',
};

const els = {};

document.addEventListener('DOMContentLoaded', async () => {
  cacheElements();
  wireEvents();
  await hydratePrices();
});

const cacheElements = () => {
  els.form = document.getElementById('swap-form');
  els.connectionStatus = document.getElementById('connection-status');
  els.fromAmount = document.getElementById('from-amount');
  els.toAmount = document.getElementById('to-amount');
  els.fromToken = document.getElementById('from-token');
  els.toToken = document.getElementById('to-token');
  els.fromTokenPrice = document.getElementById('from-token-price');
  els.toTokenPrice = document.getElementById('to-token-price');
  els.fromTokenIcon = document.getElementById('from-token-icon');
  els.toTokenIcon = document.getElementById('to-token-icon');
  els.swapDirection = document.getElementById('swap-direction');
  els.fillMax = document.getElementById('fill-max');
  els.quoteDetails = document.getElementById('quote-details');
  els.feedback = document.getElementById('form-feedback');
  els.submitBtn = document.getElementById('submit-btn');
}

const wireEvents = () => {
  els.form.addEventListener('submit', onSubmit);
  els.fromAmount.addEventListener('input', () => {
    state.amount = els.fromAmount.value;
    renderQuote();
  });

  els.fromToken.addEventListener('change', () => {
    state.fromToken = els.fromToken.value;
    syncTokenMeta();
    renderQuote();
  });

  els.toToken.addEventListener('change', () => {
    state.toToken = els.toToken.value;
    syncTokenMeta();
    renderQuote();
  });

  els.swapDirection.addEventListener('click', () => {
    const prevFrom = state.fromToken;
    state.fromToken = state.toToken;
    state.toToken = prevFrom;
    [els.fromToken.value, els.toToken.value] = [state.fromToken, state.toToken];
    syncTokenMeta();
    renderQuote();
  });

  els.fillMax.addEventListener('click', () => {
    // Mocked balance for UX.
    const balance = 2500.56;
    state.amount = balance.toFixed(2);
    els.fromAmount.value = state.amount;
    renderQuote();
  });
}

const hydratePrices = async () => {
  setStatus('Loading prices…', 'badge--ghost');
  try {
    const res = await fetch(PRICE_ENDPOINT);
    const raw = await res.json();
    const tokensMap = raw.reduce((acc, item) => {
      if (!item.price) return acc;
      const existing = acc[item.currency];
      if (!existing || new Date(item.date) > new Date(existing.date)) {
        acc[item.currency] = item;
      }
      return acc;
    }, {});

    state.tokens = Object.values(tokensMap)
      .sort((a, b) => a.currency.localeCompare(b.currency));

    populateSelects();
    setDefaults();
    syncTokenMeta();
    renderQuote();
    setStatus('Prices live', 'badge--live');
  } catch (error) {
    console.error('Failed to load prices', error);
    state.tokens = [];
    setStatus('Offline mode', 'badge--error');
    els.feedback.textContent = 'Unable to fetch live prices. Please retry or check your connection.';
  }
}

const populateSelects = () => {
  const options = state.tokens
    .map(token => `<option value="${token.currency}">${token.currency}</option>`)
    .join('');
  els.fromToken.innerHTML = options;
  els.toToken.innerHTML = options;
}

const setDefaults = () => {
  const defaultFrom = state.tokens.find(t => t.currency === 'USDC') || state.tokens[0];
  const defaultTo = state.tokens.find(t => t.currency === 'ETH') || state.tokens[1];
  state.fromToken = defaultFrom?.currency;
  state.toToken = defaultTo?.currency;
  state.amount = '100';

  if (state.fromToken) {
    els.fromToken.value = state.fromToken;
  }
  if (state.toToken) {
    els.toToken.value = state.toToken;
  }
  els.fromAmount.value = state.amount;
}

const syncTokenMeta = () => {
  const from = getToken(state.fromToken);
  const to = getToken(state.toToken);

  els.fromTokenIcon.src = getIconUrl(state.fromToken);
  els.toTokenIcon.src = getIconUrl(state.toToken);
  els.fromTokenIcon.onerror = () => setFallbackIcon(els.fromTokenIcon);
  els.toTokenIcon.onerror = () => setFallbackIcon(els.toTokenIcon);

  els.fromTokenPrice.textContent = from ? `$${formatNumber(from.price)}` : '—';
  els.toTokenPrice.textContent = to ? `$${formatNumber(to.price)}` : '—';
}

const renderQuote = () => {
  const validationError = validate();
  if (validationError) {
    els.feedback.textContent = validationError;
    els.feedback.classList.remove('feedback--success');
    els.toAmount.value = '';
    els.quoteDetails.textContent = '—';
    toggleSubmit(false);
    return;
  }

  const from = getToken(state.fromToken);
  const to = getToken(state.toToken);
  const amount = Number.parseFloat(state.amount);
  const outputAmount = (amount * from.price) / to.price;

  els.toAmount.value = formatNumber(outputAmount, 6);
  els.quoteDetails.textContent = `1 ${from.currency} ≈ ${(from.price / to.price).toFixed(6)} ${to.currency}`;
  els.feedback.textContent = 'Quote ready. Tap confirm to simulate the trade.';
  els.feedback.classList.add('feedback--success');
  toggleSubmit(true);
}

const validate = () => {
  if (!state.tokens.length) {
    return 'Prices unavailable.';
  }
  if (!state.fromToken || !state.toToken) {
    return 'Select both currencies.';
  }
  if (state.fromToken === state.toToken) {
    return 'Please pick two different currencies.';
  }
  if (!state.amount || Number(state.amount) <= 0) {
    return 'Enter an amount greater than zero.';
  }
  return '';
}

const toggleSubmit = (enabled) => {
  els.submitBtn.disabled = !enabled;
}

const getToken = (symbol) => {
  return state.tokens.find(token => token.currency === symbol);
}

const getIconUrl = (symbol) => {
  if (!symbol) return FALLBACK_ICON;
  return `${TOKEN_ICON_BASE}${symbol}.svg`;
}

const setFallbackIcon = (imgEl) => {
  imgEl.onerror = null;
  imgEl.src = FALLBACK_ICON;
}

const formatNumber = (value, digits = 4) => {
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
}

const setStatus = (text, modifier) => {
  els.connectionStatus.textContent = text;
  els.connectionStatus.className = `badge ${modifier}`;
}

const onSubmit = async (event) => {
  event.preventDefault();
  const validationError = validate();
  if (validationError) {
    els.feedback.textContent = validationError;
    els.feedback.classList.remove('feedback--success');
    return;
  }

  simulateLoading(true);
  await new Promise(resolve => setTimeout(resolve, 1400));
  simulateLoading(false);

  els.feedback.textContent = `Swap simulated! ${state.amount} ${state.fromToken} → ${els.toAmount.value} ${state.toToken}.`;
  els.feedback.classList.add('feedback--success');
}

const simulateLoading = (isLoading) => {
  if (isLoading) {
    els.submitBtn.classList.add('is-loading');
    els.submitBtn.disabled = true;
  } else {
    els.submitBtn.classList.remove('is-loading');
    els.submitBtn.disabled = false;
  }
}

