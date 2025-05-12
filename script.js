// DOM Elements
const navButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section');
const colorInputs = document.querySelectorAll('input[type="color"]');
const outfitParts = document.querySelectorAll('.outfit-part');
const descriptionInput = document.getElementById('outfit-description');
const getRecommendationsBtn = document.getElementById('get-recommendations');
const saveLookBtn = document.getElementById('save-look');
const savedLooksGrid = document.getElementById('saved-looks-grid');
const modal = document.getElementById('recommendations-modal');
const closeModal = document.querySelector('.close-modal');
const recommendationsContent = document.getElementById('recommendations-content');
const colorCombinationsGrid = document.getElementById('color-combinations-grid');

// Update page title
document.title = "StyleCanvas - Your Personal Fashion Studio";
document.querySelector('.logo').textContent = "StyleCanvas";

// Navigation
navButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetSection = button.dataset.section;
        
        // Update active states
        navButtons.forEach(btn => btn.classList.remove('active'));
        sections.forEach(section => section.classList.remove('active'));
        
        button.classList.add('active');
        document.getElementById(targetSection).classList.add('active');

        // Ensure create-look section is properly initialized
        if (targetSection === 'create-look') {
            initializeLookCreator();
        }
    });
});

// Initialize Look Creator
function initializeLookCreator() {
    const createLookSection = document.getElementById('create-look');
    if (!createLookSection) return;

    createLookSection.innerHTML = `
        <div class="look-creator">
            <h2>Create Your Signature Look</h2>
            <div class="preview-canvas">
                <div class="outfit-preview">
                    <div id="top" class="outfit-part top"></div>
                    <div id="bottom" class="outfit-part bottom"></div>
                    <div id="shoes" class="outfit-part shoes"></div>
                    <div id="accessory" class="outfit-part accessory"></div>
                </div>
            </div>
            <div class="controls">
                <div class="color-pickers">
                    <div class="color-picker-group">
                        <label for="top-color">Top</label>
                        <input type="color" id="top-color" value="#ff4d6d">
                    </div>
                    <div class="color-picker-group">
                        <label for="bottom-color">Bottom</label>
                        <input type="color" id="bottom-color" value="#ff8fa3">
                    </div>
                    <div class="color-picker-group">
                        <label for="shoes-color">Shoes</label>
                        <input type="color" id="shoes-color" value="#ff758f">
                    </div>
                    <div class="color-picker-group">
                        <label for="accessory-color">Accessory</label>
                        <input type="color" id="accessory-color" value="#ffd1dc">
                    </div>
                </div>
                <div class="description-section">
                    <label for="outfit-description">Describe your look</label>
                    <textarea id="outfit-description" placeholder="e.g., Casual summer outfit with a bohemian touch"></textarea>
                </div>
                <div class="color-combinations">
                    <h3>Suggested Color Combinations</h3>
                    <div id="color-combinations-grid" class="color-combinations-grid"></div>
                </div>
                <div class="action-buttons">
                    <button id="get-recommendations" class="btn btn-primary">Get Recommendations</button>
                    <button id="save-look" class="btn btn-secondary">Save Look</button>
                </div>
            </div>
        </div>
    `;

    // Reinitialize event listeners
    initializeColorPickers();
    initializeColorCombinations();
}

// Initialize Color Combinations
function initializeColorCombinations() {
    const firstColor = document.querySelector('input[type="color"]').value;
    updateColorCombinations(firstColor);
}

// Color Combination System
function hexToHSL(hex) {
    // Remove the hash if it exists
    hex = hex.replace('#', '');
    
    // Convert hex to RGB
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        
        h /= 6;
    }
    
    return [h * 360, s * 100, l * 100];
}

function HSLToHex(h, s, l) {
    s /= 100;
    l /= 100;
    
    const a = s * Math.min(l, 1 - l);
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    
    return `#${f(0)}${f(8)}${f(4)}`;
}

function generateColorCombinations(baseColor) {
    const [h, s, l] = hexToHSL(baseColor);
    
    // Generate complementary color (opposite on the color wheel)
    const complementary = HSLToHex((h + 180) % 360, s, l);
    
    // Generate analogous colors (adjacent on the color wheel)
    const analogous1 = HSLToHex((h + 30) % 360, s, l);
    const analogous2 = HSLToHex((h - 30 + 360) % 360, s, l);
    
    // Generate triadic colors (equally spaced on the color wheel)
    const triadic1 = HSLToHex((h + 120) % 360, s, l);
    const triadic2 = HSLToHex((h + 240) % 360, s, l);
    
    // Generate split complementary colors
    const splitComp1 = HSLToHex((h + 150) % 360, s, l);
    const splitComp2 = HSLToHex((h + 210) % 360, s, l);
    
    return [
        { name: 'Complementary', color: complementary },
        { name: 'Analogous 1', color: analogous1 },
        { name: 'Analogous 2', color: analogous2 },
        { name: 'Triadic 1', color: triadic1 },
        { name: 'Triadic 2', color: triadic2 },
        { name: 'Split Comp 1', color: splitComp1 },
        { name: 'Split Comp 2', color: splitComp2 }
    ];
}

function updateColorCombinations(baseColor) {
    const combinations = generateColorCombinations(baseColor);
    const colorCombinationsGrid = document.getElementById('color-combinations-grid');
    
    if (!colorCombinationsGrid) return;
    
    colorCombinationsGrid.innerHTML = combinations.map(combo => `
        <div class="color-combo-card" data-color="${combo.color}">
            <div class="color-swatch" style="background-color: ${combo.color}"></div>
            <div class="color-name">${combo.name}</div>
        </div>
    `).join('');
    
    // Add click event to color swatches
    document.querySelectorAll('.color-combo-card').forEach(card => {
        card.addEventListener('click', () => {
            const color = card.dataset.color;
            const activeColorInput = document.querySelector('input[type="color"]:focus');
            if (activeColorInput) {
                activeColorInput.value = color;
                const event = new Event('input');
                activeColorInput.dispatchEvent(event);
            }
        });
    });
}

// Initialize Color Pickers
function initializeColorPickers() {
    const colorInputs = document.querySelectorAll('input[type="color"]');
    colorInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            const partId = e.target.id.replace('-color', '');
            const part = document.getElementById(partId);
            part.style.backgroundColor = e.target.value;
            
            // Add subtle animation
            part.style.transform = 'translateX(-50%) scale(1.05)';
            setTimeout(() => {
                part.style.transform = 'translateX(-50%) scale(1)';
            }, 200);
            
            // Update color combinations
            updateColorCombinations(e.target.value);
        });

        // Initialize the part color
        const partId = input.id.replace('-color', '');
        const part = document.getElementById(partId);
        if (part) {
            part.style.backgroundColor = input.value;
        }
    });
}

// Color Updates
colorInputs.forEach(input => {
    input.addEventListener('input', (e) => {
        const partId = e.target.id.replace('-color', '');
        const part = document.getElementById(partId);
        part.style.backgroundColor = e.target.value;
        
        // Add subtle animation
        part.style.transform = 'translateX(-50%) scale(1.05)';
        setTimeout(() => {
            part.style.transform = 'translateX(-50%) scale(1)';
        }, 200);
    });
});

// Enhanced Recommendations System
const recommendations = {
    casual: [
        'Light blue jeans with a white t-shirt',
        'Oversized sweater with leggings',
        'Denim jacket with a floral dress',
        'Sneakers with a midi skirt',
        'Graphic tee with cargo pants'
    ],
    beach: [
        'Floral maxi dress with straw hat',
        'High-waisted shorts with crop top',
        'Cover-up with swimsuit',
        'Flip flops with sundress',
        'Beach kimono with bikini'
    ],
    party: [
        'Little black dress with statement jewelry',
        'Sequin top with black pants',
        'Cocktail dress with strappy heels',
        'Velvet blazer with silk cami',
        'Metallic skirt with simple top'
    ],
    business: [
        'Tailored blazer with pencil skirt',
        'Crisp white shirt with trousers',
        'Sheath dress with blazer',
        'Oxford shoes with pleated pants',
        'Silk blouse with wide-leg pants'
    ],
    summer: [
        'Light cotton sundress with sandals',
        'Linen shirt with shorts',
        'Straw hat with maxi dress',
        'Espadrilles with flowy skirt',
        'Tank top with linen pants'
    ],
    winter: [
        'Wool coat with turtleneck',
        'Knit sweater with jeans',
        'Puffer jacket with leggings',
        'Boots with sweater dress',
        'Scarf with peacoat'
    ],
    elegant: [
        'Silk blouse with tailored pants',
        'Pearl jewelry with little black dress',
        'Structured handbag with pencil skirt',
        'Classic pumps with sheath dress',
        'Cashmere sweater with pleated skirt'
    ],
    streetwear: [
        'Oversized hoodie with joggers',
        'Graphic tee with cargo pants',
        'Dad sneakers with track pants',
        'Bucket hat with oversized shirt',
        'Chunky sneakers with baggy jeans'
    ],
    bohemian: [
        'Maxi dress with fringed vest',
        'Crochet top with wide-leg pants',
        'Embroidered kimono with jeans',
        'Leather sandals with flowy skirt',
        'Statement jewelry with peasant blouse'
    ],
    vintage: [
        'High-waisted trousers with blouse',
        'A-line skirt with cardigan',
        'Peter pan collar dress',
        'Oxford shoes with pleated skirt',
        'Beret with tweed jacket'
    ],
    minimalist: [
        'Neutral toned basics',
        'Clean lines and simple silhouettes',
        'Monochrome outfit with subtle texture',
        'Structured bag with simple dress',
        'Minimal jewelry with tailored pieces'
    ],
    sporty: [
        'Athletic leggings with sports bra',
        'Track jacket with joggers',
        'Performance sneakers with athleisure',
        'Compression top with running shorts',
        'Sports watch with workout gear'
    ]
};

// Fashion Platforms Data
const fashionPlatforms = {
    'ASOS': {
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/ASOS_Logo.svg/1200px-ASOS_Logo.svg.png',
        suggestions: {
            casual: ['ASOS DESIGN oversized t-shirt', 'ASOS DESIGN mom jeans'],
            beach: ['ASOS DESIGN maxi dress', 'ASOS DESIGN straw hat'],
            party: ['ASOS DESIGN sequin dress', 'ASOS DESIGN heels']
        }
    },
    'ZARA': {
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Zara_logo.svg/1200px-Zara_logo.svg.png',
        suggestions: {
            casual: ['ZARA basic t-shirt', 'ZARA straight jeans'],
            beach: ['ZARA floral dress', 'ZARA sandals'],
            party: ['ZARA cocktail dress', 'ZARA heels']
        }
    },
    'H&M': {
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/H%26M-Logo.svg/1200px-H%26M-Logo.svg.png',
        suggestions: {
            casual: ['H&M cotton t-shirt', 'H&M mom jeans'],
            beach: ['H&M maxi dress', 'H&M straw hat'],
            party: ['H&M party dress', 'H&M heels']
        }
    },
    'Myntra': {
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Myntra_logo.svg/1200px-Myntra_logo.svg.png',
        suggestions: {
            casual: ['Roadster t-shirt', 'Levis jeans', 'Puma sneakers'],
            beach: ['Forever 21 maxi dress', 'Accessorize straw hat', 'Catwalk sandals'],
            party: ['Forever 21 sequin dress', 'Catwalk heels', 'Accessorize jewelry'],
            bohemian: ['Forever 21 maxi dress', 'Accessorize jewelry', 'Catwalk sandals'],
            vintage: ['Forever 21 retro dress', 'Accessorize beret', 'Catwalk oxfords'],
            minimalist: ['Roadster basics', 'Levis jeans', 'Puma sneakers'],
            sporty: ['Puma activewear', 'Nike sneakers', 'Adidas track pants']
        }
    },
    'Amazon': {
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1200px-Amazon_logo.svg.png',
        suggestions: {
            casual: ['Amazon Essentials t-shirt', 'Levis jeans', 'Adidas sneakers'],
            beach: ['Lands End swimsuit', 'Quiksilver board shorts', 'Teva sandals'],
            party: ['Calvin Klein dress', 'Nine West heels', 'Fossil jewelry'],
            bohemian: ['Free People maxi dress', 'Anthropologie jewelry', 'Birkenstock sandals'],
            vintage: ['ModCloth retro dress', 'Etsy vintage accessories', 'Clarks shoes'],
            minimalist: ['Everlane basics', 'Uniqlo jeans', 'New Balance sneakers'],
            sporty: ['Under Armour activewear', 'Nike shoes', 'Adidas track suit']
        }
    }
};

function getRecommendations(text) {
    const keywords = text.toLowerCase().split(' ');
    let suggestions = [];
    let platformSuggestions = [];
    
    // Get style recommendations
    for (const keyword of keywords) {
        if (recommendations[keyword]) {
            suggestions.push(...recommendations[keyword]);
        }
    }
    
    // Get platform suggestions
    for (const platform in fashionPlatforms) {
        for (const keyword of keywords) {
            if (fashionPlatforms[platform].suggestions[keyword]) {
                platformSuggestions.push({
                    platform,
                    logo: fashionPlatforms[platform].logo,
                    items: fashionPlatforms[platform].suggestions[keyword]
                });
            }
        }
    }
    
    return {
        styleSuggestions: suggestions.length > 0 ? suggestions : ['Try adding keywords like "casual", "beach", "party", "business", "summer", "winter", "elegant", or "streetwear"'],
        platformSuggestions
    };
}

// Modal Management
function showModal() {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function hideModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

closeModal.addEventListener('click', hideModal);
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        hideModal();
    }
});

// Update Get Recommendations Button
getRecommendationsBtn.addEventListener('click', () => {
    const description = descriptionInput.value;
    const { styleSuggestions, platformSuggestions } = getRecommendations(description);
    
    recommendationsContent.innerHTML = `
        <h3>Based on your description: "${description}"</h3>
        
        <div class="style-suggestions">
            <h4>Style Recommendations</h4>
            <ul>
                ${styleSuggestions.map(item => `<li>${item}</li>`).join('')}
            </ul>
        </div>
        
        ${platformSuggestions.length > 0 ? `
            <div class="platform-suggestions">
                <h4>Shop These Looks</h4>
                ${platformSuggestions.map(platform => `
                    <div class="fashion-platform-card">
                        <div class="platform-header">
                            <img src="${platform.logo}" alt="${platform.platform}" class="platform-logo">
                            <div class="platform-name">${platform.platform}</div>
                        </div>
                        <div class="outfit-suggestions">
                            ${platform.items.map(item => `
                                <div class="outfit-suggestion">
                                    <div class="outfit-details">
                                        <div class="outfit-title">${item}</div>
                                        <div class="outfit-price">Check website for price</div>
                                        <a href="https://www.${platform.platform.toLowerCase()}.com" target="_blank" class="outfit-link">Shop Now →</a>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        ` : ''}
    `;
    
    showModal();
});

// Save Look
function saveLook() {
    const look = {
        id: Date.now(),
        colors: {
            top: document.getElementById('top-color').value,
            bottom: document.getElementById('bottom-color').value,
            shoes: document.getElementById('shoes-color').value,
            accessory: document.getElementById('accessory-color').value
        },
        description: descriptionInput.value,
        style: getStyleFromDescription(descriptionInput.value),
        season: getSeasonFromDescription(descriptionInput.value),
        occasion: getOccasionFromDescription(descriptionInput.value),
        date: new Date().toLocaleDateString()
    };
    
    // Get existing looks
    const savedLooks = JSON.parse(localStorage.getItem('savedLooks') || '[]');
    savedLooks.push(look);
    localStorage.setItem('savedLooks', JSON.stringify(savedLooks));
    
    // Show save animation
    saveLookBtn.textContent = 'Saved!';
    saveLookBtn.style.backgroundColor = '#28a745';
    setTimeout(() => {
        saveLookBtn.textContent = 'Save Look';
        saveLookBtn.style.backgroundColor = '';
    }, 2000);
    
    // Refresh saved looks display
    displaySavedLooks();
}

// Helper functions for look categorization
function getStyleFromDescription(description) {
    const styles = ['casual', 'elegant', 'bohemian', 'vintage', 'minimalist', 'sporty', 'streetwear'];
    const lowerDesc = description.toLowerCase();
    return styles.find(style => lowerDesc.includes(style)) || 'casual';
}

function getSeasonFromDescription(description) {
    const seasons = ['summer', 'winter', 'spring', 'fall'];
    const lowerDesc = description.toLowerCase();
    return seasons.find(season => lowerDesc.includes(season)) || 'all-season';
}

function getOccasionFromDescription(description) {
    const occasions = ['party', 'business', 'beach', 'formal', 'casual'];
    const lowerDesc = description.toLowerCase();
    return occasions.find(occasion => lowerDesc.includes(occasion)) || 'casual';
}

saveLookBtn.addEventListener('click', saveLook);

// Display Saved Looks
function displaySavedLooks() {
    const savedLooks = JSON.parse(localStorage.getItem('savedLooks') || '[]');
    
    savedLooksGrid.innerHTML = savedLooks.map(look => `
        <div class="look-card" data-id="${look.id}">
            <div class="look-header">
                <div class="look-meta">
                    <span class="look-style">${look.style}</span>
                    <span class="look-season">${look.season}</span>
                    <span class="look-occasion">${look.occasion}</span>
                </div>
                <div class="look-date">${look.date}</div>
            </div>
            <div class="look-preview">
                <div class="preview-top" style="background-color: ${look.colors.top}"></div>
                <div class="preview-bottom" style="background-color: ${look.colors.bottom}"></div>
                <div class="preview-shoes" style="background-color: ${look.colors.shoes}"></div>
                <div class="preview-accessory" style="background-color: ${look.colors.accessory}"></div>
            </div>
            <div class="look-details">
                <p class="look-description">${look.description}</p>
                <div class="look-actions">
                    <button class="btn btn-secondary edit-look" data-id="${look.id}">Edit</button>
                    <button class="btn btn-secondary delete-look" data-id="${look.id}">Delete</button>
                    <button class="btn btn-primary get-similar" data-id="${look.id}">Get Similar</button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Add delete functionality
    document.querySelectorAll('.delete-look').forEach(button => {
        button.addEventListener('click', (e) => {
            const lookId = parseInt(e.target.dataset.id);
            const savedLooks = JSON.parse(localStorage.getItem('savedLooks') || '[]');
            const updatedLooks = savedLooks.filter(look => look.id !== lookId);
            localStorage.setItem('savedLooks', JSON.stringify(updatedLooks));
            displaySavedLooks();
        });
    });

    // Add edit functionality
    document.querySelectorAll('.edit-look').forEach(button => {
        button.addEventListener('click', (e) => {
            const lookId = parseInt(e.target.dataset.id);
            const savedLooks = JSON.parse(localStorage.getItem('savedLooks') || '[]');
            const look = savedLooks.find(l => l.id === lookId);
            if (look) {
                // Switch to create look section
                document.querySelector('[data-section="create-look"]').click();
                // Fill in the form
                document.getElementById('top-color').value = look.colors.top;
                document.getElementById('bottom-color').value = look.colors.bottom;
                document.getElementById('shoes-color').value = look.colors.shoes;
                document.getElementById('accessory-color').value = look.colors.accessory;
                descriptionInput.value = look.description;
                // Trigger color updates
                document.querySelectorAll('input[type="color"]').forEach(input => {
                    input.dispatchEvent(new Event('input'));
                });
            }
        });
    });

    // Add get similar functionality
    document.querySelectorAll('.get-similar').forEach(button => {
        button.addEventListener('click', (e) => {
            const lookId = parseInt(e.target.dataset.id);
            const savedLooks = JSON.parse(localStorage.getItem('savedLooks') || '[]');
            const look = savedLooks.find(l => l.id === lookId);
            if (look) {
                descriptionInput.value = look.description;
                getRecommendationsBtn.click();
            }
        });
    });
}

// Initialize
displaySavedLooks();

// Export Look as Image (Bonus Feature)
function exportLook() {
    const outfitPreview = document.querySelector('.outfit-preview');
    
    html2canvas(outfitPreview).then(canvas => {
        const link = document.createElement('a');
        link.download = 'my-outfit.png';
        link.href = canvas.toDataURL();
        link.click();
    });
}

// Add export button if html2canvas is available
if (typeof html2canvas !== 'undefined') {
    const exportBtn = document.createElement('button');
    exportBtn.className = 'btn btn-secondary';
    exportBtn.textContent = 'Export Look';
    exportBtn.addEventListener('click', exportLook);
    document.querySelector('.action-buttons').appendChild(exportBtn);
} 