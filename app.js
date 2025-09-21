// Application Data
const appData = {
  emotionCategories: ["😊 Happy", "😢 Sad", "😰 Anxious", "😡 Angry", "😐 Neutral", "😴 Tired", "😌 Calm", "😓 Stressed"],
  copingStrategies: [
    {"name": "Deep Breathing", "description": "4-7-8 breathing technique for immediate anxiety relief", "duration": "5 minutes"},
    {"name": "Grounding Exercise", "description": "5-4-3-2-1 technique to reconnect with the present moment", "duration": "3 minutes"},
    {"name": "Progressive Muscle Relaxation", "description": "Systematically tense and relax muscle groups", "duration": "10 minutes"},
    {"name": "Mindful Walking", "description": "Gentle movement with awareness", "duration": "15 minutes"},
    {"name": "Journaling", "description": "Express thoughts and feelings through writing", "duration": "10 minutes"}
  ],
  crisisResources: [
    {"name": "Crisis Text Line", "contact": "Text HOME to 741741", "description": "24/7 crisis support via text"},
    {"name": "National Suicide Prevention Lifeline", "contact": "988", "description": "24/7 phone support"},
    {"name": "Trevor Project", "contact": "1-866-488-7386", "description": "LGBTQ youth crisis support"},
    {"name": "Teen Helpline", "contact": "1-800-852-8336", "description": "Support specifically for teens"}
  ],
  sampleNotifications: [
    {"time": "09:00", "message": "Good morning! How are you feeling today? 🌅", "type": "check-in"},
    {"time": "12:00", "message": "Midday check-in: Take a moment to breathe and notice how you're doing 💙", "type": "check-in"},
    {"time": "15:00", "message": "Afternoon reminder: Remember to be kind to yourself today ✨", "type": "motivation"},
    {"time": "18:00", "message": "Evening reflection: What's one thing that went well today? 🌟", "type": "reflection"},
    {"time": "21:00", "message": "Winding down: Consider trying a brief relaxation exercise 🌙", "type": "coping"}
  ],
  conversationStarters: [
    "Hi there! I'm here to listen and support you. How are you feeling right now?",
    "I'm glad you're here. What's on your mind today?",
    "Welcome back! I'm here whenever you need to talk.",
    "Hello! I'm your wellness companion. What would you like to chat about?"
  ],
  emotionResponses: {
    "happy": ["That's wonderful to hear! What's contributing to these positive feelings?", "I'm so glad you're feeling good! Want to share what's going well?"],
    "sad": ["I hear that you're going through a tough time. You're not alone in this.", "It's okay to feel sad sometimes. Would you like to talk about what's happening?"],
    "anxious": ["Anxiety can be really overwhelming. Let's take this one step at a time.", "I understand you're feeling anxious. Would some breathing exercises help right now?"],
    "angry": ["Those angry feelings are valid. It sounds like something really bothered you.", "Anger can be intense. Want to talk about what triggered these feelings?"],
    "neutral": ["Thanks for checking in. Sometimes neutral is exactly where we need to be.", "How has your day been overall?"],
    "tired": ["It sounds like you're feeling drained. Rest is important for your wellbeing.", "Being tired can affect how we feel. Have you been getting enough sleep?"],
    "calm": ["That's lovely to hear. It's wonderful when we can find moments of peace.", "I'm glad you're feeling calm right now. What's helping you feel this way?"],
    "stressed": ["Stress can be really challenging to deal with. You're taking a good step by checking in.", "I hear that you're feeling stressed. What's been weighing on your mind?"]
  }
};

// Application State
let appState = {
  currentUser: null,
  emotionLogs: [],
  chatHistory: [],
  notifications: [],
  settings: {
    enableNotifications: true,
    enableMotivational: true,
    enableCoping: true
  },
  currentEmotion: null,
  emotionChart: null
};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing app...');
  initializeApp();
});

function initializeApp() {
  console.log('Initializing app...');
  loadStoredData();
  setupEventListeners();
  populateResources();
  updateDashboard();
  initializeNotifications();
  
  // Setup emotion chart after a small delay to ensure canvas is ready
  setTimeout(() => {
    setupEmotionChart();
  }, 100);
  
  showSection('dashboard');
}

// Event Listeners
function setupEventListeners() {
  console.log('Setting up event listeners...');
  
  // Navigation
  const navButtons = document.querySelectorAll('.nav-btn');
  console.log('Found nav buttons:', navButtons.length);
  
  navButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const section = e.target.getAttribute('data-section');
      console.log('Nav clicked:', section);
      showSection(section);
    });
  });

  // Chat
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');
  
  if (chatInput && sendBtn) {
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
      }
    });
    
    chatInput.addEventListener('input', detectEmotionFromInput);
    sendBtn.addEventListener('click', (e) => {
      e.preventDefault();
      sendMessage();
    });
  }

  // Emotions
  const emotionButtons = document.querySelectorAll('.emotion-btn');
  emotionButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const emotion = e.target.getAttribute('data-emotion');
      if (emotion) {
        selectEmotion(emotion, e.target);
      }
    });
  });

  const intensitySlider = document.getElementById('intensitySlider');
  if (intensitySlider) {
    intensitySlider.addEventListener('input', (e) => {
      document.getElementById('intensityValue').textContent = e.target.value;
    });
  }

  const logEmotionBtn = document.getElementById('logEmotionBtn');
  if (logEmotionBtn) {
    logEmotionBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logEmotion();
    });
  }

  // Crisis button
  const crisisBtn = document.getElementById('crisisBtn');
  if (crisisBtn) {
    crisisBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showCrisisModal();
    });
  }

  // Settings checkboxes
  const notificationCheckboxes = document.querySelectorAll('#notifications input[type="checkbox"]');
  notificationCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', updateNotificationSettings);
  });
  
  console.log('Event listeners setup complete');
}

// Navigation
function showSection(sectionId) {
  console.log('Showing section:', sectionId);
  
  // Hide all sections
  const sections = document.querySelectorAll('.app-section');
  sections.forEach(section => {
    section.classList.remove('active');
  });

  // Show selected section
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.add('active');
  }

  // Update navigation
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach(btn => {
    btn.classList.remove('active');
  });
  
  const activeNavBtn = document.querySelector(`[data-section="${sectionId}"]`);
  if (activeNavBtn) {
    activeNavBtn.classList.add('active');
  }

  // Update specific section content
  if (sectionId === 'emotions') {
    updateEmotionChart();
    updateEmotionHistory();
  } else if (sectionId === 'notifications') {
    updateNotificationTimeline();
  }
}

// Chat Functionality
function sendMessage() {
  const chatInput = document.getElementById('chatInput');
  const message = chatInput.value.trim();
  
  if (!message) return;

  // Add user message
  addMessage(message, 'user');
  chatInput.value = '';
  
  // Clear emotion detection
  const detectedEmotionDiv = document.getElementById('detectedEmotion');
  if (detectedEmotionDiv) {
    detectedEmotionDiv.textContent = '';
  }
  
  // Show typing indicator
  showTypingIndicator();
  
  // Generate bot response
  setTimeout(() => {
    const response = generateBotResponse(message);
    hideTypingIndicator();
    addMessage(response, 'bot');
    
    // Log emotion if detected
    const detectedEmotion = detectEmotionFromText(message);
    if (detectedEmotion) {
      logDetectedEmotion(detectedEmotion, message);
    }
    
    // Update activity
    addActivity(`Had a chat conversation`, new Date());
    updateDashboard();
  }, 1500 + Math.random() * 1000);
}

function addMessage(content, sender) {
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages) return;
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender}-message`;
  
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  messageDiv.innerHTML = `
    <div class="message-content">
      <p>${content}</p>
    </div>
    <div class="message-time">${timeString}</div>
  `;
  
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  // Store in chat history
  appState.chatHistory.push({
    content,
    sender,
    timestamp: now
  });
  
  saveData();
}

function showTypingIndicator() {
  const indicator = document.getElementById('typingIndicator');
  if (indicator) {
    indicator.classList.remove('hidden');
  }
}

function hideTypingIndicator() {
  const indicator = document.getElementById('typingIndicator');
  if (indicator) {
    indicator.classList.add('hidden');
  }
}

function generateBotResponse(userMessage) {
  const detectedEmotion = detectEmotionFromText(userMessage);
  const lowerMessage = userMessage.toLowerCase();
  
  // Crisis keywords
  const crisisKeywords = ['suicide', 'kill myself', 'end it all', 'hurt myself', 'no point', 'give up', 'can\'t go on'];
  const hasCrisisKeyword = crisisKeywords.some(keyword => lowerMessage.includes(keyword));
  
  if (hasCrisisKeyword) {
    return "I'm really concerned about you right now. Please know that you're not alone and there are people who want to help. Would you like me to share some crisis resources with you? Remember, you can always call 988 for immediate support. 💙";
  }
  
  // Emotion-based responses
  if (detectedEmotion && appData.emotionResponses[detectedEmotion]) {
    const responses = appData.emotionResponses[detectedEmotion];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // General supportive responses
  const generalResponses = [
    "Thank you for sharing that with me. I'm here to listen and support you.",
    "I appreciate you opening up. How can I best support you right now?",
    "It sounds like you have a lot on your mind. I'm here for you.",
    "I want you to know that your feelings are valid and you're not alone in this.",
    "That takes courage to share. What would be most helpful for you right now?"
  ];
  
  return generalResponses[Math.floor(Math.random() * generalResponses.length)];
}

function detectEmotionFromInput() {
  const input = document.getElementById('chatInput');
  const detectedEmotionDiv = document.getElementById('detectedEmotion');
  
  if (!input || !detectedEmotionDiv) return;
  
  const emotion = detectEmotionFromText(input.value);
  
  if (emotion) {
    detectedEmotionDiv.textContent = `Detected emotion: ${emotion} 🎯`;
    detectedEmotionDiv.style.display = 'block';
  } else {
    detectedEmotionDiv.style.display = 'none';
  }
}

function detectEmotionFromText(text) {
  const lowerText = text.toLowerCase();
  
  const emotionKeywords = {
    happy: ['happy', 'joy', 'great', 'awesome', 'amazing', 'excited', 'wonderful', 'fantastic', 'good', 'smile', 'laugh'],
    sad: ['sad', 'down', 'depressed', 'upset', 'crying', 'tears', 'hurt', 'pain', 'lonely', 'empty'],
    anxious: ['anxious', 'worried', 'nervous', 'scared', 'afraid', 'panic', 'stress', 'overwhelmed', 'fear'],
    angry: ['angry', 'mad', 'furious', 'rage', 'hate', 'annoyed', 'frustrated', 'irritated'],
    tired: ['tired', 'exhausted', 'drained', 'sleepy', 'fatigue', 'weary'],
    calm: ['calm', 'peaceful', 'relaxed', 'serene', 'tranquil', 'zen'],
    stressed: ['stressed', 'pressure', 'overwhelmed', 'busy', 'chaotic', 'hectic']
  };
  
  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return emotion;
    }
  }
  
  return null;
}

function logDetectedEmotion(emotion, context) {
  const emotionLog = {
    emotion: emotion,
    intensity: 5, // Default intensity for detected emotions
    timestamp: new Date(),
    notes: `Detected from chat: "${context.substring(0, 50)}..."`,
    source: 'chat'
  };
  
  appState.emotionLogs.push(emotionLog);
  saveData();
  updateDashboard();
}

// Emotion Tracking
function selectEmotion(emotion, element) {
  // Clear previous selections
  document.querySelectorAll('.emotion-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
  
  // Select current emotion
  if (element) {
    element.classList.add('selected');
  }
  appState.currentEmotion = emotion;
}

function logEmotion() {
  if (!appState.currentEmotion) {
    alert('Please select an emotion first');
    return;
  }
  
  const intensitySlider = document.getElementById('intensitySlider');
  const emotionNotes = document.getElementById('emotionNotes');
  
  const intensity = intensitySlider ? intensitySlider.value : 5;
  const notes = emotionNotes ? emotionNotes.value : '';
  
  const emotionLog = {
    emotion: appState.currentEmotion,
    intensity: parseInt(intensity),
    timestamp: new Date(),
    notes: notes,
    source: 'manual'
  };
  
  appState.emotionLogs.push(emotionLog);
  saveData();
  
  // Clear form
  document.querySelectorAll('.emotion-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
  
  if (intensitySlider) {
    intensitySlider.value = 5;
    const intensityValue = document.getElementById('intensityValue');
    if (intensityValue) {
      intensityValue.textContent = '5';
    }
  }
  
  if (emotionNotes) {
    emotionNotes.value = '';
  }
  
  appState.currentEmotion = null;
  
  // Update displays
  updateDashboard();
  updateEmotionHistory();
  updateEmotionChart();
  
  // Add activity
  addActivity(`Logged emotion: ${emotionLog.emotion}`, new Date());
  
  alert('Emotion logged successfully! 💙');
}

function updateEmotionHistory() {
  const historyContainer = document.getElementById('emotionHistory');
  if (!historyContainer) return;
  
  if (appState.emotionLogs.length === 0) {
    historyContainer.innerHTML = '<p class="text-secondary">No emotions logged yet. Start tracking your feelings above!</p>';
    return;
  }
  
  const recentLogs = appState.emotionLogs.slice(-10).reverse();
  
  historyContainer.innerHTML = recentLogs.map(log => {
    const timeString = new Date(log.timestamp).toLocaleString();
    const emotionEmoji = getEmotionEmoji(log.emotion);
    
    return `
      <div class="history-item">
        <div>
          <div class="history-emotion">${emotionEmoji} ${capitalizeFirst(log.emotion)} (${log.intensity}/10)</div>
          ${log.notes ? `<div class="history-notes">"${log.notes}"</div>` : ''}
        </div>
        <div class="history-time">${timeString}</div>
      </div>
    `;
  }).join('');
}

function setupEmotionChart() {
  const chartCanvas = document.getElementById('emotionChart');
  if (!chartCanvas) {
    console.log('Emotion chart canvas not found');
    return;
  }
  
  const ctx = chartCanvas.getContext('2d');
  appState.emotionChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Emotion Intensity',
        data: [],
        borderColor: '#1FB8CD',
        backgroundColor: 'rgba(31, 184, 205, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 10,
          title: {
            display: true,
            text: 'Intensity (1-10)'
          }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
  
  updateEmotionChart();
}

function updateEmotionChart() {
  if (!appState.emotionChart) return;
  
  const last7Days = getLast7DaysData();
  appState.emotionChart.data.labels = last7Days.map(day => day.label);
  appState.emotionChart.data.datasets[0].data = last7Days.map(day => day.avgIntensity);
  appState.emotionChart.update();
}

function getLast7DaysData() {
  const days = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    const dayLogs = appState.emotionLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate.toDateString() === date.toDateString();
    });
    
    const avgIntensity = dayLogs.length > 0 
      ? dayLogs.reduce((sum, log) => sum + log.intensity, 0) / dayLogs.length
      : 0;
    
    days.push({
      label: date.toLocaleDateString([], { weekday: 'short' }),
      avgIntensity: Math.round(avgIntensity * 10) / 10
    });
  }
  
  return days;
}

// Dashboard Updates
function updateDashboard() {
  updateCurrentMood();
  updateActivityList();
  updateNextCheckin();
}

function updateCurrentMood() {
  const currentMoodDiv = document.getElementById('currentMood');
  const moodTimeDiv = document.getElementById('moodTime');
  
  if (!currentMoodDiv || !moodTimeDiv) return;
  
  if (appState.emotionLogs.length > 0) {
    const latestEmotion = appState.emotionLogs[appState.emotionLogs.length - 1];
    const emoji = getEmotionEmoji(latestEmotion.emotion);
    currentMoodDiv.textContent = `${emoji} ${capitalizeFirst(latestEmotion.emotion)}`;
    moodTimeDiv.textContent = `Last updated: ${new Date(latestEmotion.timestamp).toLocaleString()}`;
  }
}

function updateActivityList() {
  const activityList = document.getElementById('activityList');
  if (!activityList) return;
  
  if (appState.notifications.length === 0) {
    activityList.innerHTML = '<p class="text-secondary">No recent activity</p>';
    return;
  }
  
  const recentActivity = appState.notifications.slice(-3).reverse();
  activityList.innerHTML = recentActivity.map(activity => 
    `<div class="activity-item">
      <div>${activity.message}</div>
      <div class="activity-time">${new Date(activity.timestamp).toLocaleTimeString()}</div>
    </div>`
  ).join('');
}

function updateNextCheckin() {
  const nextCheckinDiv = document.getElementById('nextCheckin');
  if (!nextCheckinDiv) return;
  
  const now = new Date();
  const nextHour = new Date(now);
  nextHour.setHours(now.getHours() + 1, 0, 0, 0);
  
  const timeDiff = nextHour - now;
  const minutes = Math.floor(timeDiff / 60000);
  
  nextCheckinDiv.textContent = `In ${minutes} minutes`;
}

function addActivity(message, timestamp) {
  appState.notifications.push({
    message,
    timestamp,
    type: 'activity'
  });
  saveData();
}

// Notifications
function initializeNotifications() {
  populateNotificationTimeline();
  simulateHourlyNotifications();
}

function populateNotificationTimeline() {
  const timeline = document.getElementById('notificationTimeline');
  if (!timeline) return;
  
  const now = new Date();
  
  timeline.innerHTML = appData.sampleNotifications.map((notification, index) => {
    const [hours, minutes] = notification.time.split(':');
    const notificationTime = new Date();
    notificationTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const isPast = notificationTime < now;
    const isCompleted = isPast && Math.random() > 0.3; // Simulate some completed check-ins
    
    return `
      <div class="timeline-item ${isCompleted ? 'completed' : ''}">
        <div class="timeline-time">${notification.time}</div>
        <div class="timeline-message">${notification.message}</div>
        <div class="timeline-type">${notification.type}</div>
      </div>
    `;
  }).join('');
}

function updateNotificationTimeline() {
  populateNotificationTimeline();
}

function simulateHourlyNotifications() {
  // Add a simulated notification every 30 seconds for demo purposes
  setInterval(() => {
    if (appState.settings.enableNotifications) {
      const notifications = [
        "Time for a quick check-in! How are you feeling? 💙",
        "Remember to take a deep breath and be kind to yourself ✨",
        "You're doing great today! Keep it up 🌟",
        "Consider taking a short break to relax 🌙"
      ];
      
      const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
      addActivity(randomNotification, new Date());
      updateActivityList();
    }
  }, 30000); // Every 30 seconds for demo
}

function updateNotificationSettings() {
  const enableNotifications = document.getElementById('enableNotifications');
  const enableMotivational = document.getElementById('enableMotivational');
  const enableCoping = document.getElementById('enableCoping');
  
  appState.settings = {
    enableNotifications: enableNotifications ? enableNotifications.checked : true,
    enableMotivational: enableMotivational ? enableMotivational.checked : true,
    enableCoping: enableCoping ? enableCoping.checked : true
  };
  
  saveData();
}

// Resources
function populateResources() {
  populateCopingStrategies();
  populateCrisisResources();
}

function populateCopingStrategies() {
  const copingList = document.getElementById('copingList');
  if (!copingList) return;
  
  copingList.innerHTML = appData.copingStrategies.map(strategy => `
    <div class="coping-item" onclick="startCopingStrategy('${strategy.name}')">
      <div class="coping-name">${strategy.name}</div>
      <div class="coping-description">${strategy.description}</div>
      <div class="coping-duration">Duration: ${strategy.duration}</div>
    </div>
  `).join('');
}

function populateCrisisResources() {
  const crisisList = document.getElementById('crisisList');
  const crisisResourcesModal = document.getElementById('crisisResourcesModal');
  
  const resourcesHTML = appData.crisisResources.map(resource => `
    <div class="crisis-item">
      <div class="crisis-name">${resource.name}</div>
      <div class="crisis-contact">${resource.contact}</div>
      <div class="crisis-description">${resource.description}</div>
    </div>
  `).join('');
  
  if (crisisList) {
    crisisList.innerHTML = resourcesHTML;
  }
  if (crisisResourcesModal) {
    crisisResourcesModal.innerHTML = resourcesHTML;
  }
}

function startCopingStrategy(strategyName) {
  const strategy = appData.copingStrategies.find(s => s.name === strategyName);
  if (strategy) {
    alert(`Starting ${strategy.name}\n\n${strategy.description}\n\nDuration: ${strategy.duration}\n\nTake your time and focus on yourself. 💙`);
    addActivity(`Started coping strategy: ${strategy.name}`, new Date());
  }
}

// Modals
function showCrisisModal() {
  const modal = document.getElementById('crisisModal');
  if (modal) {
    modal.classList.remove('hidden');
  }
}

function closeCrisisModal() {
  const modal = document.getElementById('crisisModal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

function showQuickMoodCheck() {
  const modal = document.getElementById('quickMoodModal');
  if (modal) {
    modal.classList.remove('hidden');
  }
}

function closeQuickMoodModal() {
  const modal = document.getElementById('quickMoodModal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

function quickMoodSelect(emotion) {
  const emotionLog = {
    emotion: emotion,
    intensity: 5,
    timestamp: new Date(),
    notes: 'Quick check-in from dashboard',
    source: 'quick'
  };
  
  appState.emotionLogs.push(emotionLog);
  saveData();
  updateDashboard();
  closeQuickMoodModal();
  
  const emoji = getEmotionEmoji(emotion);
  alert(`Thanks for checking in! You selected: ${emoji} ${capitalizeFirst(emotion)}`);
}

// Settings Functions
function saveProfile() {
  const nameInput = document.getElementById('userName');
  const ageInput = document.getElementById('userAge');
  
  const name = nameInput ? nameInput.value : '';
  const age = ageInput ? ageInput.value : '';
  
  if (name && age) {
    appState.currentUser = { name, age };
    saveData();
    alert('Profile saved successfully! 💙');
  } else {
    alert('Please fill in both name and age');
  }
}

function saveEmergencyContact() {
  const nameInput = document.getElementById('emergencyName');
  const phoneInput = document.getElementById('emergencyPhone');
  
  const name = nameInput ? nameInput.value : '';
  const phone = phoneInput ? phoneInput.value : '';
  
  if (name && phone) {
    appState.emergencyContact = { name, phone };
    saveData();
    alert('Emergency contact saved successfully! 💙');
  } else {
    alert('Please fill in both name and phone number');
  }
}

function exportData() {
  const data = JSON.stringify(appState, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mindbuddy-data.json';
  a.click();
  
  URL.revokeObjectURL(url);
}

function clearData() {
  if (confirm('Are you sure you want to clear all your data? This cannot be undone.')) {
    appState = {
      currentUser: null,
      emotionLogs: [],
      chatHistory: [],
      notifications: [],
      settings: {
        enableNotifications: true,
        enableMotivational: true,
        enableCoping: true
      },
      currentEmotion: null,
      emotionChart: null
    };
    
    // Reset UI
    location.reload();
  }
}

// Data Persistence (Note: localStorage is not available in sandbox, but keeping for functionality)
function saveData() {
  try {
    const dataToSave = {
      currentUser: appState.currentUser,
      emotionLogs: appState.emotionLogs,
      chatHistory: appState.chatHistory,
      notifications: appState.notifications,
      settings: appState.settings,
      emergencyContact: appState.emergencyContact
    };
    // localStorage.setItem('mindbuddy-data', JSON.stringify(dataToSave));
  } catch (e) {
    // Handle case where localStorage is not available
    console.log('Data saving not available in this environment');
  }
}

function loadStoredData() {
  try {
    // const stored = localStorage.getItem('mindbuddy-data');
    // if (stored) {
    //   const data = JSON.parse(stored);
    //   appState = { ...appState, ...data };
    // }
  } catch (e) {
    console.log('Data loading not available in this environment');
  }
}

// Utility Functions
function getEmotionEmoji(emotion) {
  const emojiMap = {
    happy: '😊',
    sad: '😢',
    anxious: '😰',
    angry: '😡',
    neutral: '😐',
    tired: '😴',
    calm: '😌',
    stressed: '😓'
  };
  
  return emojiMap[emotion] || '😐';
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Global functions for onclick handlers
window.showSection = showSection;
window.showQuickMoodCheck = showQuickMoodCheck;
window.closeQuickMoodModal = closeQuickMoodModal;
window.quickMoodSelect = quickMoodSelect;
window.showCrisisModal = showCrisisModal;
window.closeCrisisModal = closeCrisisModal;
window.saveProfile = saveProfile;
window.saveEmergencyContact = saveEmergencyContact;
window.exportData = exportData;
window.clearData = clearData;
window.startCopingStrategy = startCopingStrategy;