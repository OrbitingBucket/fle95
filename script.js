let currentScreen = 1;
const totalScreens = 10;
let consentGiven = false;
let selectedLanguage = 'en'; // Default language
let userName = '';
let surveyData = {
    ageRange: '',
    learningObjective: '',
    subObjectives: [],
    activityFormats: [],
    skillsToImprove: [],
    level: '',
    practiceTime: '',
    tutorChoice: ''
};

// Translation object
const translations = {
    en: {
        welcome: "Welcome!",
        welcomeText: "Help us personalize your French learning experience by participating in this quick survey.",
        consentText: "I consent to the collection and processing of my personal data for this survey. Read our",
        privacyPolicy: "Privacy Policy",
        chooseLanguage: "Choose Language",
        languageText: "Select your preferred language for this survey interface.",
        whatsYourName: "What's your name?",
        nameText: "Tell us your name so we can personalize your survey experience.",
        namePlaceholder: "Enter your name...",
        back: "Back",
        next: "Next",
        complete: "Complete",
        stepText: "Step",
        ofText: "of",
        surveyComplete: "Survey completed! Welcome"
    },
    fr: {
        welcome: "Bienvenue !",
        welcomeText: "Aidez-nous à personnaliser votre expérience d'apprentissage du français en participant à cette enquête rapide.",
        consentText: "Je consens à la collecte et au traitement de mes données personnelles pour cette enquête. Lisez notre",
        privacyPolicy: "Politique de confidentialité",
        chooseLanguage: "Choisir la langue",
        languageText: "Sélectionnez votre langue préférée pour cette interface d'enquête.",
        whatsYourName: "Quel est votre nom ?",
        nameText: "Dites-nous votre nom pour que nous puissions personnaliser votre expérience d'enquête.",
        namePlaceholder: "Entrez votre nom...",
        back: "Précédent",
        next: "Suivant",
        complete: "Terminer",
        stepText: "Étape",
        ofText: "sur",
        surveyComplete: "Enquête terminée ! Bienvenue"
    },
    ar: {
        welcome: "مرحباً!",
        welcomeText: "ساعدنا في تخصيص تجربة تعلم الفرنسية الخاصة بك من خلال المشاركة في هذا الاستطلاع السريع.",
        consentText: "أوافق على جمع ومعالجة بياناتي الشخصية لهذا الاستطلاع. اقرأ",
        privacyPolicy: "سياسة الخصوصية",
        chooseLanguage: "اختر اللغة",
        languageText: "اختر لغتك المفضلة لواجهة الاستطلاع هذه.",
        whatsYourName: "ما اسمك؟",
        nameText: "أخبرنا باسمك حتى نتمكن من تخصيص تجربة الاستطلاع الخاصة بك.",
        namePlaceholder: "أدخل اسمك الكامل",
        back: "رجوع",
        next: "التالي",
        complete: "إكمال",
        stepText: "خطوة",
        ofText: "من",
        surveyComplete: "تم إكمال الاستطلاع! مرحباً"
    }
};

// --- Elements ---
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const backBtn = document.getElementById('backBtn');
const nextBtn = document.getElementById('nextBtn');
const consentCheckbox = document.getElementById('consentCheckbox');
const languageOptions = document.querySelectorAll('.language-option');
const nameInput = document.getElementById('nameInput');

// =========================================
//  NEW CLIPPY ASSISTANT LOGIC
// =========================================
const clippy = document.getElementById('clippy');
const clippyModalOverlay = document.getElementById('clippy-modal-overlay');
const clippyModalCloseBtn = document.getElementById('clippy-modal-close-btn');

function showClippyModal() {
    if (clippyModalOverlay) {
        clippyModalOverlay.classList.remove('hidden');
    }
}

function hideClippyModal() {
    if (clippyModalOverlay) {
        clippyModalOverlay.classList.add('hidden');
    }
}

// =========================================
//  CORE SURVEY LOGIC
// =========================================

function setupEventListeners() {
    // Consent checkbox
    consentCheckbox.addEventListener('click', () => {
        consentGiven = !consentGiven;
        consentCheckbox.classList.toggle('checked', consentGiven);
        updateNavigationState();
    });

    // Language selection
    languageOptions.forEach(option => {
        option.addEventListener('click', () => {
            languageOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            selectedLanguage = option.dataset.lang;
            updateLanguage();
            updateNavigationState();
        });
    });

    // Name input
    nameInput.addEventListener('input', (e) => {
        userName = e.target.value.trim();
        updateNavigationState();
    });

    // Navigation buttons
    backBtn.addEventListener('click', goBack);
    nextBtn.addEventListener('click', goNext);

    // Survey option selection handlers
    setupSurveyOptionHandlers();
    
    // NEW: Clippy click listener to open the modal
    if (clippy) {
        clippy.addEventListener('click', showClippyModal);
    }
    
    // NEW: Listeners to close the Clippy modal
    if (clippyModalCloseBtn) {
        clippyModalCloseBtn.addEventListener('click', hideClippyModal);
    }
    if (clippyModalOverlay) {
        clippyModalOverlay.addEventListener('click', (event) => {
            // Close only if the dark overlay itself is clicked, not the window
            if (event.target === clippyModalOverlay) {
                hideClippyModal();
            }
        });
    }
}

function setupSurveyOptionHandlers() {
    document.querySelectorAll('.option-item').forEach(option => {
        option.addEventListener('click', function() {
            const screen = this.closest('.screen');
            const container = this.closest('.options-container, .tutor-options');
            const isMultipleSelect = container.classList.contains('multiple-select');
            const group = container.dataset.group;

            if (isMultipleSelect) {
                this.classList.toggle('selected');
            } else {
                if (group) {
                    container.querySelectorAll('.option-item').forEach(opt => opt.classList.remove('selected'));
                } else {
                    screen.querySelectorAll('.option-item').forEach(opt => opt.classList.remove('selected'));
                }
                this.classList.add('selected');
            }
            updateSurveyData();
            updateNavigationState();
        });
    });
}

function updateSurveyData() {
    const getSelectedValue = (selector) => document.querySelector(selector)?.dataset.value || '';
    const getMultipleSelectedValues = (selector) => Array.from(document.querySelectorAll(selector)).map(item => item.dataset.value);

    surveyData.ageRange = getSelectedValue('#screen4 .option-item.selected');
    surveyData.learningObjective = getSelectedValue('#screen5 .option-item.selected');
    surveyData.subObjectives = getMultipleSelectedValues('#screen6 .option-item.selected');
    surveyData.activityFormats = getMultipleSelectedValues('#screen7 .option-item.selected');
    surveyData.skillsToImprove = getMultipleSelectedValues('#screen8 .option-item.selected');
    surveyData.level = getSelectedValue('#screen9 [data-group="level"] .option-item.selected');
    surveyData.practiceTime = getSelectedValue('#screen9 [data-group="time"] .option-item.selected');
    surveyData.tutorChoice = getSelectedValue('#screen10 .option-item.selected');
}

function canProceedFromCurrentScreen() {
    switch (currentScreen) {
        case 1:  return consentGiven;
        case 2:  return selectedLanguage !== '';
        case 3:  return userName !== '';
        case 4:  return surveyData.ageRange !== '';
        case 5:  return surveyData.learningObjective !== '';
        case 6:  return surveyData.learningObjective !== 'employment' || surveyData.subObjectives.length > 0;
        case 7:  return surveyData.activityFormats.length > 0;
        case 8:  return surveyData.skillsToImprove.length > 0;
        case 9:  return surveyData.level !== '' && surveyData.practiceTime !== '';
        case 10: return surveyData.tutorChoice !== '';
        default: return false;
    }
}

function goBack() {
    if (currentScreen > 1) {
        currentScreen--;
        if (currentScreen === 6 && surveyData.learningObjective !== 'employment') {
            currentScreen--;
        }
        showScreen();
        updateProgress();
        updateNavigationState();
    }
}

function goNext() {
    if (currentScreen < totalScreens) {
        currentScreen++;
        if (currentScreen === 6 && surveyData.learningObjective !== 'employment') {
            currentScreen++;
        }
        showScreen();
        updateProgress();
        updateNavigationState();
    } else {
        completeSurvey();
    }
}

function showScreen() {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
        screen.style.display = 'none';
    });

    const currentScreenElement = document.getElementById(`screen${currentScreen}`);
    if (currentScreenElement) {
        currentScreenElement.classList.add('active');
        currentScreenElement.style.display = 'flex';
    }

    updateScreenContent();
}

function updateScreenContent() {
    const screen6 = document.getElementById('screen6');
    if (screen6) {
        screen6.style.display = (surveyData.learningObjective === 'employment' && currentScreen === 6) ? 'flex' : 'none';
    }
}

function updateProgress() {
    let effectiveTotal = totalScreens;
    let effectiveCurrent = currentScreen;

    if (surveyData.learningObjective !== 'employment') {
        effectiveTotal = totalScreens - 1;
        if (currentScreen > 6) {
            effectiveCurrent = currentScreen - 1;
        }
    }

    const progress = (effectiveCurrent / effectiveTotal) * 100;
    progressFill.style.width = `${progress}%`;

    const t = translations[selectedLanguage];
    progressText.textContent = `${t.stepText} ${effectiveCurrent} ${t.ofText} ${effectiveTotal}`;
}

function updateNavigationState() {
    updateSurveyData();
    const t = translations[selectedLanguage];

    backBtn.disabled = currentScreen === 1;
    // FIX: Target only the text span to avoid deleting the SVG icon
    backBtn.querySelector('span').textContent = t.back;

    const canProceed = canProceedFromCurrentScreen();
    nextBtn.disabled = !canProceed;

    // FIX: Target only the text span to avoid deleting the SVG icon
    const nextBtnText = nextBtn.querySelector('span');
    if (currentScreen === totalScreens && canProceed) {
        nextBtnText.textContent = t.complete;
    } else {
        nextBtnText.textContent = t.next;
    }
}

function updateLanguage() {
    const t = translations[selectedLanguage];

    document.querySelector('#screen1 h1').textContent = t.welcome;
    document.querySelector('#screen1 p').textContent = t.welcomeText;
    document.querySelector('.consent-text').innerHTML = `${t.consentText} <a href="#">${t.privacyPolicy}</a>`;

    document.querySelector('#screen2 h1').textContent = t.chooseLanguage;
    document.querySelector('#screen2 p').textContent = t.languageText;

    document.querySelector('#screen3 h1').textContent = t.whatsYourName;
    document.querySelector('#screen3 p').textContent = t.nameText;
    document.querySelector('#nameInput').placeholder = t.namePlaceholder;

    document.body.dir = (selectedLanguage === 'ar') ? 'rtl' : 'ltr';

    updateProgress();
    updateNavigationState();
}

function completeSurvey() {
    const summary = createSummary();
    showCompletionMessage(summary);
    console.log('Survey completed:', {
        consent: consentGiven,
        language: selectedLanguage,
        name: userName,
        surveyData: surveyData
    });
}

function createSummary() {
    return {
        name: userName,
        language: selectedLanguage,
        age: surveyData.ageRange,
        objective: surveyData.learningObjective,
        level: surveyData.level,
        time: surveyData.practiceTime,
        tutor: surveyData.tutorChoice,
    };
}

function showCompletionMessage(summary) {
    const t = translations[selectedLanguage];
    const message = `
        ${t.surveyComplete} ${summary.name}!

        Your preferences have been saved.
        - Language: ${summary.language.toUpperCase()}
        - Objective: ${summary.objective}
        - Level: ${summary.level}
        - Tutor Style: ${summary.tutor}

        Thank you for your participation!
    `;
    alert(message); // Classic alert box for a retro feel!
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', function() {
    document.querySelector(`.language-option[data-lang="${selectedLanguage}"]`).classList.add('selected');
    
    setupEventListeners();
    updateProgress();
    updateLanguage();
    updateNavigationState();
    showScreen();
});