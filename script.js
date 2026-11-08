// script.js
// Page interactions: welcome screen, navigation, product details, image previews, and click sound.

// Shared audio context lets the browser reuse the sound engine for each click.
let studioAudioContext;

// Plays the short coin sound using the browser's built-in audio tools.
function playCoinClick() {
    const AudioContext = window.AudioContext;
    if (!AudioContext) {
        console.warn('Coin-click sound is unavailable in this browser.');
        return;
    }

    if (!studioAudioContext) {
        studioAudioContext = new AudioContext();
    }

    const now = studioAudioContext.currentTime;
    const tones = [
        { frequency: 2450, volume: 0.12 },
        { frequency: 3890, volume: 0.06 }
    ];

    tones.forEach(({ frequency, volume }) => {
        const oscillator = studioAudioContext.createOscillator();
        const gain = studioAudioContext.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, now);
        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
        oscillator.connect(gain);
        gain.connect(studioAudioContext.destination);
        oscillator.start(now);
        oscillator.stop(now + 0.32);
    });
}

// Welcome screen: fades the overlay away when the visitor enters the studio.
function openStudio() {
    document.getElementById('welcomeOverlay').classList.add('fade-out');
}

// Page navigation: switches the visible panel and updates the active navigation button.
const viewCard = document.getElementById('viewCard');
let currentView = 'studio';
let isChangingView = false;

document.querySelectorAll('[data-view]').forEach(control => {
    control.addEventListener('click', () => {
        const nextView = control.dataset.view;
        if (nextView === currentView || isChangingView) {
            return;
        }

        const nextPanel = document.querySelector(`[data-panel="${nextView}"]`);
        const currentPanel = document.querySelector(`[data-panel="${currentView}"]`);
        if (!nextPanel || !currentPanel) {
            console.error(`No page panel found for view "${nextView}".`);
            return;
        }

        isChangingView = true;
        viewCard.classList.add('is-leaving');
        viewCard.addEventListener('animationend', function handleExit(event) {
            if (event.animationName !== 'card-spin-out') {
                return;
            }

            viewCard.removeEventListener('animationend', handleExit);
            currentPanel.hidden = true;
            nextPanel.hidden = false;
            currentView = nextView;
            document.querySelectorAll('.nav-link[data-view]').forEach(link => {
                const isActive = link.dataset.view === currentView;
                link.classList.toggle('is-active', isActive);
                link.setAttribute('aria-pressed', String(isActive));
            });
            viewCard.classList.remove('is-leaving');
            viewCard.classList.add('is-entering');
            viewCard.addEventListener('animationend', function handleEntry(entryEvent) {
                if (entryEvent.animationName !== 'card-spin-in') {
                    return;
                }

                viewCard.removeEventListener('animationend', handleEntry);
                viewCard.classList.remove('is-entering');
                isChangingView = false;
            });
        });
    });
});

// Product content: replace these placeholder entries as real descriptions, features,
// prices, and preview image paths become available.
const products = [
    {
        title: 'Product 01',
        description: 'This product listing is still being prepared. A full description will be added when the product details are ready to share.',
        price: 'Price to be announced',
        previews: [],
        details: [
            'Product purpose and contents will be described here.',
            'Any included materials or features will be listed here.',
            'Requirements and compatibility information will be added here.',
            'Pricing and availability will be announced when confirmed.',
            'Inquiry and acquisition details will be provided when available.'
        ]
    },
    {
        title: 'Product 02',
        description: 'This product listing is still being prepared. A full description will be added when the product details are ready to share.',
        price: 'Price to be announced',
        previews: [],
        details: [
            'Product purpose and contents will be described here.',
            'Any included materials or features will be listed here.',
            'Requirements and compatibility information will be added here.',
            'Pricing and availability will be announced when confirmed.',
            'Inquiry and acquisition details will be provided when available.'
        ]
    }
];

// Product dialog elements: references used to display the selected product and images.
const productModal = document.getElementById('productModal');
const galleryImage = document.getElementById('galleryImage');
const galleryEmpty = document.getElementById('galleryEmpty');
const galleryCaption = document.getElementById('galleryCaption');
const galleryDots = document.getElementById('galleryDots');
const galleryZoom = document.getElementById('galleryZoom');
const imageZoom = document.getElementById('imageZoom');
const imageZoomContent = document.getElementById('imageZoomContent');
const imageZoomCaption = document.getElementById('imageZoomCaption');

// Product image gallery: tracks the selected image and its carousel controls.
const galleryControls = [
    document.getElementById('galleryPrevious'),
    document.getElementById('galleryNext')
];
let lastFocusedCard;
let activePreview = 0;
let activeProduct;

// Product image gallery: displays the selected image, or the placeholder if none exist.
function showPreview(index) {
    const previews = activeProduct.previews;
    if (previews.length === 0) {
        galleryImage.hidden = true;
        galleryZoom.hidden = true;
        galleryEmpty.hidden = false;
        galleryEmpty.textContent = 'Product screenshots coming soon.';
        galleryCaption.textContent = 'Preview images coming soon';
        galleryDots.hidden = true;
        galleryControls.forEach(control => {
            control.hidden = true;
        });
        return;
    }

    activePreview = (index + previews.length) % previews.length;
    galleryImage.src = previews[activePreview];
    galleryImage.alt = `${activeProduct.title} preview ${activePreview + 1}`;
    galleryImage.hidden = false;
    galleryZoom.hidden = false;
    galleryEmpty.hidden = true;
    galleryCaption.textContent = `Preview ${activePreview + 1} of ${previews.length}`;
    galleryDots.hidden = previews.length < 2;
    galleryControls.forEach(control => {
        control.hidden = previews.length < 2;
    });

    [...galleryDots.children].forEach((dot, dotIndex) => {
        const isCurrent = dotIndex === activePreview;
        dot.classList.toggle('is-active', isCurrent);
        dot.setAttribute('aria-current', isCurrent ? 'true' : 'false');
    });
}

// Product dialog: fills the dialog with the selected product's data and opens it.
function openProduct(card) {
    const productIndex = [...document.querySelectorAll('.product-card')].indexOf(card);
    const product = products[productIndex];
    if (!product) {
        console.error(`No product details found for card ${productIndex}.`);
        return;
    }

    lastFocusedCard = card;
    activeProduct = product;
    document.getElementById('modalTitle').textContent = product.title;
    document.getElementById('modalDescription').textContent = product.description;
    document.getElementById('modalPrice').textContent = product.price;
    document.getElementById('modalFeatures').replaceChildren(
        ...product.details.map(detail => {
            const item = document.createElement('li');
            item.textContent = detail;
            return item;
        })
    );

    activePreview = 0;
    galleryDots.replaceChildren(...Array.from({ length: product.previews.length }, (_, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'gallery-dot';
        dot.setAttribute('aria-label', `Show preview ${index + 1}`);
        dot.addEventListener('click', () => showPreview(index));
        return dot;
    }));
    showPreview(0);

    productModal.showModal();
}

// Product cards: open the product dialog from a mouse click or Enter/Space key.
document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', () => openProduct(card));
    card.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            playCoinClick();
            openProduct(card);
        }
    });
});

// Dialog controls: close dialogs, move through previews, zoom images, and restore focus.
document.getElementById('modalClose').addEventListener('click', () => productModal.close());
document.getElementById('galleryPrevious').addEventListener('click', () => showPreview(activePreview - 1));
document.getElementById('galleryNext').addEventListener('click', () => showPreview(activePreview + 1));
galleryZoom.addEventListener('click', () => {
    imageZoomContent.src = galleryImage.currentSrc;
    imageZoomContent.alt = galleryImage.alt;
    imageZoomCaption.textContent = galleryCaption.textContent;
    imageZoom.showModal();
});
document.getElementById('imageZoomClose').addEventListener('click', () => imageZoom.close());
imageZoom.addEventListener('click', event => {
    if (event.target === imageZoom) {
        imageZoom.close();
    }
});
imageZoom.addEventListener('close', () => {
    if (productModal.open) {
        galleryZoom.focus();
    }
});
productModal.addEventListener('click', event => {
    if (event.target === productModal) {
        productModal.close();
    }
});
productModal.addEventListener('close', () => lastFocusedCard?.focus());

// Gallery keyboard controls: use the left and right arrow keys to change previews.
productModal.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') {
        showPreview(activePreview - 1);
    } else if (event.key === 'ArrowRight') {
        showPreview(activePreview + 1);
    }
});

// Page-wide sound: play the short click sound for mouse or touch clicks.
document.addEventListener('click', playCoinClick, true);
